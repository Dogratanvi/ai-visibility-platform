'use client';
import React, { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

type AuditResult = {
  url: string;
  fullUrl: string;
  score: number;
  pillars: {
    accessibility: { score: number; total: number };
    readability: { score: number; total: number };
    understandability: { score: number; total: number };
  };
  crawlers: Array<{ name: string; source: string; blocked: boolean }>;
  allowedCount: number;
  blockedCount: number;
  flags: Array<{ type: string; impact: string; title: string }>;
};

export default function FreeAudit() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/free-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to run audit');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error running audit');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRunAudit();
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'High') return 'text-red-400';
    if (impact === 'Medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getImpactBg = (impact: string) => {
    if (impact === 'High') return 'bg-red-500/10 border-red-500/20';
    if (impact === 'Medium') return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-green-500/10 border-green-500/20';
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
        {!result ? (
          <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand">Free Audit</span>
                <h1 className="mt-4 text-5xl font-semibold leading-tight">See your AI Visibility Score</h1>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-white/70">
                Get a comprehensive analysis of how accessible, readable, and crawlable your website is for AI platforms. See which crawlers can reach you and what needs fixing.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleRunAudit}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 text-sm font-semibold transition disabled:opacity-70"
                >
                  {loading ? 'Analyzing...' : 'Run Free Audit →'}
                </button>
                <a
                  href="/geo-score"
                  className="inline-flex items-center justify-center rounded-full border border-surface bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  GEO Score Tool →
                </a>
              </div>
            </div>

            <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10 shadow-xl">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-white">Website URL</label>
                <input
                  type="text"
                  placeholder="https://www.example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-3xl border border-surface bg-surface px-6 py-3 text-white placeholder-white/40 focus:border-brand focus:outline-none"
                />
                {error && (
                  <div className="text-sm text-red-400">{error}</div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            {/* Score Card */}
            <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10 flex flex-col items-center gap-6">
              {/* Score Circle */}
              <div className="relative h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3"
                    strokeDasharray={`${(result.score / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-white">{result.score}</div>
                  <div className="text-xs text-white/60">/ 100</div>
                </div>
              </div>

              {/* URL */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">{result.url}</h2>
                <p className="text-xs text-white/60 mt-2">{result.fullUrl}</p>
              </div>

              {/* Pillar Breakdowns */}
              <div className="w-full mt-8 space-y-4">
                <h3 className="text-sm uppercase tracking-[0.32em] text-brand">Pillar Breakdowns</h3>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/80">Accessibility</span>
                    <span className="text-sm font-semibold text-white">{result.pillars.accessibility.score}/{result.pillars.accessibility.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface/50 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all"
                      style={{ width: `${(result.pillars.accessibility.score / result.pillars.accessibility.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/80">Readability</span>
                    <span className="text-sm font-semibold text-white">{result.pillars.readability.score}/{result.pillars.readability.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface/50 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all"
                      style={{ width: `${(result.pillars.readability.score / result.pillars.readability.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/80">Understandability</span>
                    <span className="text-sm font-semibold text-white">{result.pillars.understandability.score}/{result.pillars.understandability.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface/50 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${(result.pillars.understandability.score / result.pillars.understandability.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Crawler Access Report */}
            <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10">
              <h3 className="text-sm uppercase tracking-[0.32em] text-brand mb-6">AI Crawler Access Report</h3>
              <p className="text-sm text-white/70 mb-4">Can AI bots actually read your page?</p>

              <div className="mb-6 flex items-center gap-2">
                <span className="text-2xl font-bold text-brand">{result.allowedCount}</span>
                <span className="text-white/60">of {result.crawlers.length} crawlers have full access</span>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-brand uppercase tracking-[0.32em]">AI LLM Crawlers ({result.crawlers.length} results)</div>
                {result.crawlers.map((crawler) => (
                  <div key={crawler.name} className="flex items-center justify-between rounded-2xl bg-surface p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${crawler.blocked ? 'bg-red-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm text-white font-medium">{crawler.name}</p>
                        <p className="text-xs text-white/60">{crawler.source}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${crawler.blocked ? 'text-red-400' : 'text-green-400'}`}>
                      {crawler.blocked ? 'Blocked' : 'Allowed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Flags */}
            {result.flags.length > 0 && (
              <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10">
                <h3 className="text-sm uppercase tracking-[0.32em] text-brand mb-6">Top Flags</h3>
                <div className="space-y-4">
                  {result.flags.map((flag, i) => (
                    <div key={i} className={`border rounded-2xl p-4 ${getImpactBg(flag.impact)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-xs font-semibold uppercase ${getImpactColor(flag.impact)}`}>
                            {flag.type} - {flag.impact} Impact
                          </p>
                          <p className="mt-2 text-sm text-white">{flag.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }}
                className="rounded-full border border-surface bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                🔗 Copy Link
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="rounded-full border border-surface bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                ⬇ Download Report
              </button>
            </div>

            {/* CTA */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold text-white">See your full breakdown</h3>
              <p className="text-white/70">Get detailed insights on every aspect of your AI visibility.</p>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full btn-brand px-8 py-3 text-sm font-semibold"
              >
                Unlock Full Report →
              </a>
            </div>

            {/* Run New Audit */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setUrl('');
                }}
                className="inline-flex items-center justify-center rounded-full border border-surface bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                ← Run Another Audit
              </button>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
