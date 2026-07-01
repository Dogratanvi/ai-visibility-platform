'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RankTrackerClient({ siteId: siteIdProp }: { siteId?: string }) {
  const searchParams = useSearchParams();
  const querySiteId = searchParams.get('site');
  const siteId = siteIdProp || querySiteId;
  const { data: session, status } = useSession();
  const [keywords, setKeywords] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && siteId) {
      fetchKeywords();
    }
  }, [status, siteId]);

  const fetchKeywords = async () => {
    if (!siteId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/websites/${siteId}/keywords`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setKeywords(data);
      } else {
        setError(data.error || 'Unable to load keywords');
      }
    } catch {
      setError('Unable to load keywords');
    }
  };

  const addKeyword = async () => {
    if (!keyword || !siteId) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/websites/${siteId}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ keyword })
      });
      const data = await res.json();
      if (res.ok) {
        setKeywords((prev) => [...prev, data]);
        setKeyword('');
      } else {
        setError(data.error || 'Unable to add keyword');
      }
    } catch {
      setError('Unable to add keyword');
    }
    setLoading(false);
  };

  if (!siteId) {
    return (
      <div className="min-h-[60vh] bg-transparent text-slate-800 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white shadow-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">No Website Selected</h1>
          <p className="text-xs font-semibold text-slate-500 mb-6">Please return to the dashboard and choose a website to track keywords for.</p>
          <Link href="/dashboard" className="inline-block rounded-2xl btn-brand px-5 py-3 text-xs font-bold text-white hover:shadow-md transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-850">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prompt Tracker</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Track ranking keywords and prompts for your selected website.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-indigo-650 hover:text-indigo-750 transition">
            Back to Dashboard
          </Link>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Add Keyword Box */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <h2 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wider text-indigo-650">Add Keyword / Prompt to Track</h2>
              <div className="space-y-3">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. best organic skincare brand"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-850 outline-none focus:border-indigo-500 transition font-semibold"
                />
                <button
                  onClick={addKeyword}
                  disabled={loading || !keyword}
                  className="rounded-2xl btn-brand px-5 py-3 text-xs font-bold text-white hover:shadow-md disabled:opacity-50 transition cursor-pointer select-none"
                >
                  {loading ? 'Adding...' : 'Add Keyword'}
                </button>
              </div>
            </div>

            {/* Tracked Keywords List */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <h2 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wider text-indigo-650">Tracked Keywords / Prompts</h2>
              {keywords.length === 0 ? (
                <p className="text-xs font-semibold text-slate-450">No keywords tracked yet. Add one to start tracking.</p>
              ) : (
                <div className="space-y-3">
                  {keywords.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-150 bg-white p-4 transition hover:border-slate-350">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                        <div>
                          <p className="font-bold text-slate-800">“{item.keyword}”</p>
                          <p className="text-slate-450 text-[10px] mt-1 flex items-center gap-1.5">
                            <span>Current Position:</span>
                            <span className="text-slate-800 font-extrabold uppercase bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                              {item.currentRank !== null ? `#${item.currentRank}` : '—'}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explanation Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
            <h2 className="text-sm font-extrabold text-slate-900 mb-3 uppercase tracking-wider text-indigo-650">How Rank Tracking Works</h2>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Add keywords or conversational query prompts for your website to set up automated SERP and AI-mentions ranking analytics. 
              The platform schedules periodic background jobs to search for references to your domain and update your rankings relative to competitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
