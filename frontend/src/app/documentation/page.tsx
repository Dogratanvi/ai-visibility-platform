'use client';

import { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { slug: 'introduction', title: 'Introduction to AISO', description: 'Learn what AI Search Optimization is and why it matters.' },
      { slug: 'quickstart', title: 'Quickstart Guide', description: 'Get started tracking your brand visibility in under 5 minutes.' },
    ],
  },
  {
    id: 'core-metrics',
    title: 'Core Visibility Metrics',
    items: [
      { slug: 'geo-score', title: 'Understanding GEO Scores', description: 'How Generative Engine Optimization scores are calculated.' },
      { slug: 'share-of-voice', title: 'AI Share of Voice (SoV)', description: 'Tracking brand citation percentage against key competitors.' },
    ],
  },
  {
    id: 'crawler-control',
    title: 'AI Crawler Management',
    items: [
      { slug: 'robots-txt', title: 'Robots.txt Configuration', description: 'Allow or block GPTBot, Google-Extended, and other AI agents.' },
      { slug: 'crawl-prevention', title: 'Crawler Best Practices', description: 'Prevent unwanted data scraping while retaining citation visibility.' },
    ],
  },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoc, setActiveDoc] = useState(docSections[0].items[0]);

  const filteredSections = docSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Developer Hub</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Platform Documentation</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            Configure integrations, optimize site tags, and set up tracking for all major Generative Search engines.
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3.5 pl-12 text-sm text-slate-800 placeholder:text-slate-405 focus:bg-white focus:border-indigo-500 focus:outline-none shadow-xs transition"
            />
            <span className="absolute left-4 top-4 text-slate-400">🔎</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="space-y-6">
            {filteredSections.map(section => (
              <div key={section.id}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 mb-3">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item.slug}>
                      <button
                        onClick={() => setActiveDoc(item)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                          activeDoc.slug === item.slug
                            ? 'bg-indigo-50/70 text-indigo-750 font-bold border-l-4 border-indigo-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* Main Doc Content */}
          <article className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-6 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-650">Guide</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{activeDoc.title}</h2>
              <p className="text-slate-550 mt-1">{activeDoc.description}</p>
            </div>

            <div className="prose max-w-none text-slate-650 space-y-6">
              <p>
                Generative Search Engines (such as OpenAI SearchGPT, Google Gemini, and Perplexity AI) differ from traditional index-based search. Instead of ranking simple hyperlinks, they synthesize answers from trusted resources, citing them inline or in pop-up tabs.
              </p>
              
              <h3 className="text-xl font-bold text-slate-900 pt-3">Key Technical Concepts</h3>
              <p>
                To secure citation visibility, websites must optimize their structural markup and configure user-agents properly.
              </p>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <h4 className="font-bold text-slate-900 text-sm mb-2">💡 Quick Tip: structured-data</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generative engines prioritize JSON-LD structured data formats. Ensure your site uses appropriate schema declarations for articles, products, and organizations.
                </p>
              </div>

              <h3 className="text-xl font-bold text-slate-900 pt-3">Sample Robots.txt Directive</h3>
              <pre className="bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-sm overflow-x-auto leading-relaxed">
{`# Allow friendly citation indexing, block massive content scraper agents
User-agent: GPTBot
Allow: /blog
Disallow: /admin

User-agent: PerplexityBot
Allow: /`}
              </pre>

              <p>
                If you have further questions or need programmatic support, check our <a href="/api-access" className="text-indigo-600 font-bold hover:underline">API Reference</a> or contact the <a href="/support" className="text-indigo-600 font-bold hover:underline">Helpdesk</a>.
              </p>
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
