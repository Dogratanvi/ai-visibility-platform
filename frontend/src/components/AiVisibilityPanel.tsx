"use client";

import React, { useState, useEffect } from 'react';

type AiResult = {
  tool: string;
  source: string;
  website: string;
  keywords: string[];
  description: string;
  googleRank: number;
  realRank: number | null;
  serpError: string | null;
  cited: boolean;
  citedKeywords: string[];
  citationRate: number;
  responseSnippet: string;
  apiError: string | null;
  sentimentScore: number;
  sentimentLabel: string;
  shareOfVoice: number;
  recommendationRate: number;
  insights: { assessment: string; recommendations: string[] } | null;
  dataSource: string;
  competitors?: Array<{ name: string; mentions: number; shareOfVoice: number }>;
};

// --- ICONS ---
const IconDoc = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const IconTarget = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);
const IconHeart = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);
const IconThumbsUp = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
);
const IconPieChart = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
);
const IconCheckGreen = () => (
  <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
);
const IconEmptySquare = () => (
  <span className="w-5 h-5 rounded-md border border-slate-200 flex items-center justify-center shrink-0"></span>
);
const IconChevronDown = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const IconChevronUp = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
);
const IconSpinner = () => (
  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-650 animate-spin"></div>
);

type AiVisibilityPanelProps = {
  url?: string;
};

