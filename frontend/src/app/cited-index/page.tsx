'use client';

import { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function AIVIsibilityIndexPage() {
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setResult(null);
    if (!website.trim()) {
      setError('Enter a website URL to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/modules/cited-index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to fetch cited index.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error while fetching cited index.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-150 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold text-indigo-600">Free Tool</span>
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">AI Visibility Index</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">Track which pages and brands appear in AI responses. This tool surfaces the most relevant mentions and confidence signals for your brand.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 text-sm font-bold shadow-md transition disabled:opacity-70">
                {loading ? 'Checking…' : 'Check AI Visibility Index'}
              </button>
              <a href="/free-audit" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300">Free AI Report</a>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.24em] font-extrabold text-indigo-600">Citation intelligence</p>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-snug">Discover the AI citations and backlinks your brand is getting.</h2>
              <p className="text-slate-500 leading-relaxed">This page surfaces the top citing pages and a confidence score for each mention, helping you understand who is recommending your brand to AI users.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-600">Website URL</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white" />
            </div>
            <div className="flex items-end justify-end">
              <button onClick={handleSubmit} disabled={loading} className="rounded-full btn-brand px-6 py-3 text-sm font-bold transition disabled:opacity-70">
                {loading ? 'Loading…' : 'View AI Visibility Index'}
              </button>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-red-500 font-semibold">{error}</p> : null}

          {result ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl bg-slate-50 border border-slate-200/60 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Source</p>
                <p className="mt-3 text-slate-800 font-semibold">{result.citedIndexSource || 'mock'}</p>
              </div>

              <div className="overflow-x-auto rounded-3xl bg-slate-50 border border-slate-200/60 p-6">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      <th className="py-3 pr-6">Citing Page</th>
                      <th className="py-3 pr-6">Anchor</th>
                      <th className="py-3 pr-6">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(result.citations || []).map((citation: any, index: number) => (
                      <tr key={`${citation.source}-${index}`}>
                        <td className="py-4 pr-6">
                          <a href={citation.source} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:text-indigo-850 hover:underline">
                            {citation.source}
                          </a>
                        </td>
                        <td className="py-4 pr-6 text-slate-600 font-medium">{citation.anchor}</td>
                        <td className="py-4 pr-6 font-bold text-slate-800">{citation.score ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
