const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { serializeSubscription } = require('../lib/subscription');
const { PLANS, getPlanPriceEnv, getPublicPlans } = require('../lib/plans');

const router = express.Router();
const prisma = new PrismaClient();
const isTestPaymentsEnabled = () => (
  process.env.TEST_PAYMENTS_ENABLED === 'true'
  || (process.env.TEST_PAYMENTS_ENABLED !== 'false' && !process.env.STRIPE_SECRET_KEY)
);

const stripeRequest = async (path, options = {}) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error('Stripe is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Stripe request failed');
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

const appendParam = (params, key, value) => {
  if (value !== undefined && value !== null) params.append(key, String(value));
};

const verifyStripeSignature = (rawBody, signatureHeader) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signatureHeader) return false;

  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (!acc[key]) acc[key] = [];
    acc[key].push(value);
    return acc;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || signatures.length === 0) return false;

  const ageInSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageInSeconds) || ageInSeconds > 300) return false;

  const digest = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');

  return signatures.some((signature) => {
    const actual = Buffer.from(signature, 'hex');
    const expected = Buffer.from(digest, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  });
};

const planFromSubscription = (subscription) => {
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  const match = PLANS.find((plan) => (
    Object.values(plan.priceEnvs || {}).some((priceEnv) => process.env[priceEnv] === priceId)
  ));
  return subscription?.metadata?.plan || match?.id || 'free';
};

const syncStripeSubscription = async (subscription) => {
  const userId = subscription?.metadata?.userId;
  const stripeCustomerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  let existing = userId
    ? await prisma.subscription.findUnique({ where: { userId } })
    : null;

  if (!existing && stripeCustomerId) {
    existing = await prisma.subscription.findFirst({ where: { stripeCustomerId } });
  }
  if (!existing) return;

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      plan: planFromSubscription(subscription),
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    },
  });
};

const webhookHandler = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (!verifyStripeSignature(req.body, signature)) {
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  try {
    const event = JSON.parse(req.body.toString('utf8'));

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const subscription = await stripeRequest(`/subscriptions/${session.subscription}`, {
          method: 'GET',
        });
        await syncStripeSubscription(subscription);
      }
    }

    if (
      event.type === 'customer.subscription.created'
      || event.type === 'customer.subscription.updated'
      || event.type === 'customer.subscription.deleted'
    ) {
      await syncStripeSubscription(event.data.object);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failed:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

router.get('/plans', (req, res) => {
  res.json({ plans: getPublicPlans(), testMode: isTestPaymentsEnabled() });
});

router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, subscription: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      ...serializeSubscription(user.subscription, user.role),
      billingProvider: user.subscription?.stripeSubscriptionId?.startsWith('test_')
        ? 'test'
        : user.subscription?.stripeSubscriptionId ? 'stripe' : null,
    });
  } catch (error) {
    console.error('Subscription lookup failed:', error);
    return res.status(500).json({ error: 'Unable to load subscription' });
  }
});

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const plan = PLANS.find((item) => item.id === req.body.plan);
    if (!plan) return res.status(400).json({ error: 'Unknown plan' });
    const billingPeriod = req.body.billingPeriod === 'annual' ? 'annual' : 'monthly';

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (isTestPaymentsEnabled()) {
      const checkoutToken = jwt.sign(
        { purpose: 'test-checkout', userId: user.id, plan: plan.id, billingPeriod },
        process.env.JWT_SECRET,
        { expiresIn: '15m' },
      );
      return res.json({
        provider: 'test',
        url: `${appUrl}/checkout/test?token=${encodeURIComponent(checkoutToken)}`,
      });
    }

    const priceEnv = getPlanPriceEnv(plan, billingPeriod);
    const priceId = process.env[priceEnv];
    if (!priceId) {
      return res.status(503).json({ error: `${plan.name} ${billingPeriod} checkout is not configured` });
    }

    const params = new URLSearchParams();
    appendParam(params, 'mode', 'subscription');
    appendParam(params, 'line_items[0][price]', priceId);
    appendParam(params, 'line_items[0][quantity]', 1);
    appendParam(params, 'success_url', `${appUrl}/pricing?checkout=success`);
    appendParam(params, 'cancel_url', `${appUrl}/pricing?checkout=cancelled`);
    appendParam(params, 'client_reference_id', user.id);
    appendParam(params, 'metadata[userId]', user.id);
    appendParam(params, 'metadata[plan]', plan.id);
    appendParam(params, 'metadata[billingPeriod]', billingPeriod);
    appendParam(params, 'subscription_data[metadata][userId]', user.id);
    appendParam(params, 'subscription_data[metadata][plan]', plan.id);
    appendParam(params, 'subscription_data[metadata][billingPeriod]', billingPeriod);
    appendParam(params, 'allow_promotion_codes', true);

    if (user.subscription?.stripeCustomerId) {
      appendParam(params, 'customer', user.subscription.stripeCustomerId);
    } else {
      appendParam(params, 'customer_email', user.email);
    }

    const checkoutSession = await stripeRequest('/checkout/sessions', {
      method: 'POST',
      body: params,
    });

    return res.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout creation failed:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Unable to start checkout',
    });
  }
});

