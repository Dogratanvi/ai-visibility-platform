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
      <div className="min-h-screen bg-[#0f1117] text-white p-6">
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#2a2d3a] bg-[#13151f] p-8 text-center">
          <h1 className="text-3xl font-semibold mb-4">No website selected</h1>
          <p className="text-slate-400 mb-6">Please return to the dashboard and choose a website to track keywords for.</p>
          <Link href="/dashboard" className="inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Rank Tracker</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track ranking keywords for your selected website.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-500/10 border border-red-500 text-red-200 px-4 py-3">{error}</div>}

        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2a2d3a] bg-[#13151f] p-6">
              <h2 className="text-xl font-semibold mb-3">Add keyword to track</h2>
              <div className="space-y-3">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  className="w-full rounded-2xl border border-[#2a2d3a] bg-[#0f1117] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
                <button
                  onClick={addKeyword}
                  disabled={loading || !keyword}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {loading ? 'Adding...' : 'Add Keyword'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2d3a] bg-[#13151f] p-6">
              <h2 className="text-xl font-semibold mb-3">Tracked keywords</h2>
              {keywords.length === 0 ? (
                <p className="text-slate-400">No keywords tracked yet. Add one to start tracking.</p>
              ) : (
                <div className="space-y-3">
                  {keywords.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[#2a2d3a] bg-[#0f1117] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.keyword}</p>
                          <p className="text-xs text-slate-500">Rank: {item.currentRank ?? '—'}</p>
                        </div>
                        <span className="text-xs text-slate-400">Added {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2d3a] bg-[#13151f] p-6">
            <h2 className="text-xl font-semibold mb-3">How rank tracking works</h2>
            <p className="text-sm text-slate-400 leading-6">
              Add keywords for the selected site and build a schedule to check their search rankings. The backend can store these keywords and later update their positions by querying Google Search or any rank tracking API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
