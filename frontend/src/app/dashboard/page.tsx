'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminModal from '@/components/AdminModal';
import AdminPanel from '@/components/AdminPanel';
import BlogManagementPanel from '@/components/BlogManagementPanel';
import AiVisibilityPanel from '@/components/AiVisibilityPanel';
import CommandCenterPanel from '@/components/CommandCenterPanel';
import GrowthActionsPanel from '@/components/GrowthActionsPanel';
import RankTrackerClient from '@/app/dashboard/rank-tracker/RankTrackerClient';
import VisibilityPanel from '@/components/VisibilityPanel';
import SentimentPanel from '@/components/SentimentPanel';
import CompetitorsPanel from '@/components/CompetitorsPanel';
import SourcesPanel from '@/components/SourcesPanel';
import TrendsPanel from '@/components/TrendsPanel';
import LookerWorkspacePanel from '@/components/LookerWorkspacePanel';
import ApiExportPanel from '@/components/ApiExportPanel';

type Website = {
  id: string;
  propertyName: string;
  websiteUrl: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('home');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState('Paid');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredWebsites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return websites;
    return websites.filter((site) => (
      site.propertyName.toLowerCase().includes(query)
      || site.websiteUrl.toLowerCase().includes(query)
    ));
  }, [searchQuery, websites]);

  // Plan tier levels: 0=free, 1=starter, 2=pro, 3=scale, 4=admin
  const planTier = useMemo(() => {
    const p = currentPlan.toLowerCase();
    if (p === 'admin' || p === 'superadmin') return 4;
    if (p === 'scale' || p === 'enterprise') return 3;
    if (p === 'pro' || p === 'paid') return 2;
    if (p === 'starter') return 1;
    return 0;
  }, [currentPlan]);

  // Plan limits matching pricing page
  const planLimits = useMemo(() => {
    if (planTier >= 4) return { platforms: 7, prompts: 999, competitors: 99, historyDays: 365, websites: 'unlimited', planLabel: 'Admin' };
    if (planTier >= 3) return { platforms: 7, prompts: 125, competitors: 8, historyDays: 180, websites: 10, planLabel: 'Scale' };
    if (planTier >= 2) return { platforms: 5, prompts: 75, competitors: 5, historyDays: 90, websites: 3, planLabel: 'Pro' };
    if (planTier >= 1) return { platforms: 3, prompts: 25, competitors: 3, historyDays: 30, websites: 1, planLabel: 'Starter' };
    return { platforms: 0, prompts: 0, competitors: 0, historyDays: 0, websites: 0, planLabel: 'Free' };
  }, [planTier]);

  // Module → minimum tier required
  const moduleTierMap: Record<string, { minTier: number; requiredPlan: string }> = {
    'home': { minTier: 0, requiredPlan: '' },
    'settings': { minTier: 0, requiredPlan: '' },
    'admin': { minTier: 0, requiredPlan: '' },
    'blog-management': { minTier: 0, requiredPlan: '' },
    // Starter modules (tier 1)
    'ai-visibility': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    'visibility_pct': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    'rank-tracker': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    'competitor_comparison': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    'keywords': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    'backlinks': { minTier: 1, requiredPlan: 'Starter ($79/mo)' },
    // Pro modules (tier 2)
    'sentiment_score': { minTier: 2, requiredPlan: 'Pro ($299/mo)' },
    'growth-actions': { minTier: 2, requiredPlan: 'Pro ($299/mo)' },
    'trend_reports': { minTier: 2, requiredPlan: 'Pro ($299/mo)' },
    'source_urls': { minTier: 2, requiredPlan: 'Pro ($299/mo)' },
    'api_export': { minTier: 2, requiredPlan: 'Pro ($299/mo)' },
    // Scale modules (tier 3)
    'looker_workspace': { minTier: 3, requiredPlan: 'Scale ($499/mo)' },
  };

  const isModuleUnlocked = (moduleId: string) => {
    const rule = moduleTierMap[moduleId];
    if (!rule) return true;
    return planTier >= rule.minTier;
  };

  const navItems = [
    { id: 'home', label: 'Command Center' },
    { id: 'ai-visibility', label: 'AI Visibility Report' },
    { id: 'visibility_pct', label: 'Visibility %' },
    { id: 'sentiment_score', label: 'Sentiment Score' },
    { id: 'competitor_comparison', label: 'Competitor Comparison' },
    { id: 'source_urls', label: 'Source URLs used by AI' },
    { id: 'trend_reports', label: 'Daily Trend Reports' },
    { id: 'growth-actions', label: 'Execution Layer' },
    { id: 'rank-tracker', label: 'Prompt Tracker' },
    { id: 'keywords', label: 'Keyword Research' },
    { id: 'backlinks', label: 'Citation Monitor' },
    { id: 'looker_workspace', label: 'Looker & Workspaces' },
    { id: 'api_export', label: 'Developer API / CSV' },
    { id: 'settings', label: 'Settings' },
    ...(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'
      ? [
        { id: 'admin', label: '🛠️ Admin Panel' },
        { id: 'blog-management', label: '✍️ Blog Management' },
      ]
      : []),
  ];

  const fetchSubscription = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setCurrentPlan(data.plan === 'admin'
      ? 'Admin'
      : `${String(data.plan || 'paid').charAt(0).toUpperCase()}${String(data.plan || 'paid').slice(1)}`);
  }, [session?.accessToken]);

  const fetchWebsites = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/websites`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    });
    if (res.status === 402) {
      router.replace('/pricing?reason=subscription');
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setWebsites(data);
      setSelectedSiteId((current) => current || data[0]?.id || null);
    }
  }, [router, session?.accessToken]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status !== 'authenticated' || !session?.accessToken) return;
    const loadDashboard = async () => {
      await Promise.all([fetchWebsites(), fetchSubscription()]);
    };
    loadDashboard();
  }, [status, session?.accessToken, router, fetchWebsites, fetchSubscription]);

  const addWebsite = async () => {
    if (!url) return;
    setError('');
    if (!session?.accessToken) {
      setError('Unable to add website: invalid auth token. Please refresh and log in again.');
      return;
    }
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/websites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ url, propertyName: url })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Unable to add website.'); setLoading(false); return; }
    if (data.id) { await fetchWebsites(); setShowModal(false); setUrl(''); }
    else { setError('Unable to add website. Please try again.'); }
    setLoading(false);
  };

  const deleteWebsite = async (id: string) => {
    if (!session?.accessToken) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/websites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (res.ok) {
        // If deleted site was active, change to another one
        if (selectedSiteId === id) {
          const remaining = websites.filter(site => site.id !== id);
          setSelectedSiteId(remaining[0]?.id || null);
        }
        await fetchWebsites();
        setConfirmDeleteId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete website');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting website');
    } finally {
      setDeletingId(null);
    }
  };

  const renderLockedFeature = (featureName: string, requiredPlan: string) => (
    <div className="rounded-3xl border border-indigo-150 bg-indigo-50/20 p-10 text-center max-w-2xl mx-auto my-12">
      <span className="text-5xl">🔒</span>
      <h3 className="text-xl font-extrabold text-slate-900 mt-5">{featureName}</h3>
      <p className="text-xs text-slate-550 font-semibold mt-2 leading-relaxed">
        This module requires the <strong className="text-indigo-700">{requiredPlan}</strong> plan or higher.
      </p>
      <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 text-left space-y-2 text-xs">
        <p className="font-bold text-slate-800">Your current plan: <span className="text-emerald-600">{planLimits.planLabel}</span></p>
        <p className="text-slate-500 font-semibold">{planLimits.platforms} AI platforms · {planLimits.prompts} prompts · {planLimits.competitors} competitors · {planLimits.historyDays} days history</p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/pricing" className="btn-brand text-white text-xs font-bold px-6 py-3 rounded-full shadow-sm">
          Upgrade to {requiredPlan.split(' ')[0]}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-650 rounded-lg flex items-center justify-center text-white font-bold">📈</div>
          <div>
            <span className="text-slate-900 font-extrabold text-sm">AI Visibility</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analytics dashboard</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const unlocked = isModuleUnlocked(item.id);
            const tierInfo = moduleTierMap[item.id];
            return (
              <button key={item.id}
                onClick={() => setSelectedTab(item.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                  selectedTab === item.id 
                    ? 'bg-indigo-50/70 text-indigo-750 font-bold border-l-4 border-indigo-600' 
                    : unlocked ? 'text-slate-600 font-semibold hover:bg-slate-50' : 'text-slate-400 font-semibold hover:bg-slate-50'
                }`}
              >
                <span className="text-sm flex items-center gap-2">
                  {!unlocked && <span className="text-[10px]">🔒</span>}
                  {item.label}
                </span>
                {!unlocked && tierInfo && (
                  <span className="text-[8px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-450 px-1.5 py-0.5 rounded">
                    {tierInfo.requiredPlan.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 font-bold">Current Plan</p>
            <p className="text-emerald-700 text-xs font-extrabold mt-1">{currentPlan}</p>
            <div className="mt-2 space-y-1 text-[10px] text-slate-500 font-semibold">
              <p>{planLimits.platforms} AI platforms</p>
              <p>{planLimits.prompts} tracked prompts</p>
              <p>{planLimits.competitors} competitors</p>
              <p>{planLimits.historyDays} days history</p>
            </div>
            <Link href="/pricing" className="block w-full mt-3 bg-indigo-600 hover:bg-indigo-750 text-center text-white text-xs font-bold py-2.5 rounded-full shadow-xs transition">
              Manage plan
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 flex items-center justify-between px-6 py-4 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-900 font-extrabold text-lg">Dashboard</h1>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && filteredWebsites[0]) {
                    setSelectedSiteId(filteredWebsites[0].id);
                    setSelectedTab('home');
                    setSearchQuery('');
                  }
                }}
                placeholder="Search websites..."
                className="w-80 pl-10 pr-4 py-2 rounded-full bg-slate-50 text-slate-800 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 outline-none text-sm font-semibold transition"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔎</span>
              {searchQuery.trim() ? (
                <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {filteredWebsites.length ? filteredWebsites.slice(0, 6).map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => {
                        setSelectedSiteId(site.id);
                        setSelectedTab('home');
                        setSearchQuery('');
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-slate-50 transition"
                    >
                      <span className="block text-sm font-bold text-slate-900">{site.propertyName}</span>
                      <span className="block text-xs text-slate-500">{site.websiteUrl}</span>
                    </button>
                  )) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No matching websites</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-650 text-xs hidden md:inline font-bold">{session?.user?.email}</span>
            {session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN' ? (
              <button onClick={() => setShowAdminModal(true)}
                className="hidden md:inline-flex items-center gap-2 bg-indigo-650 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-indigo-700 transition">
                🛠️ Admin
              </button>
            ) : null}
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm cursor-pointer transition">
              Sign Out
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'admin' ? (
            <div className="min-h-screen">
              <AdminPanel />
            </div>
          ) : selectedTab === 'blog-management' ? (
            <BlogManagementPanel />
          ) : !isModuleUnlocked(selectedTab) ? (
            renderLockedFeature(
              navItems.find(n => n.id === selectedTab)?.label || selectedTab,
              moduleTierMap[selectedTab]?.requiredPlan || 'Starter ($79/mo)'
            )
          ) : selectedTab === 'rank-tracker' ? (
            <RankTrackerClient siteId={selectedSiteId || undefined} />
          ) : selectedTab === 'ai-visibility' ? (
            <AiVisibilityPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} />
          ) : selectedTab === 'visibility_pct' ? (
            <VisibilityPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'sentiment_score' ? (
            <SentimentPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'competitor_comparison' ? (
            <CompetitorsPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'source_urls' ? (
            <SourcesPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'trend_reports' ? (
            <TrendsPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'looker_workspace' ? (
            <LookerWorkspacePanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'api_export' ? (
            <ApiExportPanel url={websites.find((w) => w.id === selectedSiteId)?.websiteUrl} websites={websites} />
          ) : selectedTab === 'growth-actions' ? (
            <GrowthActionsPanel websites={websites} />
          ) : (
            <>
              <CommandCenterPanel
                websites={websites}
                selectedWebsiteId={selectedSiteId}
                onSelectedWebsiteChange={setSelectedSiteId}
              />

              {/* Websites List */}
              <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider text-indigo-650 flex items-center gap-2">
                    <span>Your Websites</span>
                    {websites.length > 0 && (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">
                        {planLimits.websites === 'unlimited'
                          ? `${websites.length} tracked`
                          : `${websites.length} of ${planLimits.websites} tracked`}
                      </span>
                    )}
                  </h2>
                  <button onClick={() => setShowModal(true)}
                    className="btn-brand text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer shadow-sm">
                    + Add Website
                  </button>
                </div>

                {websites.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">🌐</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No websites added yet</p>
                    <button onClick={() => setShowModal(true)}
                      className="mt-4 btn-brand text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer shadow-sm">
                      Add Your First Website
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWebsites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-2xl px-5 py-4 transition hover:bg-white hover:border-slate-300 hover:shadow-xs">
                        <div>
                          <p className="text-slate-900 text-sm font-bold">{site.propertyName}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{site.websiteUrl}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedSiteId(site.id);
                              setSelectedTab('rank-tracker');
                            }}
                            className="btn-brand text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer shadow-sm"
                          >
                            Track
                          </button>
                          {confirmDeleteId === site.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => deleteWebsite(site.id)}
                                disabled={deletingId === site.id}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer shadow-sm transition"
                              >
                                {deletingId === site.id ? 'Deleting...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(site.id)}
                              className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add Website Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full" />
            <h2 className="text-slate-900 font-extrabold text-base mb-1">Add Website</h2>
            <p className="text-slate-500 text-xs font-semibold mb-4">Enter your website URL to start tracking</p>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-3xl px-4 py-3 mb-4 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
            />
            {error && <p className="text-red-500 text-sm font-semibold mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 bg-white text-slate-650 text-sm font-bold py-2.5 rounded-full hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={addWebsite} disabled={loading}
                className="flex-1 btn-brand text-white text-sm font-bold py-2.5 rounded-full hover:bg-indigo-750 disabled:opacity-50 cursor-pointer shadow-sm">
                {loading ? 'Adding...' : 'Add Website'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      <AdminModal open={showAdminModal} onClose={() => setShowAdminModal(false)}>
        <AdminPanel modalStyle />
      </AdminModal>
    </div>
  );
}
