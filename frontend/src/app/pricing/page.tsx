'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualDiscountPercent: number;
  highlighted: boolean;
  badge: string | null;
  featureGroups: Array<{
    title: string | null;
    features: Array<{ label: string; detail?: string }>;
  }>;
};

type Subscription = {
  plan: string;
  status: string;
  hasDashboardAccess: boolean;
  billingProvider: 'stripe' | 'test' | null;
  cancelAtPeriodEnd: boolean;
};

const fallbackPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'See how ChatGPT, Perplexity, and Gemini talk about your brand.',
    monthlyPrice: 79,
    annualMonthlyPrice: 63,
    annualDiscountPercent: 20,
    highlighted: false,
    badge: null,
    featureGroups: [
      {
        title: null,
        features: [
          { label: '1 brand / website tracked' },
          { label: '3 AI platforms', detail: 'ChatGPT, Perplexity, Gemini' },
          { label: '25 tracked prompts' },
          { label: '3 competitors tracked' },
          { label: '30 days of history' },
          { label: 'Daily visibility tracking' },
          { label: 'Cross-platform comparison' },
          { label: 'Basic competitive ranking' },
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'See it, understand it, fix it — every week, automatically.',
    monthlyPrice: 299,
    annualMonthlyPrice: 239,
    annualDiscountPercent: 20,
    highlighted: true,
    badge: 'Most popular',
    featureGroups: [
      {
        title: null,
        features: [
          { label: '5 AI platforms', detail: 'Google AIO & AI Mode' },
          { label: '75 tracked prompts' },
          { label: '5 competitors tracked' },
          { label: '90 days of history' },
        ],
      },
      {
        title: 'Everything in Starter, plus:',
        features: [
          { label: '3 brands / websites tracked' },
          { label: 'Full AI narrative intelligence' },
          { label: 'Perception gap analysis' },
          { label: 'Prioritized recommendations' },
          { label: 'Content brief generation' },
          { label: 'Weekly auto-refresh' },
        ],
      },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Multi-brand tracking, deeper history, ship from Slack.',
    monthlyPrice: 499,
    annualMonthlyPrice: 399,
    annualDiscountPercent: 20,
    highlighted: false,
    badge: null,
    featureGroups: [
      {
        title: null,
        features: [
          { label: '7 AI platforms', detail: "all of Pro's + Claude & Grok" },
          { label: '125 tracked prompts' },
          { label: '8 competitors tracked' },
          { label: '180 days of history' },
        ],
      },
      {
        title: 'Everything in Pro, plus:',
        features: [
          { label: '10 brands / websites tracked' },
          { label: 'Source map (Sankey)' },
          { label: 'Slack alerts' },
          { label: 'Shopify integration' },
          { label: '10 team seats' },
        ],
      },
    ],
  },
];

function PricingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [billingPeriods, setBillingPeriods] = useState<Record<string, 'monthly' | 'annual'>>({});
  const [error, setError] = useState('');
  const checkoutState = searchParams.get('checkout') || '';

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/plans`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setPlans(data.plans);
        setTestMode(Boolean(data.testMode));
      })
      .catch(() => setPlans(fallbackPlans));
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;

    let attempts = checkoutState === 'success' ? 10 : 1;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadSubscription = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
      );
      if (!response.ok) return;

      const data = await response.json();
      setSubscription(data);
      attempts -= 1;

      if (checkoutState === 'success' && !data.hasDashboardAccess && attempts > 0) {
        timer = setTimeout(loadSubscription, 2000);
      }
    };

    loadSubscription();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [session?.accessToken, checkoutState]);

  const startCheckout = async (planId: string) => {
    if (!session?.accessToken) {
      router.push(`/register?callbackUrl=${encodeURIComponent('/pricing')}`);
      return;
    }

    setLoadingPlan(planId);
    setError('');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ plan: planId, billingPeriod: billingPeriods[planId] || 'monthly' }),
      },
    );
    const data = await response.json();

    if (!response.ok || !data.url) {
      setError(data.error || 'Unable to start checkout.');
      setLoadingPlan('');
      return;
    }

    globalThis.location.assign(data.url);
  };

  const getBillingPeriod = (planId: string) => billingPeriods[planId] || 'monthly';

  const setBillingPeriod = (planId: string, billingPeriod: 'monthly' | 'annual') => {
    setBillingPeriods((current) => ({ ...current, [planId]: billingPeriod }));
  };

  const getDisplayPrice = (plan: Plan) => (
    getBillingPeriod(plan.id) === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice
  );

  const openBillingPortal = async () => {
    if (!session?.accessToken) return;

    setError('');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing/portal`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    );
    const data = await response.json();

    if (!response.ok || !data.url) {
      setError(data.error || 'Unable to open billing portal.');
      return;
    }

    globalThis.location.assign(data.url);
  };

  const cancelTestSubscription = async () => {
    if (!session?.accessToken) return;
    setError('');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/test-cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to cancel test subscription.');
      return;
    }
    setSubscription((current) => current ? { ...current, cancelAtPeriodEnd: true } : current);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Simple pricing</p>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl text-slate-900 tracking-tight leading-tight">Choose your AI visibility engine</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Track how AI platforms mention your brand, compare competitors, and turn gaps into publishable actions.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          {checkoutState === 'success' && (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 font-semibold shadow-sm">
              Payment received. We are activating your dashboard now.
            </div>
          )}
          {checkoutState === 'cancelled' && (
            <div className="mb-8 rounded-2xl border border-amber-250 bg-amber-50 px-5 py-4 text-sm text-amber-700 font-semibold shadow-sm">
              Checkout was cancelled. Your account was not charged.
            </div>
          )}
          {subscription?.hasDashboardAccess && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
              <p className="text-sm text-slate-700">
                Your <span className="font-bold text-slate-900">{subscription.plan}</span> plan is active.
                {subscription.cancelAtPeriodEnd && <span className="ml-2 text-amber-600 font-semibold">Cancellation scheduled.</span>}
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard" className="rounded-full btn-brand px-6 py-3 text-sm font-bold shadow-sm">
                  Open dashboard
                </Link>
                {subscription.billingProvider === 'stripe' && (
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    Manage billing
                  </button>
                )}
                {subscription.billingProvider === 'test' && !subscription.cancelAtPeriodEnd && (
                  <button
                    type="button"
                    onClick={cancelTestSubscription}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    Cancel test plan
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex min-h-[640px] flex-col rounded-3xl border p-8 shadow-sm transition hover:shadow-lg bg-white ${plan.highlighted ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white'}`}
              >
                {plan.badge && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600 text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${plan.highlighted ? 'text-indigo-600' : 'text-slate-400'}`}>{plan.name}</h2>
                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-[10px] font-bold uppercase">
                    {(['monthly', 'annual'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setBillingPeriod(plan.id, period)}
                        className={`rounded px-3 py-1.5 transition cursor-pointer ${getBillingPeriod(plan.id) === period ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-450 hover:text-slate-800'}`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-end gap-1">
                    <span className="pb-3 text-3xl font-bold text-slate-400">$</span>
                    <span className="text-5xl font-extrabold text-slate-900">{getDisplayPrice(plan)}</span>
                    <span className="pb-2 text-sm font-bold text-slate-400">/mo</span>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    Billed {getBillingPeriod(plan.id) === 'annual' ? 'annually' : 'monthly'} · VAT where applicable
                  </p>
                  <p className="text-xs font-bold text-indigo-650 mt-1">Save {plan.annualDiscountPercent}% with annual billing</p>
                </div>

                <p className="mt-7 min-h-[56px] text-base font-semibold leading-6 text-slate-700">{plan.description}</p>

                <button
                  type="button"
                  onClick={() => startCheckout(plan.id)}
                  disabled={Boolean(loadingPlan) || subscription?.hasDashboardAccess}
                  className={`mt-8 h-12 w-full rounded-full px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${plan.highlighted ? 'btn-brand text-white shadow-md' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                >
                  {subscription?.hasDashboardAccess
                    ? 'Current account is active'
                    : loadingPlan === plan.id
                      ? 'Opening checkout...'
                      : status === 'authenticated'
                        ? 'Join early access'
                        : 'Join early access'}
                </button>

                <div className="mt-7 flex-1 border-t border-slate-200 pt-5">
                  {plan.featureGroups.map((group, groupIndex) => (
                    <div key={group.title || `${plan.id}-${groupIndex}`} className={groupIndex > 0 ? 'mt-6' : ''}>
                      {group.title && <p className="mb-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-450">{group.title}</p>}
                      <ul className="space-y-3 text-sm text-slate-600">
                        {group.features.map((feature) => (
                          <li key={feature.label} className="flex gap-3 items-start">
                            <span className="text-indigo-600 font-extrabold text-sm">✓</span>
                            <span>
                              <span className="font-bold text-slate-850">{feature.label}</span>
                              {feature.detail && <span className="text-slate-500"> — {feature.detail}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-55 px-4 py-3 text-sm text-red-500 font-bold">
              {error}
            </p>
          )}
          <p className="mt-8 text-center text-sm text-slate-500 font-semibold">
            {testMode
              ? 'Test payment mode is active. No real charge will be made.'
              : 'Secure recurring billing through Stripe. Cancel at the end of your billing period.'}
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <PricingContent />
    </Suspense>
  );
}
