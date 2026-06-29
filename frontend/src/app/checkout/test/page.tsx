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
    <main className="min-h-screen bg-[#060a13] px-5 py-10 text-white">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] lg:grid-cols-[0.85fr_1.15fr]">
        <section className="border-b border-white/10 bg-[#111b36] p-8 lg:border-b-0 lg:border-r">
          <Link href="/pricing" className="text-sm text-white/60 hover:text-white">← Back to pricing</Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[#91a2ff]">Order summary</p>
          {plan ? (
            <>
              <h1 className="mt-3 text-3xl font-semibold">{plan.name}</h1>
              <p className="mt-3 text-sm text-white/60">AI visibility tracking and growth recommendations.</p>
              <div className="mt-10 flex items-end gap-2 border-t border-white/10 pt-8">
                <span className="text-4xl font-semibold">${billingPeriod === 'annual' ? plan.displayPrice : plan.monthlyPrice}</span>
                <span className="pb-1 text-white/50">{billingPeriod === 'annual' ? 'per year' : 'per month'}</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="mt-3 text-sm text-white/55">${plan.annualMonthlyPrice}/mo billed annually</p>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-white/55">Loading plan...</p>
          )}
        </section>

        <section className="p-8">
          <div className="rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Test mode only. Do not enter a real card. Use <strong>4242 4242 4242 4242</strong>.
          </div>
          <h2 className="mt-7 text-xl font-semibold">Test payment details</h2>

          <form onSubmit={submitPayment} className="mt-6 space-y-5">
            <label className="block text-sm text-white/70">
              Cardholder name
              <input
                value={cardholder}
                onChange={(event) => setCardholder(event.target.value)}
                required
                className="mt-2 w-full rounded-md border border-white/12 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#6f85ff]"
              />
            </label>
            <label className="block text-sm text-white/70">
              Card number
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                inputMode="numeric"
                required
                className="mt-2 w-full rounded-md border border-white/12 bg-white/5 px-4 py-3 font-mono text-white outline-none focus:border-[#6f85ff]"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-white/70">
                Expiry
                <input
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                  placeholder="MM/YY"
                  required
                  className="mt-2 w-full rounded-md border border-white/12 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#6f85ff]"
                />
              </label>
              <label className="block text-sm text-white/70">
                CVC
                <input
                  value={cvc}
                  onChange={(event) => setCvc(event.target.value)}
                  inputMode="numeric"
                  required
                  className="mt-2 w-full rounded-md border border-white/12 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#6f85ff]"
                />
              </label>
            </div>

            {error && <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

            <button
              type="submit"
              disabled={!plan || loading}
              className="w-full rounded-md bg-[#4f6ef7] px-5 py-3 font-semibold text-white hover:bg-[#617cf8] disabled:opacity-50"
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
    <Suspense fallback={<div className="min-h-screen bg-[#060a13]" />}>
      <TestCheckoutContent />
    </Suspense>
  );
}
