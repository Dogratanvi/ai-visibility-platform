'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

type CommandCenter = {
  website: {
    id: string;
    name: string;
    url: string;
  };
  updatedAt: string;
  overview: {
    mentionRate: number;
    previousMentionRate: number;
    change: number;
    avgPosition: number;
    shareOfVoice: number;
    wins: number;
    gaps: number;
    trending: number;
    monitoredPlatforms: number;
    promptsTracked: number;
  };
  platforms: Array<{ name: string; mentionRate: number; avgPosition: number }>;
  prompts: Array<{ prompt: string; visibility: number; impact: 'high' | 'medium' | 'low' }>;
  competitors: Array<{ name: string; shareOfVoice: number }>;
  citations: Array<{ domain: string; type: string; mentions: number; priority: 'high' | 'medium' | 'low' }>;
  actions: Array<{ title: string; detail: string; impact: string }>;
};

const moduleTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'platforms', label: 'AI Platforms' },
  { id: 'prompts', label: 'Prompt Intelligence' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'citations', label: 'Citations' },
  { id: 'actions', label: 'Actions' },
];

type CommandCenterPanelProps = {
  websites: Website[];
  selectedWebsiteId?: string | null;
  onSelectedWebsiteChange?: (websiteId: string) => void;
};

export default function CommandCenterPanel({ websites, selectedWebsiteId, onSelectedWebsiteChange }: CommandCenterPanelProps) {
  const { data: session } = useSession();
  const [websiteId, setWebsiteId] = useState(selectedWebsiteId || websites[0]?.id || '');
  const [activeModule, setActiveModule] = useState('overview');
  const [data, setData] = useState<CommandCenter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedCandidateId = selectedWebsiteId || websiteId;
  const activeWebsiteId = websites.some((website) => website.id === selectedCandidateId)
    ? selectedCandidateId
    : websites[0]?.id || '';

  const activeWebsite = useMemo(
    () => websites.find((website) => website.id === activeWebsiteId),
    [activeWebsiteId, websites],
  );

  useEffect(() => {
    if (!activeWebsiteId || !session?.accessToken) return;

    const loadCommandCenter = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/command-center/${activeWebsiteId}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Unable to load command center');
        setData(body);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load command center');
      } finally {
        setLoading(false);
      }
    };

    loadCommandCenter();
  }, [activeWebsiteId, session?.accessToken]);

  if (websites.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-250 bg-slate-50/50 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Add a website first</h2>
        <p className="mt-2 text-xs font-semibold text-slate-450">Your AI visibility command center will unlock after you add a website.</p>
      </div>
    );
  }

  const maxSov = Math.max(...(data?.competitors.map((item) => item.shareOfVoice) || [1]));

  return (
    <div className="space-y-6 text-slate-850">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full inline-block">
            AI Visibility Command Center
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">{activeWebsite?.propertyName || 'Website'} Dashboard</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">Track, diagnose, and fix AI visibility gaps across prompts, platforms, competitors, and citations.</p>
        </div>
        <select
          value={activeWebsiteId}
          onChange={(event) => {
            setWebsiteId(event.target.value);
            onSelectedWebsiteChange?.(event.target.value);
          }}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition shadow-xs"
        >
          {websites.map((website) => (
            <option key={website.id} value={website.id}>{website.propertyName}</option>
          ))}
        </select>
      </div>

      {/* Module Tabs Header */}
      <div className="grid gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-1.5 md:grid-cols-3 xl:grid-cols-6">
        {moduleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveModule(tab.id)}
            className={`h-9 rounded-xl px-3 text-xs font-bold transition select-none cursor-pointer ${
              activeModule === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-xs font-semibold text-slate-400">Loading command center...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {!loading && data && (
        <>
          {activeModule === 'overview' && (
            <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Highlight metrics Card */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Overall Mention Rate</p>
                    <p className="mt-3 text-6xl font-extrabold text-slate-900">{data.overview.mentionRate}%</p>
                    <p className={`mt-3 text-xs font-bold ${data.overview.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {data.overview.change >= 0 ? '▲ +' : '▼ '}{data.overview.change}pts vs last month
                    </p>
                  </div>
                  <div className="rounded-full bg-indigo-50 border border-indigo-150 px-3 py-1 text-[10px] font-extrabold text-indigo-700">
                    {data.overview.monitoredPlatforms} AI Platforms
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Wins', data.overview.wins],
                    ['Gaps', data.overview.gaps],
                    ['Trending', data.overview.trending],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-150 bg-white p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snapshot Table Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Snapshot</p>
                <div className="mt-5 space-y-4 font-semibold text-xs">
                  {[
                    ['Avg Position', `#${data.overview.avgPosition}`],
                    ['Share of Voice', `${data.overview.shareOfVoice}%`],
                    ['Prompts Tracked', data.overview.promptsTracked],
                    ['Updated', new Date(data.updatedAt).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-extrabold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeModule === 'platforms' && (
            <section className="grid gap-4 lg:grid-cols-5">
              {data.platforms.map((platform) => (
                <div key={platform.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-350">
                  <p className="font-bold text-slate-900 text-sm">{platform.name}</p>
                  <p className="mt-4 text-3xl font-extrabold text-indigo-650">{platform.mentionRate}%</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${platform.mentionRate}%` }} />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400">Avg position #{platform.avgPosition}</p>
                </div>
              ))}
            </section>
          )}

          {activeModule === 'prompts' && (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-150 px-6 py-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm">Prompt-Level Performance</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {data.prompts.length === 0 ? (
                  <div className="px-6 py-10 text-center text-xs font-semibold text-slate-450">
                    Add tracked prompts or keywords to populate prompt-level performance.
                  </div>
                ) : data.prompts.map((prompt) => (
                  <div key={prompt.prompt} className="grid gap-4 px-6 py-4 md:grid-cols-[1fr_120px_100px] md:items-center text-xs font-semibold">
                    <p className="font-extrabold text-slate-800">“{prompt.prompt}”</p>
                    <div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${prompt.visibility}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400">{prompt.visibility}% visible</p>
                    </div>
                    <div className="flex justify-end">
                      <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                        prompt.impact === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {prompt.impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'competitors' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-950 text-sm">Head-to-Head Share of Voice</h3>
              <div className="mt-6 space-y-5">
                {data.competitors.map((competitor) => (
                  <div key={competitor.name}>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="font-bold text-slate-800">{competitor.name}</span>
                      <span className="text-slate-500">{competitor.shareOfVoice}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-2.5 rounded-full bg-indigo-650" style={{ width: `${(competitor.shareOfVoice / maxSov) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'citations' && (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-150 px-6 py-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm">Citation Intelligence</h3>
              </div>
              <div className="divide-y divide-slate-150">
                {data.citations.map((citation) => (
                  <div key={citation.domain} className="grid gap-3 px-6 py-4 text-xs font-semibold md:grid-cols-[1fr_120px_100px_100px] items-center">
                    <span className="font-bold text-slate-800">{citation.domain}</span>
                    <span className="text-slate-450 uppercase text-[10px]">{citation.type}</span>
                    <span className="text-slate-600 font-extrabold">{citation.mentions} mentions</span>
                    <div className="flex justify-end">
                      <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                        citation.priority === 'high'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-550 border border-slate-200'
                      }`}>
                        {citation.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'actions' && (
            <section className="grid gap-5 lg:grid-cols-3">
              {data.actions.map((action, index) => (
                <article key={action.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 border border-indigo-150 text-xs font-extrabold text-indigo-650">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">{action.impact} impact</p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{action.title}</h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-500 font-semibold">{action.detail}</p>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
