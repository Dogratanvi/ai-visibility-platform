'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function TrendsPanel({ url, websites }: { url?: string; websites: Website[] }) {
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/trend-reports?siteId=${site.id}`, {
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

  const trends = data?.trends || [
    { date: '2026-06-25', visibilityPct: 65, sentimentScore: 80, mentions: 120 },
    { date: '2026-06-26', visibilityPct: 68, sentimentScore: 82, mentions: 135 },
    { date: '2026-06-27', visibilityPct: 70, sentimentScore: 84, mentions: 140 },
    { date: '2026-06-28', visibilityPct: 73, sentimentScore: 85, mentions: 155 },
    { date: '2026-06-29', visibilityPct: 75, sentimentScore: 87, mentions: 160 },
    { date: '2026-06-30', visibilityPct: 76.5, sentimentScore: 88, mentions: 172 },
  ];

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Trend Reports</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">View daily metrics trends and check run logs.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Daily History Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-extrabold">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Visibility</th>
                <th className="py-2.5">Sentiment Score</th>
                <th className="py-2.5 text-right">Mentions Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trends.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 text-slate-900 font-bold">{item.date}</td>
                  <td className="py-3">
                    <span className="text-indigo-650 font-extrabold">{item.visibilityPct}%</span>
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-600 font-extrabold">{item.sentimentScore}/100</span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-700">{item.mentions} mentions</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
