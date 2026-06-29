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
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Add a website first</h2>
        <p className="mt-2 text-sm text-white/55">Growth actions are generated from your tracked brand and AI prompt data.</p>
      </div>
    );
  }

return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Growth Actions</h2>
          <p className="mt-1 text-sm text-white/55">Prioritized work to improve how AI platforms understand and cite your brand.</p>
        </div>
        <select
          value={activeWebsiteId}
          onChange={(event) => setWebsiteId(event.target.value)}
          className="rounded-md border border-white/10 bg-[#111827] px-4 py-2 text-sm text-white"
        >
          {websites.map((website) => (
            <option key={website.id} value={website.id}>{website.propertyName}</option>
          ))}
        </select>
      </div>

      {loading && <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-sm text-white/60">Analyzing prompt gaps...</div>}
      {error && <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      {!loading && data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Prompts analyzed', data.summary.promptsAnalyzed],
              ['AI responses', data.summary.responsesAnalyzed],
              ['Brand mentions', data.summary.trackedMentions],
              ['Content gaps', data.summary.contentGaps],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
            
          </div>

          <section className="rounded-lg border border-white/10 bg-white/4">
            <div className="border-b border-white/10 px-5 py-4">
              <h3 className="font-semibold text-white">Content gaps and briefs</h3>
            </div>
            {data.contentGaps.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-white/55">
                No missing-prompt data is available yet. Complete AI prompt runs to generate evidence-based briefs.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {data.contentGaps.map((gap) => {
                  const expanded = expandedGap === gap.promptId;
                  return (
                    <article key={gap.promptId} className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setExpandedGap(expanded ? '' : gap.promptId)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${gap.priority === 'high' ? 'bg-red-400/15 text-red-300' : gap.priority === 'medium' ? 'bg-amber-400/15 text-amber-200' : 'bg-white/10 text-white/60'}`}>
                              {gap.priority}
                            </span>
                            <span className="text-xs text-white/45">{gap.category} · {gap.country}</span>
                          </div>
                          <h4 className="mt-2 font-medium text-white">{gap.prompt}</h4>
                          <p className="mt-1 text-xs text-white/50">
                            Missing on {gap.missingOn.join(', ')} · {gap.brief.format}
                          </p>
                        </div>
                        <span className="text-xl text-white/50">{expanded ? '−' : '+'}</span>
                      </button>

                      {expanded && (
                        <div className="mt-5 grid gap-5 border-t border-white/10 pt-5 lg:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase text-brand-soft">Suggested title</p>
                            <p className="mt-2 text-sm text-white/80">{gap.brief.suggestedTitle}</p>
                            <p className="mt-5 text-xs font-semibold uppercase text-brand-soft">Outline</p>
                            <ol className="mt-2 space-y-2 text-sm text-white/65">
                              {gap.brief.headings.map((heading, index) => (
                                <li key={heading}>{index + 1}. {heading}</li>
                              ))}
                            </ol>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-brand-soft">Competitors already cited</p>
                            <p className="mt-2 text-sm text-white/65">{gap.competitors.join(', ') || 'No named competitors in this run'}</p>
                            <p className="mt-5 text-xs font-semibold uppercase text-brand-soft">Schema</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {gap.brief.schemaTypes.map((schema) => (
                                <span key={schema} className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{schema}</span>
                              ))}
                            </div>
                            <p className="mt-5 text-xs font-semibold uppercase text-brand-soft">Evidence to cite</p>
                            <ul className="mt-2 space-y-2 text-sm text-white/65">
                              {gap.brief.sourcesToCite.map((source) => <li key={source}>• {source}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-white/10 bg-white/4 p-5">
              <h3 className="font-semibold text-white">Recommended structured data</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.schemaRecommendations.map((schema) => (
                  <span key={schema} className="rounded bg-[#4f6ef7]/15 px-3 py-2 text-sm text-[#aebaff]">{schema}</span>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-white/10 bg-white/4 p-5">
              <h3 className="font-semibold text-white">Off-site authority actions</h3>
              <div className="mt-4 space-y-4">
                {data.authorityActions.map((action) => (
                  <div key={action.title}>
                    <p className="text-sm font-medium text-white">{action.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">{action.detail}</p>
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
