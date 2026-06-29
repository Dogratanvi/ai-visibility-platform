'use client';

import { useState } from 'react';

type AiResult = {
  tool: string;
  source: string;
  keywords: string[];
  description: string;
  googleRank: number;
  website?: string;
  rawOutput?: string;
};

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

const TOOL_OPTIONS = [
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Claude', value: 'claude' },
  { label: 'Chatbot', value: 'chatbot' },
  { label: 'All Tools', value: 'all' },
];

export default function AiVisibilityPanel({
  websites = [],
  selectedWebsiteId,
}: {
  websites?: Website[];
  selectedWebsiteId?: string | null;
}) {
  const selectedSavedWebsite = websites.find((site) => site.id === selectedWebsiteId) || websites[0];
  const [website, setWebsite] = useState(() => selectedSavedWebsite?.websiteUrl || '');
  const [toolSelection, setToolSelection] = useState('all');
  const [results, setResults] = useState<AiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Enter a website URL and run an AI Visibility search.');

  const handleSearch = async () => {
    setError('');
    setStatusText('Searching AI tools...');
    setLoading(true);
    setResults([]);

    const selectedTools = toolSelection === 'all' ? ['chatgpt', 'claude', 'chatbot'] : [toolSelection];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await fetch(`${apiUrl}/api/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website, tools: selectedTools }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to run search.');
        setStatusText('Search failed.');
      } else if (!Array.isArray(data.results)) {
        setError('Unexpected search result format from the server.');
        setStatusText('No results returned.');
      } else {
        setResults(data.results);
        setStatusText(data.results.length ? 'AI results returned.' : 'No AI results found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the AI service. Please check your backend and try again.');
      setStatusText('Connection error.');
    }

    setLoading(false);
  };

  const handleExport = async () => {
    if (!website.trim() || results.length === 0) return;
    setError('');
    setExportLoading(true);
    const selectedTools = toolSelection === 'all' ? ['chatgpt', 'claude', 'chatbot'] : [toolSelection];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await fetch(`${apiUrl}/api/ai/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website, tools: selectedTools }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Unable to export results.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-visibility-${website.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Export failed. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  const chatgptResult = results.find((item) => item.tool.toLowerCase() === 'chatgpt');
  const claudeResult = results.find((item) => item.tool.toLowerCase() === 'claude');
  const chatbotResult = results.find((item) => item.tool.toLowerCase() === 'chatbot');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8b93b0]">AI Visibility Search</p>
            <h2 className="text-white text-2xl font-semibold">Search a website and compare AI keyword insights</h2>
            <p className="text-sm text-white/70 max-w-2xl">Use AI tools like ChatGPT, Claude, and Chatbot to generate keyword suggestions, descriptions, and rank predictions for a website.</p>
          </div>

          <div className="grid gap-3 w-full md:w-auto">
            <label className="text-xs text-white/70">Website URL</label>
            <div className="grid gap-2">
              {websites.length ? (
                <select
                  value={websites.find((site) => site.websiteUrl === website)?.id || ''}
                  onChange={(event) => {
                    const site = websites.find((item) => item.id === event.target.value);
                    if (site) setWebsite(site.websiteUrl);
                  }}
                  className="w-full min-w-70 rounded-2xl border border-white/10 bg-[#0e1220] px-4 py-3 text-white outline-none focus:border-[#4f6ef7]"
                >
                  <option value="">Custom website</option>
                  {websites.map((site) => (
                    <option key={site.id} value={site.id}>{site.propertyName}</option>
                  ))}
                </select>
              ) : null}
              <input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://example.com"
                className="w-full min-w-70 rounded-2xl border border-white/10 bg-[#0e1220] px-4 py-3 text-white outline-none focus:border-[#4f6ef7]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <div>
            <label className="text-xs text-white/70">Select AI tool</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setToolSelection(option.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${toolSelection === option.value ? 'bg-[#4f6ef7] text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!website.trim() || loading}
            className="rounded-2xl bg-[#4f6ef7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d5ce6] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Running search…' : 'Run AI search'}
          </button>
        </div>

        <p className="mt-4 text-sm text-white/60">{statusText}</p>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>

      {results.length > 0 ? (
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs text-white/60">Website searched</p>
              <p className="text-white font-semibold">{website}</p>
              <p className="text-sm text-white/70">Tools: {toolSelection === 'all' ? 'ChatGPT, Claude, Chatbot' : toolSelection === 'chatgpt' ? 'ChatGPT' : toolSelection === 'claude' ? 'Claude' : 'Chatbot'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#0f1628] p-4">
                <p className="text-xs text-white/50">ChatGPT rank</p>
                <p className="text-2xl font-semibold text-white">{chatgptResult?.googleRank ?? '—'}</p>
              </div>
              <div className="rounded-2xl bg-[#0f1628] p-4">
                <p className="text-xs text-white/50">Claude rank</p>
                <p className="text-2xl font-semibold text-white">{claudeResult?.googleRank ?? '—'}</p>
              </div>
              <div className="rounded-2xl bg-[#0f1628] p-4">
                <p className="text-xs text-white/50">Chatbot rank</p>
                <p className="text-2xl font-semibold text-white">{chatbotResult?.googleRank ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h3 className="text-white text-lg font-semibold">AI Search Results</h3>
            <p className="text-sm text-white/60">Each row shows the tool, keyword recommendations, description, and predicted Google rank.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{results.length} results</span>
            <button
              type="button"
              onClick={handleExport}
              disabled={results.length === 0 || exportLoading}
              className="rounded-2xl bg-[#22c55e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-50">
              {exportLoading ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 px-5 py-14 text-center text-sm text-white/50">
            No results yet. Run a search to populate the AI Visibility insights table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.24em] text-white/50">
                  <th className="pb-3 pr-6">Tool</th>
                  <th className="pb-3 pr-6">Source</th>
                  <th className="pb-3 pr-6">Keywords</th>
                  <th className="pb-3 pr-6">Description</th>
                  <th className="pb-3">Google Rank</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={`${result.tool}-${index}`} className="bg-[#0f1628] rounded-3xl">
                    <td className="px-4 py-4 text-white font-medium">{result.tool}</td>
                    <td className="px-4 py-4 text-white/70">{result.source}</td>
                    <td className="px-4 py-4 text-white/80 max-w-65 whitespace-normal">{result.keywords.join(', ')}</td>
                    <td className="px-4 py-4 text-white/80 max-w-105 whitespace-normal">{result.description}</td>
                    <td className="px-4 py-4 text-white font-semibold">{result.googleRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
