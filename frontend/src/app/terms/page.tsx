'use client';

import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Legal Agreements</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            Last updated: {lastUpdated} · Please read carefully before using the service
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-6 text-slate-755 leading-relaxed text-base font-medium">
          <p>
            Welcome to <strong>AI Visibility Platform</strong>. By accessing or using our websites, software services, API endpoints, or dashboards, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">1. License & Permitted Use</h2>
          <p>
            We grant you a non-exclusive, non-transferable, revocable license to access our platform solely for analyzing and optimizing your brand visibility in generative search engine results. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Reverse engineer or systematically scrape our citation algorithms.</li>
            <li>Use the API to build competing search optimization tools.</li>
            <li>Share account dashboard login details with external entities.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-3">2. Account Credentials & Security</h2>
          <p>
            You are responsible for safeguarding the credentials you use to access the service and for any activities or actions under your password. You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">3. Subscriptions & Billing</h2>
          <p>
            Certain parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic cycle (monthly or annually). Subscriptions automatically renew under the same conditions unless cancelled through your dashboard settings or by contacting support.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AI Visibility Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the platform operator is established, without regard to its conflict of law provisions.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
