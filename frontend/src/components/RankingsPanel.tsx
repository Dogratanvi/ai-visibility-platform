'use client';

import React, { useCallback, useEffect, useState } from 'react';

type Ranking = {
  id: string;
  brand: { id: string; name: string; slug: string };
  category: string;
  country: string;
  period: string;
  score: number;
  change?: number;
  sentiment?: string;
  tags: string[];
};

export default function RankingsPanel() {
  const [items, setItems] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('India');
  const [category, setCategory] = useState('skincare');
  const [period, setPeriod] = useState('2026-05');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(() => {
    setLoading(true);
    const skip = (page - 1) * pageSize;
    const url = new URL('http://localhost:5000/api/rankings');
    url.searchParams.set('country', country);
    url.searchParams.set('category', category);
    url.searchParams.set('period', period);
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('skip', String(skip));

    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        setItems(data?.data || []);
        setTotal(data?.total || 0);
      })
      .catch((e) => console.error('Failed to fetch rankings', e))
      .finally(() => setLoading(false));
  }, [category, country, page, pageSize, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100 border border-slate-200/50" />
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-250 bg-slate-50/50 p-6 text-center">
            <p className="text-sm font-bold text-slate-800">No rankings available yet</p>
            <p className="mt-1 max-w-md mx-auto text-xs text-slate-450 leading-relaxed font-semibold">
              The live leaderboard will appear here as soon as matching ranking data is available.
            </p>
          </div>
        )}

        {!loading && items.map((r, index) => (
          <div key={r.id} className="grid gap-3 rounded-2xl border border-slate-150 bg-white p-4 text-xs font-semibold text-slate-600 sm:grid-cols-[1.5fr_0.8fr_0.8fr_1fr] items-center transition hover:border-slate-300 hover:shadow-xs">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-150 text-xs font-extrabold text-indigo-650">
                {(page - 1) * pageSize + index + 1}
              </div>
              <span className="truncate font-extrabold text-slate-900 text-sm">{r.brand.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Score</span>
              <span className="text-slate-800 font-extrabold text-sm">{Math.round(r.score)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Sentiment</span>
              <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full ${
                r.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                r.sentiment === 'MIXED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-50 text-slate-500 border border-slate-200'
              }`}>
                {r.sentiment || 'NEUTRAL'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Key Tags</span>
              <div className="flex flex-wrap gap-1">
                {r.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 font-semibold">
                    {tag}
                  </span>
                ))}
                {r.tags.length === 0 && <span className="text-slate-400 font-bold">-</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 text-xs font-semibold text-slate-600 xl:grid-cols-[1fr_auto] border-t border-slate-150 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-slate-450 block">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Country</span>
            <select
              value={country}
              onChange={(e) => { setPage(1); setCountry(e.target.value); }}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:bg-white focus:border-indigo-500 font-semibold"
            >
              <option value="India">India</option>
              <option value="US">US</option>
            </select>
          </label>

          <label className="space-y-1 text-slate-450 block">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Category</span>
            <select
              value={category}
              onChange={(e) => { setPage(1); setCategory(e.target.value); }}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:bg-white focus:border-indigo-500 font-semibold"
            >
              <option value="skincare">Skincare</option>
              <option value="travel">Travel</option>
            </select>
          </label>

          <label className="space-y-1 text-slate-450 block">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Period</span>
            <input
              value={period}
              onChange={(e) => { setPage(1); setPeriod(e.target.value); }}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:bg-white focus:border-indigo-500 font-semibold"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-2 xl:justify-end">
          <label className="space-y-1 text-slate-450 block">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:bg-white focus:border-indigo-500 font-semibold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 transition font-bold disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
          >
            Prev
          </button>
          <div className="flex h-10 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-500 font-bold">
            Page {page} / {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <button
            disabled={(page * pageSize) >= total}
            onClick={() => setPage((p) => p + 1)}
            className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 transition font-bold disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
