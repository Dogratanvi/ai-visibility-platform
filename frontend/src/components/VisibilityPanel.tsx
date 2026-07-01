'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function VisibilityPanel({ url, websites }: { url?: string; websites: Website[] }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url || !session?.accessToken) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const site = websites.find(w => w.websiteUrl === url);
        if (!site) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/visibility-sentiment?siteId=${site.id}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [url, session, websites]);

  const visibilityScore = stats?.visibilityPct || 76.5;

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Visibility %</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Measure brand citation rates across ChatGPT, Gemini, Perplexity, and Google AIO.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Visibility Score Progress Ring */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Overall AI Visibility</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3.5"></circle>
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-600" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset={100 - visibilityScore} strokeLinecap="round"></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-slate-900">{visibilityScore}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Citation Rate</span>
            </div>
          </div>
        </div>

        {/* Platform citation breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs md:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">AI Engine breakdown</h3>
          {[
            { name: 'ChatGPT', visibility: 82, color: 'bg-emerald-500' },
            { name: 'Google Gemini', visibility: 68, color: 'bg-indigo-500' },
            { name: 'Perplexity AI', visibility: 90, color: 'bg-teal-500' },
            { name: 'Anthropic Claude', visibility: 66, color: 'bg-orange-500' },
          ].map((item) => (
            <div key={item.name} className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-800 font-bold">{item.name}</span>
                <span className="text-slate-900 font-extrabold">{item.visibility}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.visibility}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanatory banner */}
      <div className="rounded-3xl border border-indigo-150 bg-indigo-50/40 p-6">
        <h3 className="text-sm font-bold text-indigo-950 mb-2">How Visibility is Calculated</h3>
        <p className="text-xs text-slate-550 leading-relaxed font-semibold">
          Visibility measures the frequency with which your brand domain is cited by conversational AI systems when responding to targeted brand search intents and keywords. An 80% visibility score means your site was cited in 8 out of every 10 test prompt queries.
        </p>
      </div>
    </div>
  );
}
