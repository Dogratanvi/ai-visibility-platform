'use client';

import { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const faqs = [
  { q: 'How often are the visibility indexes refreshed?', a: 'Depending on your plan, visibility metrics refresh daily or weekly. High-level dashboard accounts query real-time results directly.' },
  { q: 'What AI bots do you monitor?', a: 'We actively track citations and block statuses for GPTBot, Gemini/Google-Extended, ClaudeBot/Anthropic-crawler, and PerplexityBot.' },
  { q: 'Can I cancel my subscription at any time?', a: 'Yes. You can manage your subscription, download historical invoices, or schedule cancellation instantly via the user dashboard settings.' },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Customer Care</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Support Helpdesk</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            Have questions about AI Search visibility reports or custom API integration? Get in touch with our tech team.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Support Channels & FAQs */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Direct Channels</h2>
              <div className="space-y-3 font-semibold text-sm">
                <p className="text-slate-500">📧 General Inquiries: <span className="text-slate-950 font-bold">support@aivisibility.com</span></p>
                <p className="text-slate-500">🛠️ Enterprise API Support: <span className="text-slate-950 font-bold">devs@aivisibility.com</span></p>
                <p className="text-slate-500">⏱️ Response Time SLA: <span className="text-indigo-650 font-bold">&lt; 12 Hours</span></p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 bg-white rounded-2xl p-5 shadow-xs">
                    <p className="font-bold text-slate-900 text-sm">Q: {faq.q}</p>
                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Send a Message</h2>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mb-6">We will get back to you shortly</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 p-5 rounded-2xl flex items-center gap-3 font-semibold shadow-xs mb-4">
                <span className="text-xl">✓</span>
                <div>
                  <p className="font-bold">Message sent successfully!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Ticket ID: #{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-3xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-3xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-3xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Message Details</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-3xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold resize-none"
                    placeholder="Describe your issue or request here..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-brand text-white font-bold py-3 rounded-full shadow-md hover:bg-indigo-750 transition cursor-pointer"
                >
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
