'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function FreeAudit() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'input' | 'email_input' | 'code_input' | 'auth_prompt'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleStartAudit = () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }
    setError('');
    setStep('email_input');
  };

  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate sending 6-digit code
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
      setStep('code_input');
    }, 1200);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('auth_prompt');
    }, 1000);
  };

  const handleRedirectRegister = () => {
    router.push(`/register?email=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'input') handleStartAudit();
      else if (step === 'email_input') handleSendCode();
      else if (step === 'code_input') handleVerifyCode();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-150 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold text-indigo-650">
                AI visibility Report
              </span>
              <h1 className="mt-4 text-5xl font-extrabold text-slate-900 leading-tight">
                Unlock Your Brand's Placement Audit
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-slate-650 font-semibold">
              Scan, verify, and monitor citation metrics across ChatGPT, Google Gemini, Perplexity, and Claude. To access this premium report, verify your email and subscribe to a platform plan.
            </p>
            <div className="flex gap-4">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 text-xs font-bold shadow-md transition hover:shadow-lg"
              >
                View Plans & Pricing →
              </a>
            </div>
          </div>

          {/* Funnel Card Container */}
          <div className="rounded-4xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
            
            {step === 'input' && (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">Run Website Audit</h3>
                <p className="text-xs text-slate-500 font-semibold">Enter your domain URL to initiate the scanning system.</p>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://www.yourdomain.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition text-xs font-semibold"
                  />
                  {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                  <button
                    onClick={handleStartAudit}
                    className="w-full rounded-2xl btn-brand py-3 text-xs font-bold text-white hover:shadow-xs transition cursor-pointer"
                  >
                    Check AI Visibility →
                  </button>
                </div>
              </div>
            )}

            {step === 'email_input' && (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">📧 Step 1: Email Verification</h3>
                <p className="text-xs text-slate-500 font-semibold">To prevent bot requests, verify your email before generating your report.</p>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition text-xs font-semibold"
                  />
                  {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full rounded-2xl btn-brand py-3 text-xs font-bold text-white hover:shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending Pin...' : 'Send Verification Code'}
                  </button>
                </div>
              </div>
            )}

            {step === 'code_input' && (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">🔑 Enter Verification Code</h3>
                <p className="text-xs text-slate-500 font-semibold">We sent a 6-digit confirmation pin to <strong>{email}</strong>.</p>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Verification Pin</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-800 text-center tracking-widest outline-none focus:border-indigo-500 focus:bg-white transition text-xs font-bold"
                  />
                  {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full rounded-2xl btn-brand py-3 text-xs font-bold text-white hover:shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Verifying Code...' : 'Verify Pin & Continue'}
                  </button>
                </div>
              </div>
            )}

            {step === 'auth_prompt' && (
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">Email Verified Successfully</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Your assessment for <strong>{url}</strong> is ready. Register or log in below, choose a tracking plan, and unlock your dashboard.
                  </p>
                </div>
                <div className="space-y-2.5 pt-3">
                  <button
                    onClick={handleRedirectRegister}
                    className="w-full rounded-2xl btn-brand py-3 text-xs font-bold text-white hover:shadow-xs transition cursor-pointer"
                  >
                    Create Free Account & Choose Plan
                  </button>
                  <a
                    href="/login"
                    className="block w-full rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Sign In to Existing Account
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
