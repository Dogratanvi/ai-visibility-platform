'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

type CheckoutPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  displayPrice: number;
};

function TestCheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [plan, setPlan] = useState<CheckoutPlan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/30');
  const [cvc, setCvc] = useState('123');
  const [cardholder, setCardholder] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = `/checkout/test?token=${encodeURIComponent(token)}`;
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (!session?.accessToken || !token) return;

    const loadCheckout = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/test-checkout?token=${encodeURIComponent(token)}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'This checkout session is invalid or expired.');
        return;
      }
      setPlan(data.plan);
      setBillingPeriod(data.billingPeriod === 'annual' ? 'annual' : 'monthly');
    };

    loadCheckout();
  }, [router, session?.accessToken, status, token]);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.accessToken || !plan) return;

    setLoading(true);
    setError('');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/test-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ token, cardNumber, expiry, cvc, cardholder }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Test payment failed.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-slate-800 font-sans">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-[0.85fr_1.15fr] shadow-sm">
        <section className="border-b border-slate-200 bg-slate-50 p-8 lg:border-b-0 lg:border-r lg:border-slate-200">
          <Link href="/pricing" className="text-sm text-slate-500 font-bold hover:text-slate-800">← Back to pricing</Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-indigo-650">Order summary</p>
          {plan ? (
            <>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{plan.name}</h1>
              <p className="mt-3 text-sm text-slate-500">AI visibility tracking and growth recommendations.</p>
              <div className="mt-10 flex items-end gap-2 border-t border-slate-200 pt-8">
                <span className="text-4xl font-extrabold text-slate-900">${billingPeriod === 'annual' ? plan.displayPrice : plan.monthlyPrice}</span>
                <span className="pb-1 text-slate-400 font-bold">{billingPeriod === 'annual' ? 'per year' : 'per month'}</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="mt-3 text-sm text-slate-500">${plan.annualMonthlyPrice}/mo billed annually</p>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Loading plan...</p>
          )}
        </section>

        <section className="p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-semibold shadow-xs">
            Test mode only. Do not enter a real card. Use <strong>4242 4242 4242 4242</strong>.
          </div>
          <h2 className="mt-7 text-xl font-extrabold text-slate-900">Test payment details</h2>

          <form onSubmit={submitPayment} className="mt-6 space-y-5">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Cardholder name
              <input
                value={cardholder}
                onChange={(event) => setCardholder(event.target.value)}
                required
                className="mt-1.5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold transition"
              />
            </label>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Card number
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                inputMode="numeric"
                required
                className="mt-1.5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-slate-800 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold transition"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Expiry
                <input
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                  placeholder="MM/YY"
                  required
                  className="mt-1.5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold transition"
                />
              </label>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                CVC
                <input
                  value={cvc}
                  onChange={(event) => setCvc(event.target.value)}
                  inputMode="numeric"
                  required
                  className="mt-1.5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold transition"
                />
              </label>
            </div>

            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 font-bold">{error}</p>}

            <button
              type="submit"
              disabled={!plan || loading}
              className="w-full rounded-full btn-brand px-5 py-3 font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Activating plan...' : plan ? `Pay $${billingPeriod === 'annual' ? plan.displayPrice : plan.monthlyPrice} (test)` : 'Loading...'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function TestCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <TestCheckoutContent />
    </Suspense>
  );
}
