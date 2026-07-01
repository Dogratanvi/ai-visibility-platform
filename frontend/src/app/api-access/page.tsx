'use client';

import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const endpoints = [
  {
    method: 'GET',
    path: '/api/ai/search',
    description: 'Fetch AI Visibility Index and aggregate Share of Voice metrics for a target domain.',
    params: [
      { name: 'url', type: 'string', required: true, description: 'Target website URL (e.g., https://example.com)' },
    ],
  },
  {
    method: 'GET',
    path: '/api/free-audit',
    description: 'Trigger accessibility, SEO structure checks, and fetch crawler permissions summaries.',
    params: [
      { name: 'url', type: 'string', required: true, description: 'Target URL' },
    ],
  },
  {
    method: 'GET',
    path: '/api/geo-score',
    description: 'Compute latency details, edge server performance, and global score metrics.',
    params: [
      { name: 'url', type: 'string', required: true, description: 'Target URL' },
    ],
  },
];

export default function ApiAccessPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-650">Integration Reference</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">API Access Reference</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-550">
            Query AI visibility reports, retrieve citation stats, and fetch SEO audit logs programmatically.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Authentication</h2>
            <p className="text-slate-650 leading-relaxed">
              All API requests must include your API token in the Authorization header. You can obtain your token in the settings panel of your premium dashboard.
            </p>
            <div className="mt-4 bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-sm overflow-x-auto">
              Authorization: Bearer YOUR_SECRET_API_KEY
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">REST Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((ep) => (
                <div key={ep.path} className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">{ep.method}</span>
                    <span className="font-mono text-base font-bold text-slate-900">{ep.path}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 font-medium">{ep.description}</p>
                  
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase text-slate-450 tracking-wider mb-2">Query Parameters</p>
                    <table className="min-w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                          <th className="pb-2 pr-4">Parameter</th>
                          <th className="pb-2 pr-4">Type</th>
                          <th className="pb-2 pr-4">Required</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ep.params.map((p) => (
                          <tr key={p.name}>
                            <td className="py-2.5 pr-4 font-mono text-indigo-700 font-bold">{p.name}</td>
                            <td className="py-2.5 pr-4 text-slate-500 font-semibold">{p.type}</td>
                            <td className="py-2.5 pr-4 text-slate-550 font-bold">{p.required ? 'Yes' : 'No'}</td>
                            <td className="py-2.5 text-slate-600">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Example Request</h2>
            <p className="text-slate-655 mb-4 font-medium">Use standard curl commands to verify your connection:</p>
            <pre className="bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-sm overflow-x-auto leading-relaxed">
{`curl -X GET "https://ai-visibility-platform.com/api/ai/search?url=https://mysite.com" \\
     -H "Authorization: Bearer YOUR_SECRET_API_KEY"`}
            </pre>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
