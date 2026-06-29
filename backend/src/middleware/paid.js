const { PrismaClient } = require('@prisma/client');
const { hasDashboardAccess, isAdminRole } = require('../lib/subscription');
const { getPlanEntitlements } = require('../lib/plans');

const prisma = new PrismaClient();

const paidMiddleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, subscription: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!hasDashboardAccess(user.subscription, user.role)) {
      return res.status(402).json({
        error: 'A paid plan is required to access this feature.',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    req.subscription = user.subscription;
    req.subscriptionEntitlements = getPlanEntitlements(user.subscription?.plan, {
      isAdmin: isAdminRole(user.role),
    });
    req.userRole = user.role;
    return next();
  } catch (error) {
    console.error('Paid access check failed:', error);
    return res.status(500).json({ error: 'Unable to verify subscription' });
  }
};

module.exports = paidMiddleware;
