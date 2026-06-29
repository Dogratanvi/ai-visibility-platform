"use client";
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
    <div className="space-y-5">
      <div className="mt-5 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[72px] animate-pulse rounded-2xl bg-white/[0.05]" />
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.035] p-5">
            <p className="text-sm font-semibold text-white">No rankings available yet</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/55">The live leaderboard will appear here as soon as matching ranking data is available.</p>
          </div>
        )}

        {items.map((r, index) => (
          <div key={r.id} className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80 sm:grid-cols-[1.5fr_0.7fr_0.9fr_1fr]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#64f4d2]/12 text-sm font-semibold text-[#64f4d2]">{index + 1}</div>
              <span className="truncate font-semibold text-white">{r.brand.name}</span>
            </div>
            <span className="text-white/70">Score {Math.round(r.score)}</span>
            <span className="text-white">{r.sentiment ? r.sentiment : '-'}</span>
            <span className="truncate text-white/65">{r.tags.slice(0, 2).join(', ')}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 text-sm text-white/70 xl:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-xs text-white/45">
            <span>Country</span>
            <select value={country} onChange={(e) => { setPage(1); setCountry(e.target.value); }} className="h-10 w-full rounded-xl border border-white/10 bg-[#07101e] px-3 text-sm text-white outline-none transition focus:border-[#64f4d2]/50">
              <option value="India">India</option>
              <option value="US">US</option>
            </select>
          </label>

          <label className="space-y-1 text-xs text-white/45">
            <span>Category</span>
            <select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} className="h-10 w-full rounded-xl border border-white/10 bg-[#07101e] px-3 text-sm text-white outline-none transition focus:border-[#64f4d2]/50">
              <option value="skincare">Skincare</option>
              <option value="travel">Travel</option>
            </select>
          </label>

          <label className="space-y-1 text-xs text-white/45">
            <span>Period</span>
            <input value={period} onChange={(e) => { setPage(1); setPeriod(e.target.value); }} className="h-10 w-full rounded-xl border border-white/10 bg-[#07101e] px-3 text-sm text-white outline-none transition focus:border-[#64f4d2]/50" />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-2 xl:justify-end">
          <label className="space-y-1 text-xs text-white/45">
            <span>Rows</span>
            <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className="h-10 rounded-xl border border-white/10 bg-[#07101e] px-3 text-sm text-white outline-none transition focus:border-[#64f4d2]/50">
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
          <div className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white/70">Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
          <button disabled={(page * pageSize) >= total} onClick={() => setPage(p => p + 1)} className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
