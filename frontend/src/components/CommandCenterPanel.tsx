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
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Add a website first</h2>
        <p className="mt-2 text-sm text-white/55">Your AI visibility command center will unlock after you add a website.</p>
      </div>
    );
  }

  const maxSov = Math.max(...(data?.competitors.map((item) => item.shareOfVoice) || [1]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#64f4d2]">AI visibility command center</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{activeWebsite?.propertyName || 'Website'} dashboard</h2>
          <p className="mt-1 text-sm text-white/55">Track, diagnose, and fix AI visibility gaps across prompts, platforms, competitors, and citations.</p>
        </div>
        <select
          value={activeWebsiteId}
          onChange={(event) => {
            setWebsiteId(event.target.value);
            onSelectedWebsiteChange?.(event.target.value);
          }}
          className="h-11 rounded-xl border border-white/10 bg-[#07101e] px-4 text-sm text-white outline-none focus:border-[#64f4d2]/50"
        >
          {websites.map((website) => (
            <option key={website.id} value={website.id}>{website.propertyName}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2 md:grid-cols-3 xl:grid-cols-6">
        {moduleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveModule(tab.id)}
            className={`h-10 rounded-xl px-3 text-sm font-medium transition ${activeModule === tab.id ? 'bg-[#5b74ff] text-white' : 'text-white/62 hover:bg-white/[0.06] hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-sm text-white/60">Loading command center...</div>}
      {error && <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      {!loading && data && (
        <>
          {activeModule === 'overview' && (
            <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0a1727] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-white/45">Overall Mention Rate</p>
                    <p className="mt-3 text-6xl font-semibold text-white">{data.overview.mentionRate}%</p>
                    <p className={`mt-3 text-sm ${data.overview.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {data.overview.change >= 0 ? '+' : ''}{data.overview.change}pts vs last month
                    </p>
                  </div>
                  <div className="rounded-full bg-[#64f4d2]/12 px-3 py-1 text-xs text-[#9ff8df]">
                    {data.overview.monitoredPlatforms} AI platforms
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Wins', data.overview.wins],
                    ['Gaps', data.overview.gaps],
                    ['Trending', data.overview.trending],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/45">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs uppercase text-white/45">Snapshot</p>
                <div className="mt-5 space-y-4">
                  {[
                    ['Avg Position', `#${data.overview.avgPosition}`],
                    ['Share of Voice', `${data.overview.shareOfVoice}%`],
                    ['Prompts Tracked', data.overview.promptsTracked],
                    ['Updated', new Date(data.updatedAt).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-white/55">{label}</span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeModule === 'platforms' && (
            <section className="grid gap-4 lg:grid-cols-5">
              {data.platforms.map((platform) => (
                <div key={platform.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-semibold text-white">{platform.name}</p>
                  <p className="mt-5 text-4xl font-semibold text-[#64f4d2]">{platform.mentionRate}%</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-[#64f4d2]" style={{ width: `${platform.mentionRate}%` }} />
                  </div>
                  <p className="mt-4 text-sm text-white/55">Avg position #{platform.avgPosition}</p>
                </div>
              ))}
            </section>
          )}

          {activeModule === 'prompts' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="font-semibold text-white">Prompt-level performance</h3>
              </div>
              <div className="divide-y divide-white/10">
                {data.prompts.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-white/55">
                    Add tracked prompts or keywords to populate prompt-level performance.
                  </div>
                ) : data.prompts.map((prompt) => (
                  <div key={prompt.prompt} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_120px_90px] md:items-center">
                    <p className="text-sm font-medium text-white">“{prompt.prompt}”</p>
                    <div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-[#8fa4ff]" style={{ width: `${prompt.visibility}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-white/50">{prompt.visibility}% visible</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-center text-xs font-semibold uppercase ${prompt.impact === 'high' ? 'bg-red-400/15 text-red-200' : 'bg-amber-400/15 text-amber-100'}`}>
                      {prompt.impact}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'competitors' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="font-semibold text-white">Head-to-head share of voice</h3>
              <div className="mt-6 space-y-4">
                {data.competitors.map((competitor) => (
                  <div key={competitor.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{competitor.name}</span>
                      <span className="text-white/55">{competitor.shareOfVoice}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10">
                      <div className="h-3 rounded-full bg-[#5b74ff]" style={{ width: `${(competitor.shareOfVoice / maxSov) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'citations' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="font-semibold text-white">Citation intelligence</h3>
              </div>
              <div className="divide-y divide-white/10">
                {data.citations.map((citation) => (
                  <div key={citation.domain} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_120px_100px_100px]">
                    <span className="font-medium text-white">{citation.domain}</span>
                    <span className="text-white/55">{citation.type}</span>
                    <span className="text-white/75">{citation.mentions} mentions</span>
                    <span className={`rounded-full px-3 py-1 text-center text-xs font-semibold uppercase ${citation.priority === 'high' ? 'bg-[#64f4d2]/12 text-[#9ff8df]' : 'bg-white/10 text-white/60'}`}>
                      {citation.priority}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeModule === 'actions' && (
            <section className="grid gap-4 lg:grid-cols-3">
              {data.actions.map((action, index) => (
                <article key={action.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#64f4d2]/12 text-sm font-semibold text-[#64f4d2]">{index + 1}</div>
                  <p className="mt-5 text-sm font-semibold uppercase text-[#8fa4ff]">{action.impact} impact</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{action.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{action.detail}</p>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
