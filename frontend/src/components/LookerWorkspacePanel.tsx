'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function LookerWorkspacePanel({ url, websites }: { url?: string; websites: Website[] }) {
  const { data: session } = useSession();
  const [workspaceName, setWorkspaceName] = useState('');
  const [msg, setMsg] = useState('');

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ name: workspaceName })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Workspace "${data.name}" created successfully!`);
        setWorkspaceName('');
      } else {
        setMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-slate-850">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise Integrations</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">Configure your team workspace and Looker Studio data connector credentials.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Looker Studio */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Looker Studio Connector</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Synchronize your brand's AI search placement metrics directly into Google Looker Studio reports.
          </p>
          <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Connector JSON Endpoint</p>
            <code className="text-[10px] font-bold text-indigo-650 break-all select-all">
              {process.env.NEXT_PUBLIC_API_URL}/api/peec-dashboard/looker-studio
            </code>
          </div>
          <button className="w-full rounded-2xl btn-brand py-2.5 text-xs font-bold text-white hover:shadow-xs transition">
            Generate Access Token
          </button>
        </div>

        {/* Workspaces */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Team Workspaces</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Create unified dashboards to collaborate with your search engine optimization team.
          </p>
          {msg && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-700">{msg}</div>
          )}
          <form onSubmit={handleCreateWorkspace} className="space-y-3">
            <input
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Workspace Name (e.g. Skincare Marketing)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-semibold transition"
            />
            <button type="submit" className="w-full rounded-2xl bg-slate-850 hover:bg-slate-900 py-2.5 text-xs font-bold text-white transition cursor-pointer">
              Create Team Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