const verifyTestCheckout = (token, userId) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== 'test-checkout' || payload.userId !== userId) {
    const error = new Error('Invalid test checkout');
    error.statusCode = 403;
    throw error;
  }

  const plan = PLANS.find((item) => item.id === payload.plan);
  if (!plan) {
    const error = new Error('Checkout plan no longer exists');
    error.statusCode = 400;
    throw error;
  }
  return { plan, billingPeriod: payload.billingPeriod === 'annual' ? 'annual' : 'monthly' };
};

router.get('/test-checkout', authMiddleware, async (req, res) => {
  if (!isTestPaymentsEnabled()) {
    return res.status(404).json({ error: 'Test payments are disabled' });
  }

  try {
    const { plan, billingPeriod } = verifyTestCheckout(String(req.query.token || ''), req.user.id);
    const displayPrice = billingPeriod === 'annual'
      ? plan.annualMonthlyPrice * 12
      : plan.monthlyPrice;
    return res.json({
      testMode: true,
      billingPeriod,
      plan: { id: plan.id, name: plan.name, monthlyPrice: plan.monthlyPrice, annualMonthlyPrice: plan.annualMonthlyPrice, displayPrice },
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message || 'Invalid checkout' });
  }
});

router.post('/test-complete', authMiddleware, async (req, res) => {
  if (!isTestPaymentsEnabled()) {
    return res.status(404).json({ error: 'Test payments are disabled' });
  }

  try {
    const { plan, billingPeriod } = verifyTestCheckout(String(req.body.token || ''), req.user.id);
    const cardNumber = String(req.body.cardNumber || '').replace(/\D/g, '');
    const expiry = String(req.body.expiry || '');
    const cvc = String(req.body.cvc || '');

    if (cardNumber !== '4242424242424242' || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvc)) {
      return res.status(400).json({
        error: 'Use test card 4242 4242 4242 4242 with a valid MM/YY and any 3-digit CVC.',
      });
    }

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    const reference = `test_${crypto.randomBytes(12).toString('hex')}`;

    await prisma.subscription.upsert({
      where: { userId: req.user.id },
      update: {
        plan: plan.id,
        status: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: reference,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: req.user.id,
        plan: plan.id,
        status: 'active',
        stripeSubscriptionId: reference,
        currentPeriodEnd,
      },
    });

    return res.json({
      success: true,
      plan: plan.id,
      billingPeriod,
      currentPeriodEnd,
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message || 'Payment failed' });
  }
});

router.post('/test-cancel', authMiddleware, async (req, res) => {
  if (!isTestPaymentsEnabled()) {
    return res.status(404).json({ error: 'Test payments are disabled' });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } });
  if (!subscription?.stripeSubscriptionId?.startsWith('test_')) {
    return res.status(400).json({ error: 'No test subscription found' });
  }

  await prisma.subscription.update({
    where: { userId: req.user.id },
    data: { cancelAtPeriodEnd: true },
  });
  return res.json({ success: true, currentPeriodEnd: subscription.currentPeriodEnd });
});

router.post('/portal', authMiddleware, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });
    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe billing account found' });
    }

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const params = new URLSearchParams();
    appendParam(params, 'customer', subscription.stripeCustomerId);
    appendParam(params, 'return_url', `${appUrl}/pricing`);

    const portalSession = await stripeRequest('/billing_portal/sessions', {
      method: 'POST',
      body: params,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal creation failed:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Unable to open billing portal',
    });
  }
});

module.exports = {
  router,
  webhookHandler,
};
