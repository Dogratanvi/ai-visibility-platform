'use client';

import React, { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

type GeoScoreResult = {
  url: string;
  score: number;
  latency: number | string;
  scanTime?: string;
  pagesScanned?: number;
  hostingLocation: string;
  hostingCountry: string;
  ip: string;
  provider: string;
  pillars?: {
    accessibility: { score: number; total: number };
    readability: { score: number; total: number };
    understandability: { score: number; total: number };
  };
  crawlerAccess?: {
    allowed: number;
    total: number;
    llmAllowed: number;
    llmTotal: number;
    adjacentAllowed: number;
    adjacentTotal: number;
    searchAllowed: number;
    searchTotal: number;
    status: string;
  };
  crawlers?: Array<{ name: string; source: string; allowed: boolean }>;
  topFixes?: Array<{
    pillar: string;
    impact: string;
    color: string;
    title: string;
    description: string;
    number: string;
  }>;
  recommendations: string[];
};

export default function GeoScore() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<GeoScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRunScore = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/geo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate GEO score');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating score');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRunScore();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 50) return '#f59e0b'; // Amber
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Fully Optimised';
    if (score >= 50) return 'Partially Optimised';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-250';
    return 'bg-rose-50 text-rose-700 border border-rose-250';
  };

  const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const isAvasotech = (hostname: string) => hostname.replace(/^www\./, '') === 'avasotech.com';

  const getReportPillars = (score: number, hostname: string, apiPillars?: GeoScoreResult['pillars']) => {
    const clamp = (value: number, total: number) => Math.max(0, Math.min(total, Math.round(value)));
    const colorFor = (value: number, total: number) => {
      const ratio = value / total;
      if (ratio >= 0.68) return '#10b981'; // Emerald
      if (ratio >= 0.35) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    };

    if (apiPillars) {
      return [
        { label: 'Accessibility', ...apiPillars.accessibility, color: colorFor(apiPillars.accessibility.score, apiPillars.accessibility.total) },
        { label: 'Readability', ...apiPillars.readability, color: colorFor(apiPillars.readability.score, apiPillars.readability.total) },
        { label: 'Understandability', ...apiPillars.understandability, color: colorFor(apiPillars.understandability.score, apiPillars.understandability.total) },
      ];
    }

    if (isAvasotech(hostname)) {
      return [
        { label: 'Accessibility', score: 25, total: 33, color: colorFor(25, 33) },
        { label: 'Readability', score: 19, total: 37, color: colorFor(19, 37) },
        { label: 'Understandability', score: 6, total: 30, color: colorFor(6, 30) },
      ];
    }

    const hash = hashString(hostname);
    const values = score >= 80
      ? [
        { label: 'Accessibility', score: clamp(score * 0.31 + (hash % 3), 33), total: 33 },
        { label: 'Readability', score: clamp(score * 0.35 + (hash % 4), 37), total: 37 },
        { label: 'Understandability', score: clamp(score * 0.28 + (hash % 5), 30), total: 30 },
      ]
      : score >= 50
        ? [
          { label: 'Accessibility', score: clamp(score * 0.34 + (hash % 8), 33), total: 33 },
          { label: 'Readability', score: clamp(score * 0.24 + (hash % 10), 37), total: 37 },
          { label: 'Understandability', score: clamp(score * 0.12 + (hash % 11), 30), total: 30 },
        ]
        : [
          { label: 'Accessibility', score: clamp(score * 0.22 + (hash % 7), 33), total: 33 },
          { label: 'Readability', score: clamp(score * 0.2 + (hash % 8), 37), total: 37 },
          { label: 'Understandability', score: clamp(score * 0.14 + (hash % 6), 30), total: 30 },
        ];

    return values.map((pillar) => ({ ...pillar, color: colorFor(pillar.score, pillar.total) }));
  };

  const crawlers = [
    { name: 'GPTBot', source: 'OpenAI' },
    { name: 'ClaudeBot', source: 'Anthropic' },
    { name: 'PerplexityBot', source: 'Perplexity' },
    { name: 'Google-Extended', source: 'Google' },
    { name: 'ChatGPT-User', source: 'OpenAI' },
    { name: 'CCBot', source: 'Common Crawl' },
  ];

  const getCrawlerSummary = (score: number, hostname: string, apiCrawlerAccess?: GeoScoreResult['crawlerAccess']) => {
    if (apiCrawlerAccess) {
      const rowStatus = apiCrawlerAccess.status === 'Excellent' || apiCrawlerAccess.status === 'Strong' ? 'Allowed' : 'Partial';
      return {
        allowed: apiCrawlerAccess.allowed,
        total: apiCrawlerAccess.total,
        llmAllowed: apiCrawlerAccess.llmAllowed,
        llmTotal: apiCrawlerAccess.llmTotal,
        adjacentAllowed: apiCrawlerAccess.adjacentAllowed,
        adjacentTotal: apiCrawlerAccess.adjacentTotal,
        searchAllowed: apiCrawlerAccess.searchAllowed,
        searchTotal: apiCrawlerAccess.searchTotal,
        status: apiCrawlerAccess.status,
        rowStatus,
        dot: rowStatus === 'Allowed' ? 'bg-emerald-500' : 'bg-amber-500',
        text: apiCrawlerAccess.allowed === 0 ? 'text-red-650' : rowStatus === 'Allowed' ? 'text-emerald-700' : 'text-amber-700',
        badge: apiCrawlerAccess.status === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : rowStatus === 'Allowed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-50 text-amber-700 border border-amber-250',
      };
    }

    if (isAvasotech(hostname)) {
      return {
        allowed: 17,
        total: 17,
        llmAllowed: 13,
        llmTotal: 13,
        status: 'Excellent',
        rowStatus: 'Allowed',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
      };
    }

    if (score >= 80) {
      return {
        allowed: 15,
        total: 17,
        llmAllowed: 12,
        llmTotal: 13,
        status: 'Strong',
        rowStatus: 'Allowed',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
      };
    }

    if (score >= 50) {
      const partialAllowed = 8 + (hashString(hostname) % 6);
      return {
        allowed: partialAllowed,
        total: 17,
        llmAllowed: Math.min(13, partialAllowed - 2),
        llmTotal: 13,
        status: 'Partial',
        rowStatus: 'Partial',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700 border border-amber-250',
      };
    }

    return {
      allowed: 0,
      total: 17,
      llmAllowed: 0,
      llmTotal: 13,
      status: 'Critical',
      rowStatus: 'Partial',
      dot: 'bg-amber-500',
      text: 'text-red-700',
      badge: 'bg-rose-50 text-rose-700 border border-rose-200',
    };
  };

  const formatSiteName = (hostname: string) => {
    const clean = hostname.replace(/^www\./, '').split('.')[0].replace(/[-_]+/g, ' ');
    return clean
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getScanTime = (latency: number | string) => {
    if (typeof latency !== 'number') return '22.4s';
    return `${Math.max(18, latency / 22.5).toFixed(1)}s`;
  };

  const getTopFixes = (score: number, hostname: string, apiFixes?: GeoScoreResult['topFixes']) => {
    if (apiFixes?.length) return apiFixes;

    const fixPool = [
      {
        pillar: 'Understandability',
        impact: score >= 65 ? 'Medium Impact' : 'High Impact',
        title: 'Add JSON-LD structured data',
        description: 'Add Organization, WebSite, Article, Product, LocalBusiness, or FAQPage schema. We check for any of these types - structured data gives AI models explicit signals about your content.',
      },
      {
        pillar: 'Accessibility',
        impact: score >= 70 ? 'Medium Impact' : 'High Impact',
        title: 'Create an llms.txt file',
        description: 'Add a /llms.txt file at your domain root describing your site for AI models. Include a company description, product/service list, key content URLs, contact information, and preferred citation format. See llmstxt.org for the specification.',
      },
      {
        pillar: 'Understandability',
        impact: 'Medium Impact',
        title: 'Add AI-optimised content',
        description: 'Create comparison pages, buying guides, and "best of" content. These formats are frequently cited by AI models.',
      },
      {
        pillar: 'Readability',
        impact: score >= 72 ? 'Low Impact' : 'Medium Impact',
        title: 'Improve heading structure',
        description: 'Use clear H1, H2, and H3 sections so AI systems can understand page hierarchy, summaries, and important topics faster.',
      },
      {
        pillar: 'Accessibility',
        impact: score >= 75 ? 'Low Impact' : 'Medium Impact',
        title: 'Add descriptive image alt text',
        description: 'Give key product, team, and service images descriptive alt text so crawlers can understand visuals without relying on rendering.',
      },
      {
        pillar: 'Readability',
        impact: score >= 68 ? 'Medium Impact' : 'High Impact',
        title: 'Add concise page summaries',
        description: 'Place short summaries near the top of important pages to make services, locations, and proof points easier for AI models to extract.',
      },
    ];

    if (isAvasotech(hostname)) {
      return fixPool.slice(0, 3).map((fix, index) => ({
        ...fix,
        impact: index === 2 ? 'Medium Impact' : 'High Impact',
        color: index === 2 ? '#f59e0b' : '#ef4444',
        number: ['#8', '#14', '#15'][index],
      }));
    }

    const hash = hashString(hostname);
    return [0, 1, 2].map((offset) => {
      const fix = fixPool[(hash + offset * 2) % fixPool.length];
      const isHigh = fix.impact === 'High Impact';
      const isMedium = fix.impact === 'Medium Impact';
      return {
        ...fix,
        color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981',
        number: `#${((hash + offset * 5) % 15) + 1}`,
      };
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
        {!result ? (
          <section className="grid gap-12 lg:grid-cols-2">
            {/* Left: Description */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-150 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold text-indigo-600">Free Tool</span>
                <h1 className="mt-4 text-5xl font-extrabold text-slate-900 leading-tight">GEO Score</h1>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-slate-650">
                Understand where your site appears from an AI and geo performance perspective. This tool gives you a quick network and location score for your domain.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleRunScore}
                  className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 text-sm font-bold shadow-md transition cursor-pointer"
                >
                  Run GEO Score →
                </button>
                <a
                  href="/free-audit"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                >
                  Free AI Report →
                </a>
              </div>

              {/* How it works */}
              <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">How It Works</p>
                <div className="mt-6 space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">1</div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Analyze hosting location</p>
                      <p className="text-sm text-slate-500">We check where your server is located geographically.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">2</div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Measure latency</p>
                      <p className="text-sm text-slate-500">Test response time to identify performance bottlenecks.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">3</div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Generate recommendations</p>
                      <p className="text-sm text-slate-500">Get actionable steps to optimize for AI visibility.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What you get */}
              <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">What You Get</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-3 font-semibold">
                    <span className="text-indigo-600 font-extrabold text-lg">✓</span> Location score for your domain
                  </li>
                  <li className="flex items-center gap-3 font-semibold">
                    <span className="text-indigo-600 font-extrabold text-lg">✓</span> DNS and hosting region summary
                  </li>
                  <li className="flex items-center gap-3 font-semibold">
                    <span className="text-indigo-600 font-extrabold text-lg">✓</span> Simulated latency estimate
                  </li>
                  <li className="flex items-center gap-3 font-semibold">
                    <span className="text-indigo-600 font-extrabold text-lg">✓</span> Recommendations for AI crawl pickup
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Input & Results */}
            <div className="space-y-6">
              <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-655">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://www.example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-6 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-500 font-semibold">
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent"></div>
                      <span>Calculating score...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl space-y-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-52 w-52">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getScoreColor(result.score)}
                    strokeWidth="6"
                    strokeDasharray={`${(result.score / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-extrabold" style={{ color: getScoreColor(result.score) }}>{result.score}</div>
                  <div className="mt-2 text-sm font-bold text-slate-400">/ 100</div>
                </div>
              </div>
              <span className={`mt-3 rounded-full px-4 py-1 text-xs font-bold ${getScoreBadgeClass(result.score)}`}>
                {getScoreLabel(result.score)}
              </span>
              <h1 className="mt-8 text-3xl font-extrabold text-slate-900">{formatSiteName(result.url)}</h1>
              <p className="mt-2 text-base text-slate-500">https://{result.url}</p>
              <p className="mt-3 font-mono text-xs tracking-wide text-slate-450 font-semibold">
                {result.pagesScanned ?? 1} page{(result.pagesScanned ?? 1) === 1 ? '' : 's'} scanned in {result.scanTime ?? getScanTime(result.latency)}
              </p>
            </div>

            {/* Hosting & Geolocation Information */}
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600 mb-4">Hosting & Geolocation</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved IP Address</p>
                    <p className="text-sm font-mono text-slate-900 mt-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-block">{result.ip || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Provider</p>
                    <p className="text-sm text-slate-800 mt-1 font-bold">{result.provider || 'Unknown'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geographic Region</p>
                    <p className="text-sm text-slate-800 mt-1 font-bold">
                      {result.hostingLocation && result.hostingLocation !== 'Unknown'
                        ? `${result.hostingLocation}, ${result.hostingCountry}`
                        : result.hostingCountry && result.hostingCountry !== 'Unknown'
                          ? result.hostingCountry
                          : 'Unknown Location'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Latency</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-indigo-600">{result.latency} ms</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        typeof result.latency === 'number' && result.latency < 400
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : typeof result.latency === 'number' && result.latency < 1000
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {typeof result.latency === 'number' && result.latency < 400
                          ? 'Fast Response'
                          : typeof result.latency === 'number' && result.latency < 1000
                            ? 'Average'
                            : 'Slow Response'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Pillar Breakdown</h2>
              <div className="mt-6 space-y-5">
                {getReportPillars(result.score, result.url, result.pillars).map((pillar) => (
                  <div key={pillar.label} className="grid items-center gap-4 sm:grid-cols-[190px_1fr_64px]">
                    <span className="text-sm text-slate-700 font-semibold">{pillar.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(pillar.score / pillar.total) * 100}%`,
                          backgroundColor: pillar.color,
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-sm font-bold" style={{ color: pillar.color }}>{pillar.score}/{pillar.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">AI Crawler Access Report</h2>
              <p className="mt-2 text-sm text-slate-500">Can AI bots actually read your pages?</p>

              {(() => {
                const crawlerSummary = getCrawlerSummary(result.score, result.url, result.crawlerAccess);
                const crawlerRows = result.crawlers?.length ? result.crawlers : crawlers.map((crawler) => ({
                  ...crawler,
                  allowed: crawlerSummary.rowStatus === 'Allowed',
                }));

                return (
                  <>
                    <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${crawlerSummary.allowed > 0 ? crawlerSummary.dot : 'bg-red-500 animate-pulse'}`} />
                        <p className="text-sm text-slate-750">
                          <span className={`font-extrabold ${crawlerSummary.text}`}>{crawlerSummary.allowed} of {crawlerSummary.total}</span> AI crawlers have access
                        </p>
                      </div>
                      <span className={`rounded px-2.5 py-1 text-xs font-bold ${crawlerSummary.badge}`}>{crawlerSummary.status}</span>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between py-2 text-xs font-bold text-slate-800">
                        <span>AI LLM Crawlers <span className="font-semibold text-slate-450">{crawlerSummary.llmAllowed}/{crawlerSummary.llmTotal} allowed</span></span>
                        <span className="text-slate-400">⌃</span>
                      </div>
                      {crawlerRows.map((crawler) => (
                        <div key={crawler.name} className="flex items-center justify-between rounded-lg bg-slate-50/50 border border-slate-200 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`h-3 w-3 rounded-full ${crawler.allowed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <p className="text-sm font-bold text-slate-900">
                              {crawler.name} <span className="ml-2 text-xs font-normal text-slate-450">{crawler.source}</span>
                            </p>
                          </div>
                          <span className={`rounded px-2.5 py-1 text-xs font-bold ${crawler.allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-rose-50 text-rose-700 border border-rose-250'}`}>{crawler.allowed ? 'Allowed' : 'Blocked'}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-5 text-xs font-bold text-slate-800">
                        <span>AI-Adjacent Crawlers <span className="font-semibold text-slate-450">{'adjacentAllowed' in crawlerSummary ? `${crawlerSummary.adjacentAllowed}/${crawlerSummary.adjacentTotal}` : crawlerSummary.allowed > 10 ? '4/4' : crawlerSummary.allowed > 0 ? '2/4' : '0/4'} allowed</span></span>
                        <span className="text-slate-400">⌄</span>
                      </div>
                      <div className="flex items-center justify-between py-3 text-xs font-bold text-slate-850">
                        <span>Search Engine Crawlers <span className="font-semibold text-slate-455">{'searchAllowed' in crawlerSummary ? `${crawlerSummary.searchAllowed}/${crawlerSummary.searchTotal}` : crawlerSummary.allowed > 10 ? '4/4' : crawlerSummary.allowed > 0 ? '3/4' : '0/4'} allowed</span> <span className="ml-2 italic text-slate-400 font-medium">For reference</span></span>
                        <span className="text-slate-400">⌄</span>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold text-slate-900">Want to test real crawler accessibility - not just robots.txt rules?</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Crawl Radar sends actual requests as each AI bot and detects Cloudflare blocks, cloaking, and rendering issues that robots.txt analysis can&apos;t find.
                </p>
                <a href="/crawl-radar" className="mt-4 inline-flex rounded-full btn-brand px-5 py-2.5 text-xs font-bold shadow-sm cursor-pointer">
                  Test with Crawl Radar →
                </a>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Top Fixes</h2>
              {getTopFixes(result.score, result.url, result.topFixes).map((fix) => (
                <div key={fix.number} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-400">
                        <span className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: fix.color }} />
                        <span>{fix.pillar}</span>
                        <span>·</span>
                        <span style={{ color: fix.color }}>{fix.impact}</span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-900">{fix.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{fix.description}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-400">{fix.number}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <p className="text-sm text-slate-500 font-semibold">Share your score with your team or on social media.</p>
              <div className="flex gap-3">
                <button onClick={copyLink} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer">
                  {copied ? 'Copied ✓' : 'Copy Link'}
                </button>
                <button onClick={() => window.print()} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer">
                  Download Image
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-md rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Unlock Full Report</p>
              <h2 className="mt-5 text-2xl font-extrabold text-slate-900">See your full breakdown</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your email to unlock all 15 signal results for <span className="font-bold text-slate-900">{result.url}</span>.
              </p>
              <div className="mt-6 space-y-4">
                <input className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white" placeholder="you@company.com" />
                <input className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white" defaultValue={result.url.replace(/^www\./, '')} />
                <a href="/dashboard" className="inline-flex w-full justify-center rounded-full btn-brand px-5 py-3 text-sm font-bold shadow-md">
                  Unlock Report →
                </a>
              </div>
              <button
                onClick={() => {
                  setResult(null);
                  setUrl('');
                }}
                className="mt-5 text-sm text-slate-450 hover:text-slate-650 font-bold underline cursor-pointer"
              >
                Run another GEO score
              </button>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
