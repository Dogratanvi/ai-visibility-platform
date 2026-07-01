'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

type Gap = {
  promptId: string;
  prompt: string;
  category: string;
  country: string;
  missingOn: string[];
  competitors: string[];
  priority: 'high' | 'medium' | 'low';
  brief: {
    format: string;
    suggestedTitle: string;
    headings: string[];
    sourcesToCite: string[];
    schemaTypes: string[];
  };
};

type Recommendations = {
  summary: {
    promptsAnalyzed: number;
    responsesAnalyzed: number;
    trackedMentions: number;
    contentGaps: number;
  };
  contentGaps: Gap[];
  schemaRecommendations: string[];
  authorityActions: { title: string; detail: string }[];
  topCompetitors: { name: string; gapCount: number }[];
};

export default function GrowthActionsPanel({ websites }: { websites: Website[] }) {
  const { data: session } = useSession();
  const [websiteId, setWebsiteId] = useState(websites[0]?.id || '');
  const [data, setData] = useState<Recommendations | null>(null);
  const [expandedGap, setExpandedGap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const activeWebsiteId = websiteId || websites[0]?.id || '';

  useEffect(() => {
    if (!activeWebsiteId || !session?.accessToken) return;

    const loadRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/${activeWebsiteId}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Unable to load recommendations');
        setData(body);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [activeWebsiteId, session?.accessToken]);

  if (websites.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-250 bg-slate-50/50 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Add a website first</h2>
        <p className="mt-2 text-xs font-semibold text-slate-450">Growth actions are generated from your tracked brand and AI prompt data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-850">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Growth Actions</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">Prioritized work to improve how AI platforms understand and cite your brand.</p>
        </div>
        <select
          value={activeWebsiteId}
          onChange={(event) => setWebsiteId(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition shadow-xs"
        >
          {websites.map((website) => (
            <option key={website.id} value={website.id}>{website.propertyName}</option>
          ))}
        </select>
      </div>

      {loading && <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-xs font-semibold text-slate-400">Analyzing prompt gaps...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {!loading && data && (
        <>
          {/* Stats Summary Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Prompts analyzed', data.summary.promptsAnalyzed],
              ['AI responses', data.summary.responsesAnalyzed],
              ['Brand mentions', data.summary.trackedMentions],
              ['Content gaps', data.summary.contentGaps],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Gaps and Briefs Card */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-150 px-6 py-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Content Gaps and Content Briefs</h3>
            </div>
            {data.contentGaps.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs font-semibold text-slate-450">
                No missing-prompt data is available yet. Complete AI prompt runs to generate evidence-based briefs.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.contentGaps.map((gap) => {
                  const expanded = expandedGap === gap.promptId;
                  return (
                    <article key={gap.promptId} className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setExpandedGap(expanded ? '' : gap.promptId)}
                        className="flex w-full items-start justify-between gap-4 text-left select-none cursor-pointer focus:outline-none"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              gap.priority === 'high'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : gap.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                              {gap.priority}
                            </span>
                            <span className="text-[10px] font-extrabold text-indigo-650 bg-indigo-50/50 px-2 py-0.5 rounded">
                              {gap.category} · {gap.country}
                            </span>
                          </div>
                          <h4 className="mt-2 font-bold text-slate-900 text-sm">“{gap.prompt}”</h4>
                          <p className="mt-1.5 text-xs text-slate-450 font-semibold">
                            Missing on {gap.missingOn.join(', ')} · {gap.brief.format}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-slate-400">{expanded ? '−' : '+'}</span>
                      </button>

                      {expanded && (
                        <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2 text-xs font-semibold">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Suggested Title</p>
                              <p className="mt-2 text-slate-800 font-extrabold text-sm">“{gap.brief.suggestedTitle}”</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Suggested Outline Structure</p>
                              <ol className="mt-2 space-y-2 text-slate-600 font-semibold">
                                {gap.brief.headings.map((heading, index) => (
                                  <li key={heading} className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">{index + 1}.</span>
                                    <span>{heading}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Competitors Already Cited</p>
                              <p className="mt-2 text-slate-700">{gap.competitors.join(', ') || 'No named competitors in this run'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Recommended Schema</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {gap.brief.schemaTypes.map((schema) => (
                                  <span key={schema} className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] text-slate-500 font-bold">
                                    {schema}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Required Evidence to Cite</p>
                              <ul className="mt-2 space-y-2 text-slate-600 font-semibold">
                                {gap.brief.sourcesToCite.map((source) => (
                                  <li key={source} className="flex gap-2">
                                    <span className="text-slate-300">•</span>
                                    <span>{source}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bottom Recommendations */}
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-950 text-sm mb-4">Recommended Structured Data</h3>
              <div className="flex flex-wrap gap-2">
                {data.schemaRecommendations.map((schema) => (
                  <span key={schema} className="rounded-2xl bg-indigo-50 border border-indigo-150 px-3 py-2 text-xs font-extrabold text-indigo-750">
                    {schema}
                  </span>
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-950 text-sm mb-4">Off-Site Authority Actions</h3>
              <div className="space-y-4 text-xs font-semibold">
                {data.authorityActions.map((action) => (
                  <div key={action.title} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="font-bold text-slate-800">{action.title}</p>
                    <p className="mt-1 text-slate-500 leading-relaxed">{action.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
