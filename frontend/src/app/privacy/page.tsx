'use client';

import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function PrivacyPage() {
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
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Legal Guidelines</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            Last updated: {lastUpdated} · Effective immediately
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-6 text-slate-750 leading-relaxed text-base font-medium">
          <p>
            At <strong>AI Visibility Platform</strong>, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, store, and share information when you visit our website, register for our services, or interact with our API.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">1. Information We Collect</h2>
          <p>
            We collect information that you directly provide when creating an account, adding websites to track, or contacting support. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Details:</strong> Name, email address, password, and billing preferences.</li>
            <li><strong>Website Properties:</strong> URLs and tracking prompts configured in the command center.</li>
            <li><strong>Inquiry Content:</strong> Messages sent via our support helpdesk.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-3">2. How We Use Your Data</h2>
          <p>
            We process your information to deliver high-quality AI search optimization services. Specific uses include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Calculating GEO scores and crawling permissions dynamically.</li>
            <li>Processing subscription payments through secure third-party gateways (such as Stripe).</li>
            <li>Sending newsletter updates if you opt-in via our footer form.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-3">3. Data Retention and Security</h2>
          <p>
            We store website metrics and search histories for up to 180 days (depending on your subscription tier). All data is encrypted in transit and at rest using standard transport layer security protocols.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">4. Cookies and Analytical Tools</h2>
          <p>
            We use functional session cookies to persist login details and customize interface themes. We do not engage in third-party tracking or share your domain audit statistics with advertiser groups.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-3">5. Your Legal Rights (GDPR & CCPA)</h2>
          <p>
            Depending on your jurisdiction, you have the right to request access to your data, demand correction or deletion of your records, or opt-out of data processing. To assert these rights, submit a help request via the <a href="/support" className="text-indigo-650 font-bold hover:underline">Support Helpdesk</a>.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
