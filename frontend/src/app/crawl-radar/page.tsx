'use client';

import { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

type CrawlerState = {
  name: string;
  source: string;
  status: 'pending' | 'testing' | 'accessible' | 'blocked';
  reason?: string;
  latencyMs?: number;
};

const crawlers: CrawlerState[] = [
  { name: 'GPTBot', source: 'OpenAI', status: 'pending' },
  { name: 'ClaudeBot', source: 'Anthropic', status: 'pending' },
  { name: 'PerplexityBot', source: 'Perplexity', status: 'pending' },
  { name: 'Google-Extended', source: 'Google', status: 'pending' },
  { name: 'ChatGPT-User', source: 'OpenAI', status: 'pending' },
  { name: 'OAI-SearchBot', source: 'OpenAI', status: 'pending' },
  { name: 'Claude-User', source: 'Anthropic', status: 'pending' },
  { name: 'Claude-SearchBot', source: 'Anthropic', status: 'pending' },
  { name: 'Perplexity-User', source: 'Perplexity', status: 'pending' },
  { name: 'Bytespider', source: 'ByteDance', status: 'pending' },
];

export default function CrawlRadarPage() {
  const [website, setWebsite] = useState('');
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crawlerStates, setCrawlerStates] = useState<CrawlerState[]>(crawlers);
  const [currentCrawler, setCurrentCrawler] = useState('');
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  const updateCrawler = (name: string, update: Partial<CrawlerState>) => {
    setCrawlerStates((items) => items.map((item) => (
      item.name === name ? { ...item, ...update } : item
    )));
  };

  const handleSubmit = async () => {
    setError('');
    if (!website.trim()) {
      setError('Enter a website URL to continue.');
      return;
    }

    setStarted(true);
    setLoading(true);
    setCurrentCrawler('');
    setCrawlerStates(crawlers);

    for (const crawler of crawlers) {
      setCurrentCrawler(`${crawler.name} (${crawler.source})`);
      updateCrawler(crawler.name, { status: 'testing' });

      try {
        const res = await fetch(`${apiBase}/api/modules/crawl-radar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ website: website.trim(), crawler: crawler.name }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Unable to test ${crawler.name}`);
        }

        updateCrawler(crawler.name, {
          status: data.crawler.accessible ? 'accessible' : 'blocked',
          reason: data.crawler.reason,
          latencyMs: data.crawler.latencyMs,
        });
      } catch (err) {
        updateCrawler(crawler.name, {
          status: 'blocked',
          reason: err instanceof Error ? err.message : 'Request failed',
        });
      }
    }

    setCurrentCrawler('');
    setLoading(false);
  };

  const accessibleCount = crawlerStates.filter((crawler) => crawler.status === 'accessible').length;
  const blockedCount = crawlerStates.filter((crawler) => crawler.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {!started ? (
          <>
            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-150 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold text-indigo-600">Free Tool</span>
                <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">Crawl Radar</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Test whether real AI crawler user-agents can access your website. Crawl Radar checks robots.txt rules and makes actual crawler-style requests.
                </p>
              </div>

              <div className="rounded-4xl border border-slate-200 bg-white p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Crawler Access</p>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 leading-snug">See which AI bots can actually read your site.</h2>
                <p className="mt-4 text-slate-500">Results may take a little time because each bot is tested separately.</p>
              </div>
            </section>

            <section className="mt-12 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label className="block text-sm font-bold text-slate-600">Website URL</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    placeholder="https://example.com"
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-450 focus:border-indigo-500 focus:bg-white animate-transition"
                  />
                </div>
                <button onClick={handleSubmit} disabled={loading} className="rounded-full btn-brand px-8 py-3 text-sm font-bold shadow-md transition disabled:opacity-70 cursor-pointer">
                  Start Crawl
                </button>
              </div>
              {error ? <p className="mt-4 text-sm text-red-500 font-semibold">{error}</p> : null}
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-indigo-600">Crawl Radar</p>

            <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 border border-indigo-150">
              <div className={`h-12 w-12 rounded-full border-2 border-indigo-500 ${loading ? 'animate-ping' : ''}`} />
            </div>

            <p className="mt-10 text-lg font-bold text-slate-700">
              {loading ? `Testing ${currentCrawler}...` : `Crawl complete: ${accessibleCount} accessible, ${blockedCount} blocked`}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {crawlerStates.map((crawler) => {
                const isAccessible = crawler.status === 'accessible';
                const isBlocked = crawler.status === 'blocked';
                const isTesting = crawler.status === 'testing';
                const dotClass = isAccessible ? 'bg-emerald-500 animate-pulse' : isBlocked ? 'bg-rose-500' : isTesting ? 'bg-indigo-500 animate-spin' : 'bg-slate-400';
                const borderClass = isAccessible ? 'border-emerald-200 bg-emerald-50/20' : isBlocked ? 'border-rose-200 bg-rose-50/20' : isTesting ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-200 bg-white';
                const label = isAccessible ? 'Accessible' : isBlocked ? crawler.reason || 'Blocked' : isTesting ? 'Testing...' : 'Pending...';

                return (
                  <div key={crawler.name} className={`min-h-20 rounded-2xl border ${borderClass} p-4 text-left shadow-xs transition hover:shadow-md`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
                      <div>
                        <p className="text-sm font-bold leading-5 text-slate-900">{crawler.name}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">{label}</p>
                        {crawler.latencyMs ? <p className="mt-1 text-[10px] font-bold text-slate-400">{crawler.latencyMs}ms</p> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading ? (
              <div className="mt-10 flex justify-center gap-4">
                <button onClick={handleSubmit} className="rounded-full btn-brand px-6 py-3 text-sm font-bold shadow-md transition cursor-pointer">
                  Run Again
                </button>
                <button
                  onClick={() => {
                    setStarted(false);
                    setCrawlerStates(crawlers);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                >
                  Test Another Website
                </button>
              </div>
            ) : null}
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