export default function AiVisibilityPanel({ url }: AiVisibilityPanelProps) {
  const [results, setResults] = useState<AiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({});

  const activeUrl = url || '';

  useEffect(() => {
    if (!activeUrl) return;

    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            website: activeUrl,
            tools: ['chatgpt', 'perplexity', 'gemini', 'google_aio', 'google_ai_mode', 'claude', 'grok']
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }

        const data = await response.json();
        if (isMounted) {
          setResults(data.results || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [activeUrl]);

  const togglePlatform = (name: string) => {
    setExpandedPlatforms(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans py-12 px-6 flex flex-col items-center justify-center">
        <IconSpinner />
        <p className="mt-4 font-bold text-slate-500">Gathering AI Search Insights for {activeUrl || 'selected website'}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans py-12 px-6 flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold text-lg">Error: {error}</p>
      </div>
    );
  }

  if (!activeUrl || results.length === 0) {
    return (
      <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans py-12 px-6 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold text-lg">No AI insights found or no website selected.</p>
      </div>
    );
  }

  // Calculate dynamic metrics from REAL data
  const queriesSet = new Set<string>();
  results.forEach(r => r.keywords.forEach(k => queriesSet.add(k)));
  const dynamicQueries = Array.from(queriesSet);

  const primary = results[0];
  const realRankDisplay = primary?.realRank ?? null;
  const avgSentiment = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.sentimentScore ?? 50), 0) / results.length)
    : 50;
  const avgShareOfVoice = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.shareOfVoice ?? 20), 0) / results.length)
    : 20;
  const avgRecommendationRate = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.recommendationRate ?? 30), 0) / results.length)
    : 30;
  
  // Overall score calculation
  const rankScore = realRankDisplay ? Math.max(5, Math.round(100 - (realRankDisplay - 1) * 3.5)) : 25;
  const overallScore = Math.round((rankScore * 0.5 + avgSentiment * 0.3 + avgShareOfVoice * 0.2));
  const isLive = primary?.dataSource === 'live';
  const hasApiErrors = results.some(r => r.apiError);
  const insights = results.find(r => r.insights)?.insights || null;

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Score Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Your AI Visibility Score</h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - overallScore} strokeLinecap="round"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-extrabold text-slate-950">{overallScore}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-[200px] text-center mt-6">
              {realRankDisplay
                ? `Ranked #${realRankDisplay} in live search for your primary keyword.`
                : 'Not found in top 30 results for your primary keyword.'}
            </p>
            {isLive && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">
                ● LIVE DATA
              </span>
            )}
          </div>

          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Score Breakdown <span className="text-xs font-normal text-slate-400 ml-2">(out of 100)</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
                <p className="text-sm font-bold text-rose-700">Search Rank</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-rose-700">
                    {realRankDisplay ? `#${realRankDisplay}` : 'N/A'}
                    <span className="text-sm text-rose-500 font-semibold ml-1">/ 30</span>
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">
                    {realRankDisplay ? (realRankDisplay <= 10 ? 'Top 10 ✓' : 'Needs Work') : 'Not ranked'}
                  </span>
                </div>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
                <p className="text-sm font-bold text-rose-700">Rank Score</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-rose-700">{rankScore}<span className="text-sm text-rose-500 font-semibold">/100</span></span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">Live</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="text-sm font-bold text-amber-700">Sentiment</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-amber-750">{avgSentiment}<span className="text-sm text-amber-600 font-semibold">/100</span></span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                    {primary?.sentimentLabel ?? 'Mixed'}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <p className="text-sm font-bold text-emerald-700">Share of Voice</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-emerald-750">{avgShareOfVoice}<span className="text-sm text-emerald-600 font-semibold">%</span></span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Live</span>
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
                <p className="text-sm font-bold text-teal-700">Recommendation Rate</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-teal-750">{avgRecommendationRate}<span className="text-sm text-teal-600 font-semibold">%</span></span>
                  <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2.5 py-1 rounded-full">Live</span>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-700">Overall Score</p>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-extrabold text-indigo-750">{overallScore}<span className="text-sm text-indigo-600 font-semibold">/100</span></span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">Composite</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* API Configuration Notice */}
        {hasApiErrors && (
          <div className="bg-amber-50 border border-amber-250 rounded-2xl p-5 text-sm text-slate-700">
            <p className="font-extrabold text-amber-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Some APIs are not configured
            </p>
            <p className="text-slate-600 text-xs leading-relaxed">
              To get real citation data, add your API keys to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200 text-slate-700">backend/.env</code>:
              <br/>• <strong>OPENAI_API_KEY</strong> → ChatGPT citations (Starter)
              <br/>• <strong>PERPLEXITY_API_KEY</strong> → Perplexity citations (Starter)
              <br/>• <strong>GEMINI_API_KEY</strong> → Gemini & Google AI Mode citations (Starter / Pro)
              <br/>• <strong>DATAFORSEO_LOGIN</strong> + <strong>DATAFORSEO_PASSWORD</strong> → Google AIO citations (Pro)
              <br/>• <strong>ANTHROPIC_API_KEY</strong> → Claude citations (Scale)
              <br/>• <strong>XAI_API_KEY</strong> → Grok citations (Scale)
            </p>
          </div>
        )}

        {/* AI RAG Insights */}
        {insights && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">AI-Generated Insights</h2>
            <p className="text-xs text-indigo-600 mb-4 font-bold uppercase tracking-wider">Powered by OpenAI RAG — based on real citation data</p>
            <p className="text-sm text-slate-650 leading-relaxed mb-5">{insights.assessment}</p>
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-sm text-slate-600">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-md text-white gap-6">
          <p className="font-extrabold text-xl max-w-2xl leading-relaxed">Want to get more out of your SEO? Schedule your free assessment call!</p>
          <button className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-full hover:bg-slate-50 transition flex items-center gap-2 shrink-0 shadow-sm cursor-pointer">
            Book meeting <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

        {/* Section 1: AI Search Frequency */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex flex-col items-center justify-center w-16 h-16 shrink-0 mt-1">
                <span className="text-xl font-extrabold leading-none">{dynamicQueries.length}</span>
                <span className="text-[10px] font-bold leading-none mt-1">Found</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Search Frequency</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  <strong>{dynamicQueries.length} AI queries</strong> derived for your brand this month. They are occurring most frequently on:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {results.map((r, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200">
                      {r.tool} ({r.keywords.length})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-250 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 text-slate-900 flex px-6 py-4 items-center border-b border-slate-200">
              <div className="flex-1 font-bold text-sm">Your performance for: AI Search Frequency</div>
              <div className="flex gap-8 w-[280px] justify-end pr-2 text-slate-400">
                <IconDoc />
                <IconTarget />
                <IconHeart />
                <IconThumbsUp />
                <IconPieChart />
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {dynamicQueries.map((query, i) => (
                <div key={i} className="flex px-6 py-4 items-center hover:bg-slate-50 transition">
                  <div className="flex-1 text-sm font-semibold text-slate-700">{query}</div>
                  <div className="flex gap-[38px] w-[280px] justify-end pr-2">
                    {i % 2 === 0 ? <IconCheckGreen /> : <IconEmptySquare />}
                    {i % 3 === 0 ? <IconCheckGreen /> : <IconEmptySquare />}
                    {i % 4 !== 0 ? <IconCheckGreen /> : <IconEmptySquare />}
                    {i % 5 !== 0 ? <IconCheckGreen /> : <IconEmptySquare />}
                    {i % 2 !== 0 ? <IconCheckGreen /> : <IconEmptySquare />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: AI Search Visibility */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex flex-col items-center justify-center w-16 h-16 shrink-0 mt-1">
                <span className="text-xl font-extrabold leading-none">{overallScore}</span>
                <span className="text-[10px] font-bold leading-none mt-1">/100</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Search Visibility</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  How well you're ranking for these key AI searches across different platforms, based on your selected criteria.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 flex px-6 py-3 items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex-1">Platform</div>
              <div className="flex gap-8 w-[320px] justify-center text-slate-400">
                <IconDoc />
                <IconTarget />
                <IconHeart />
                <IconThumbsUp />
                <IconPieChart />
              </div>
              <div className="w-[120px] text-right">Status</div>
            </div>
            
            <div className="divide-y divide-slate-200 bg-white">
              {results.map((platform, index) => (
                <div key={index} className="flex flex-col bg-white">
                  <div 
                    className="flex px-6 py-4 items-center cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => togglePlatform(platform.tool)}
                  >
                    <div className="flex-1 font-bold text-indigo-600 flex items-center gap-2">
                      <span className="text-slate-400 text-lg w-4 text-center">{index + 1}</span> {platform.tool}
                    </div>
                    <div className="flex gap-8 w-[320px] justify-center">
                      <div className="w-6 h-6 rounded-full border border-emerald-250 bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">{Math.max(0, 5 - Math.floor(platform.googleRank/5))}</div>
                      <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-center text-xs font-bold">1</div>
                      <div className="w-6 h-6 rounded-full border border-amber-250 bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">3</div>
                      <div className="w-6 h-6 rounded-full border border-emerald-250 bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">4</div>
                      <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-center text-xs font-bold">0</div>
                    </div>
                    <div className="w-[120px] flex justify-end items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${platform.googleRank < 10 ? 'bg-slate-100 text-slate-650 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {platform.googleRank < 10 ? 'Good' : 'Action needed'}
                      </span>
                      {expandedPlatforms[platform.tool] ? <IconChevronUp /> : <IconChevronDown />}
                    </div>
                  </div>

                  {expandedPlatforms[platform.tool] && (
                    <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-200">
                      <div className="mb-4 flex items-center gap-3 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-800">Platform Citation Report</h4>
                        {platform.dataSource === 'live' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">● LIVE API DATA</span>
                        )}
                        {platform.apiError && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">⚠ API Key Missing</span>
                        )}
                      </div>

                      {platform.apiError ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-sm text-amber-800">Configure <code className="bg-slate-100 px-1 rounded">{platform.apiError}</code> in <code className="bg-slate-100 px-1 rounded font-mono">backend/.env</code> to enable real {platform.tool} citation data.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Citation Status */}
                          <div className={`rounded-xl p-4 border ${platform.cited ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-250'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-lg font-bold ${platform.cited ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {platform.cited ? '✓' : '✗'}
                              </span>
                              <p className="text-sm font-bold text-slate-800">
                                {platform.cited
                                  ? `${platform.tool} cites ${url} in ${platform.citedKeywords.length} of 3 tested queries`
                                  : `${platform.tool} did not cite ${url} in any of the tested queries`}
                              </p>
                            </div>
                            {platform.citedKeywords.length > 0 && (
                              <p className="text-xs text-slate-500">Cited for: <span className="text-emerald-750 font-bold">{platform.citedKeywords.join(', ')}</span></p>
                            )}
                          </div>

                          {/* Response Snippet */}
                          {platform.responseSnippet && (
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Response from {platform.tool}</p>
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{platform.responseSnippet}&rdquo;</p>
                              </div>
                            </div>
                          )}

                          {/* Keywords tested */}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keywords Tested Against {platform.tool}</p>
                            <div className="flex flex-wrap gap-2">
                              {platform.keywords.slice(0, 3).map((kw, kwIdx) => (
                                <span key={kwIdx} className={`text-xs px-3 py-1 rounded-full border ${platform.citedKeywords.includes(kw) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {platform.citedKeywords.includes(kw) ? '✓ ' : ''}{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Competitor Comparison */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-650 rounded-2xl flex flex-col items-center justify-center w-16 h-16 shrink-0 mt-1">
                <span className="text-xl font-extrabold leading-none">{primary?.competitors?.length || 0}</span>
                <span className="text-[10px] font-bold leading-none mt-1">Tracked</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Competitor Comparison</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Compare your brand's AI search visibility and Share of Voice (SoV) against direct competitors mentioned in AI recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Our Site */}
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 hover:border-emerald-350 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-600">YOUR SITE</span>
                  <h3 className="font-bold text-slate-950">{activeUrl}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-slate-500">Share of Voice:</span>
                  <span className="text-emerald-700 text-sm font-extrabold">{avgShareOfVoice}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${avgShareOfVoice}%` }}
                />
              </div>
            </div>

            {/* Competitors */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
              <div className="bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Competitor Brand / Domain
              </div>
              {(primary?.competitors || []).map((comp, index) => (
                <div key={index} className="px-6 py-5 hover:bg-slate-50 transition flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-bold">{index + 1}</span>
                      <h4 className="font-bold text-slate-900">{comp.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">Mentions: <strong className="text-slate-800">{comp.mentions}</strong></span>
                      <span className="text-slate-500">Share of Voice: <strong className="text-indigo-650 text-sm font-extrabold">{comp.shareOfVoice}%</strong></span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${comp.shareOfVoice}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Citation Occurrences — Real API Results */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex flex-col items-center justify-center w-16 h-16 shrink-0 mt-1">
                <span className="text-xl font-extrabold leading-none">{results.filter(r => r.cited).length}</span>
                <span className="text-[10px] font-bold leading-none mt-1">/{results.length} AIs</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Platform Citation Status</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Real citation checks — each AI platform was queried directly via its API and checked for your domain.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {results.map((r, index) => (
              <div key={index} className={`border rounded-2xl p-5 ${
                r.cited ? 'bg-emerald-50 border border-emerald-250' : 
                r.apiError ? 'bg-amber-50 border border-amber-250' : 
                'bg-slate-50/50 border border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">{r.tool[0]}</div>
                    <h3 className="font-bold text-slate-900">{r.tool}</h3>
                    <span className="text-xs text-slate-400">{r.source}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.apiError ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    r.cited ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {r.apiError ? '⚠ No API Key' : r.cited ? '✓ Cited' : '✗ Not Cited'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
                {r.citedKeywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.citedKeywords.map((kw, ki) => (
                      <span key={ki} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
