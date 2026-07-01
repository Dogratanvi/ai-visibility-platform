'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function SourcesPanel({ url, websites }: { url?: string; websites: Website[] }) {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url || !session?.accessToken) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const site = websites.find(w => w.websiteUrl === url);
        if (!site) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/source-urls?siteId=${site.id}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        });
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [url, session, websites]);

  const sources = data?.sources || [
    { url: 'https://www.reddit.com/r/SkincareAddiction/comments/glow', platform: 'Perplexity', authorityScore: 85, mentionsCount: 12 },
    { url: 'https://en.wikipedia.org/wiki/Salicylic_acid', platform: 'ChatGPT', authorityScore: 98, mentionsCount: 9 },
    { url: 'https://www.healthline.com/health/skincare-routine', platform: 'Gemini', authorityScore: 92, mentionsCount: 6 },
    { url: 'https://www.cosmopolitan.com/beauty-trends', platform: 'Claude', authorityScore: 78, mentionsCount: 4 },
  ];

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Source URLs used by AI</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Audit the exact third-party websites and authority resources cited by search engines to verify your brand presence.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Cited Resources List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-extrabold">
                <th className="py-2.5">Cited Source URL</th>
                <th className="py-2.5">Engine</th>
                <th className="py-2.5">Authority Score</th>
                <th className="py-2.5 text-right">Mentions Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline break-all">
                      {item.url}
                    </a>
                  </td>
                  <td className="py-3">
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900">{item.authorityScore}/100</td>
                  <td className="py-3 text-right font-extrabold text-slate-900">{item.mentionsCount} times</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
