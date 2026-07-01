'use client';

import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const sitemapLinks = [
  {
    category: 'Core Features',
    links: [
      { path: '/', label: 'Homepage' },
      { path: '/geo-score', label: 'GEO Score Auditor' },
      { path: '/crawl-radar', label: 'AI Crawl Radar' },
      { path: '/free-audit', label: 'Free AI Citation Audit' },
      { path: '/cited-index', label: 'AI Visibility Index' },
      { path: '/pricing', label: 'Plans & Pricing' },
    ],
  },
  {
    category: 'Resources',
    links: [
      { path: '/blog', label: 'AISO Insights Blog' },
      { path: '/documentation', label: 'Documentation Hub' },
      { path: '/api-access', label: 'API Reference' },
      { path: '/support', label: 'Support Helpdesk' },
    ],
  },
  {
    category: 'Legal & Portals',
    links: [
      { path: '/privacy', label: 'Privacy Policy' },
      { path: '/terms', label: 'Terms of Service' },
      { path: '/login', label: 'Login Portal' },
      { path: '/register', label: 'Register Account' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Navigation Guide</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Platform Sitemap</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            A comprehensive directory of all tools, documentation hubs, and portals on our website.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {sitemapLinks.map((section) => (
            <div key={section.category} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-650 border-b border-slate-100 pb-3 mb-4">
                {section.category}
              </h2>
              <ul className="space-y-3 font-semibold text-sm">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link href={link.path} className="text-slate-700 hover:text-indigo-600 transition flex items-center gap-2">
                      <span className="text-slate-300 select-none">•</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
