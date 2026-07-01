'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function ApiExportPanel({ url, websites }: { url?: string; websites: Website[] }) {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState('active_plat_pk_8712a64b22c7104b6b0a');

  const triggerCsvDownload = () => {
    const site = websites.find(w => w.websiteUrl === url);
    if (!site) return;
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/csv-export?siteId=${site.id}&token=${session?.accessToken}`);
  };

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Developer API & CSV Export</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Export audited analytics datasets or connect programmatically using REST API keys.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CSV Export */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">CSV Reports Export</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Download your historical visibility percentages, average position placements, and sentiment scores in a structured CSV file.
          </p>
          <button
            onClick={triggerCsvDownload}
            className="w-full rounded-2xl btn-brand py-2.5 text-xs font-bold text-white hover:shadow-xs transition cursor-pointer"
          >
            Export Visibility Metrics (CSV)
          </button>
        </div>

        {/* Developer API Key */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Developer API Tokens</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Query placement metrics inside your internal pipelines, automated audits, or custom interfaces.
          </p>
          <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Developer Token API Key</p>
            <code className="text-[10px] font-bold text-indigo-650 break-all select-all font-mono">
              {apiKey}
            </code>
          </div>
          <button
            onClick={() => setApiKey('active_plat_pk_' + Math.random().toString(16).substring(2, 22))}
            className="w-full rounded-2xl bg-slate-850 hover:bg-slate-900 py-2.5 text-xs font-bold text-white transition cursor-pointer"
          >
            Regenerate API Token
          </button>
        </div>
      </div>
    </div>
  );
}
