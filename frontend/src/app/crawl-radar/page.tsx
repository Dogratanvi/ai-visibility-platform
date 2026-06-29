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
    <div className="min-h-screen bg-surface text-white">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {!started ? (
          <>
            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand">Free Tool</span>
                <h1 className="text-5xl font-semibold">Crawl Radar</h1>
                <p className="max-w-2xl text-lg leading-8 text-white/70">
                  Test whether real AI crawler user-agents can access your website. Crawl Radar checks robots.txt rules and makes actual crawler-style requests.
                </p>
              </div>

              <div className="rounded-4xl border border-surface bg-surface-strong/90 p-10 shadow-xl shadow-[#1b243d]/30">
                <p className="text-sm uppercase tracking-[0.32em] text-[#4dd8d0]">Crawler Access</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">See which AI bots can actually read your site.</h2>
                <p className="mt-4 text-white/60">Results may take a little time because each bot is tested separately.</p>
              </div>
            </section>

            <section className="mt-12 rounded-[10px] border border-surface bg-surface-strong/70 p-8">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label className="block text-sm font-medium text-white/70">Website URL</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    placeholder="https://example.com"
                    className="mt-3 w-full rounded-lg border border-surface bg-[#070b16] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#4dd8d0]"
                  />
                </div>
                <button onClick={handleSubmit} disabled={loading} className="rounded-lg btn-brand px-6 py-3 text-sm font-semibold transition disabled:opacity-70">
                  Start Crawl
                </button>
              </div>
              {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4dd8d0]">Crawl Radar</p>

            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#123746]">
              <div className={`h-12 w-12 rounded-full border border-[#4dd8d0] ${loading ? 'animate-pulse' : ''}`} />
            </div>

            <p className="mt-10 text-lg text-white/70">
              {loading ? `Testing ${currentCrawler}...` : `Crawl complete: ${accessibleCount} accessible, ${blockedCount} blocked`}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {crawlerStates.map((crawler) => {
                const isAccessible = crawler.status === 'accessible';
                const isBlocked = crawler.status === 'blocked';
                const isTesting = crawler.status === 'testing';
                const dotClass = isAccessible ? 'bg-green-400' : isBlocked ? 'bg-red-400' : isTesting ? 'bg-[#4dd8d0]' : 'bg-slate-700';
                const borderClass = isAccessible ? 'border-green-400/35' : isBlocked ? 'border-red-400/35' : isTesting ? 'border-[#4dd8d0]/50' : 'border-surface';
                const label = isAccessible ? 'Accessible' : isBlocked ? crawler.reason || 'Blocked' : isTesting ? 'Testing...' : 'Pending...';

                return (
                  <div key={crawler.name} className={`min-h-20 rounded-[7px] border ${borderClass} bg-surface-strong/70 p-3 text-left`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
                      <div>
                        <p className="text-sm font-bold leading-4 text-white">{crawler.name}</p>
                        <p className="mt-3 text-xs text-white/35">{label}</p>
                        {crawler.latencyMs ? <p className="mt-1 text-[10px] text-white/25">{crawler.latencyMs}ms</p> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading ? (
              <div className="mt-8 flex justify-center gap-3">
                <button onClick={handleSubmit} className="rounded-lg bg-[#123746] px-5 py-3 text-sm font-bold text-[#4dd8d0] hover:bg-[#17495c]">
                  Run Again
                </button>
                <button
                  onClick={() => {
                    setStarted(false);
                    setCrawlerStates(crawlers);
                  }}
                  className="rounded-lg border border-surface bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
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
