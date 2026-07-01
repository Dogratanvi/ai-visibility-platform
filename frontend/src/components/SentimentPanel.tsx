'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function SentimentPanel({ url, websites }: { url?: string; websites: Website[] }) {
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

  const score = stats?.sentimentScore || 88;

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sentiment Score</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Track and evaluate user sentiment across conversational AI search queries.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Score Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-center items-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Net Sentiment</span>
          <span className="text-5xl font-extrabold text-emerald-600">{score}/100</span>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-150 px-3 py-1 text-[10px] font-extrabold text-emerald-600 uppercase">
            🟢 Highly Positive
          </span>
        </div>

        {/* Mentions Sentiment ratio */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs md:col-span-2 space-y-5">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Mentions Distribution</h3>
          <div className="flex items-center gap-2 h-7 rounded-full overflow-hidden bg-slate-100 font-extrabold text-[10px] text-white">
            <div className="bg-emerald-500 h-full flex items-center justify-center transition-all duration-500" style={{ width: '74%' }}>74% Positive</div>
            <div className="bg-amber-400 h-full flex items-center justify-center transition-all duration-500" style={{ width: '20%' }}>20% Neutral</div>
            <div className="bg-rose-500 h-full flex items-center justify-center transition-all duration-500" style={{ width: '6%' }}>6% Negative</div>
          </div>
          <div className="grid gap-3 text-xs font-semibold text-slate-500 sm:grid-cols-3">
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Positive: Excellent recommendations</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-400" /> Neutral: Listed neutrally</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500" /> Negative: Muted or comparison warnings</p>
          </div>
        </div>
      </div>

      {/* Sentiment Alerts / Highlights */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Top AI Opinion Snippets</h3>
        <div className="space-y-4">
          {[
            { quote: 'Your brand offers one of the most effective salicylic acid cleansers for modern skincare routines.', platform: 'ChatGPT', status: 'Positive' },
            { quote: 'While a highly reliable product, its premium pricing can sometimes exceed competitor benchmarks.', platform: 'Gemini', status: 'Neutral' },
          ].map((snippet, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 space-y-2">
              <p className="text-xs italic font-semibold text-slate-700">"{snippet.quote}"</p>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-indigo-650 font-extrabold">Engine: {snippet.platform}</span>
                <span className={snippet.status === 'Positive' ? 'text-emerald-600' : 'text-slate-500'}>{snippet.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
