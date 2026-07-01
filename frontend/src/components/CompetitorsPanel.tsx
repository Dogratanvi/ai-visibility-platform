'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function CompetitorsPanel({ url, websites }: { url?: string; websites: Website[] }) {
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/competitors?siteId=${site.id}`, {
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

  const userBrand = data?.userBrand || { name: 'Your Brand', shareOfVoice: 34.5, mentionsCount: 154 };
  const competitors = data?.competitors || [
    { name: 'Minimalist', shareOfVoice: 28.1, mentionsCount: 125 },
    { name: 'The Derma Co', shareOfVoice: 21.4, mentionsCount: 95 },
    { name: 'Reequil', shareOfVoice: 16.0, mentionsCount: 71 },
  ];

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Competitor Comparison</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Benchmark your Share of Voice against primary industry competitors inside AI citations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Share of voice comparison chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Share of Voice Breakdown</h3>
          <div className="space-y-4">
            <div className="space-y-1 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-indigo-650">{userBrand.name}</span>
                <span className="text-slate-900">{userBrand.shareOfVoice}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${userBrand.shareOfVoice}%` }} />
              </div>
            </div>
            {competitors.map((item: any) => (
              <div key={item.name} className="space-y-1 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-900">{item.shareOfVoice}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: `${item.shareOfVoice}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Brand Mentions Leaderboard</h3>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-2.5 text-xs font-bold text-slate-900">
              <span>Brand</span>
              <span>Citations Count</span>
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs font-bold text-indigo-650">
              <span>{userBrand.name} (You)</span>
              <span>{userBrand.mentionsCount} mentions</span>
            </div>
            {competitors.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between py-2.5 text-xs font-semibold text-slate-650">
                <span>{item.name}</span>
                <span>{item.mentionsCount} mentions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
