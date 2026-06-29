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
    <div className="min-h-screen bg-surface text-white">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand">Free Tool</span>
            <h1 className="text-5xl font-semibold">AI Visibility Index</h1>
            <p className="max-w-2xl text-lg leading-8 text-white/70">Track which pages and brands appear in AI responses. This tool surfaces the most relevant mentions and confidence signals for your brand.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 text-sm font-semibold transition disabled:opacity-70">
                {loading ? 'Checking…' : 'Check AI Visibility Index'}
              </button>
              <a href="/free-audit" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10">Free AI Report</a>
            </div>
          </div>

          <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10 shadow-xl shadow-[#1b243d]/30">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.32em] text-[#7e8de6]">Citation intelligence</p>
              <h2 className="text-3xl font-semibold text-white">Discover the AI citations and backlinks your brand is getting.</h2>
              <p className="text-white/70">This page surfaces the top citing pages and a confidence score for each mention, helping you understand who is recommending your brand to AI users.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-4xl border border-surface bg-surface/90 p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white/70">Website URL</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="mt-3 w-full rounded-3xl border border-white/10 bg-surface-strong/90 px-4 py-3 text-white outline-none focus:border-brand" />
            </div>
            <div className="flex items-end justify-end">
                <button onClick={handleSubmit} disabled={loading} className="rounded-full btn-brand px-6 py-3 text-sm font-semibold transition disabled:opacity-70">
                {loading ? 'Loading…' : 'View AI Visibility Index'}
              </button>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

          {result ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl bg-surface-strong/90 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-[#7e8de6]">Source</p>
                <p className="mt-3 text-white">{result.citedIndexSource || 'mock'}</p>
              </div>

              <div className="overflow-x-auto rounded-3xl bg-surface-strong/90 p-6">
                <table className="min-w-full text-left text-sm text-white/80">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-[0.24em] text-white/60">
                      <th className="py-3 pr-6">Citing Page</th>
                      <th className="py-3 pr-6">Anchor</th>
                      <th className="py-3 pr-6">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(result.citations || []).map((citation: any, index: number) => (
                      <tr key={`${citation.source}-${index}`}>
                        <td className="py-4 pr-6"><a href={citation.source} target="_blank" rel="noreferrer" className="text-white hover:text-[#9ca7ff]">{citation.source}</a></td>
                        <td className="py-4 pr-6">{citation.anchor}</td>
                        <td className="py-4 pr-6">{citation.score ?? '—'}</td>
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
