'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminModal from '@/components/AdminModal';
import AdminPanel from '@/components/AdminPanel';
import AiVisibilityPanel from '@/components/AiVisibilityPanel';
import CommandCenterPanel from '@/components/CommandCenterPanel';
import GrowthActionsPanel from '@/components/GrowthActionsPanel';
import RankTrackerClient from '@/app/dashboard/rank-tracker/RankTrackerClient';

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

  const filteredWebsites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return websites;
    return websites.filter((site) => (
      site.propertyName.toLowerCase().includes(query)
      || site.websiteUrl.toLowerCase().includes(query)
    ));
  }, [searchQuery, websites]);

  const navItems = [
    { id: 'home', label: 'Command Center' },
    { id: 'ai-visibility', label: 'AI Visibility Report' },
    { id: 'growth-actions', label: 'Execution Layer' },
    { id: 'rank-tracker', label: 'Prompt Tracker' },
    { id: 'keywords', label: 'Keyword Research' },
    { id: 'backlinks', label: 'Citation Monitor' },
    { id: 'settings', label: 'Settings' },
    ...(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'
      ? [{ id: 'admin', label: '🛠️ Admin Panel' }]
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ url, propertyName: url })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Unable to add website.');
      setLoading(false);
      return;
    }

    if (data.id) {
      await fetchWebsites();
      setShowModal(false);
      setUrl('');
    } else {
      setError('Unable to add website. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-linear-to-tr from-[#071021] to-[#0b1220] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white/3 backdrop-blur-sm border-r border-white/6 flex flex-col shrink-0 shadow-lg">
        <div className="p-4 border-b border-white/6 flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-[#4f6ef7] to-[#6b8cff] rounded-lg flex items-center justify-center text-white">📈</div>
          <div>
            <span className="text-white font-semibold text-sm">AI Visibility</span>
            <p className="text-[11px] text-white/70">Analytics dashboard</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id}
              onClick={() => setSelectedTab(item.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedTab === item.id ? 'bg-linear-to-r from-[#172033] to-[#0f1b2a] text-white border-l-4 border-[#4f6ef7]' : 'text-white/80 hover:bg-white/3'}`}>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/6">
          <div className="rounded-lg p-3 bg-white/3">
            <p className="text-[11px] text-white/70">Current Plan</p>
            <p className="text-emerald-400 text-xs font-semibold mt-1">{currentPlan}</p>
            <Link href="/pricing" className="block w-full mt-3 bg-linear-to-r from-[#4f6ef7] to-[#6b8cff] text-center text-white text-xs py-2 rounded-lg">
              Manage plan
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-transparent border-b border-white/6 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold text-lg">Dashboard</h1>
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
                className="w-80 pl-10 pr-4 py-2 rounded-full bg-white/3 text-white placeholder-white/60 focus:outline-none"
              />
              <span className="absolute left-3 top-2 text-white/70">🔎</span>
              {searchQuery.trim() ? (
                <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#101827] shadow-2xl">
                  {filteredWebsites.length ? filteredWebsites.slice(0, 6).map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => {
                        setSelectedSiteId(site.id);
                        setSelectedTab('home');
                        setSearchQuery('');
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-white/7"
                    >
                      <span className="block text-sm font-medium text-white">{site.propertyName}</span>
                      <span className="block text-xs text-white/55">{site.websiteUrl}</span>
                    </button>
                  )) : (
                    <div className="px-4 py-3 text-sm text-white/55">No matching websites</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-xs hidden md:inline">{session?.user?.email}</span>
            {session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN' ? (
              <button onClick={() => setShowAdminModal(true)}
                className="hidden md:inline-flex items-center gap-2 bg-linear-to-r from-[#4f6ef7] to-[#6b8cff] text-white text-sm px-3 py-1.5 rounded-full">
                🛠️ Admin
              </button>
            ) : null}
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-full">
              Sign Out
            </button>
            <div className="w-8 h-8 bg-linear-to-br from-[#4f6ef7] to-[#6b8cff] rounded-full flex items-center justify-center text-white">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {selectedTab === 'admin' ? (
            <div className="min-h-screen">
              <AdminPanel />
            </div>
          ) : selectedTab === 'rank-tracker' ? (
            <RankTrackerClient siteId={selectedSiteId || undefined} />
          ) : selectedTab === 'ai-visibility' ? (
            <AiVisibilityPanel websites={websites} selectedWebsiteId={selectedSiteId} />
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
              <div className="mt-6 bg-white/3 border border-white/6 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-medium text-sm">Your Websites</h2>
                  <button onClick={() => setShowModal(true)}
                    className="bg-[#4f6ef7] text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#3d5ce6]">
                    + Add Website
                  </button>
                </div>

                {websites.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">🌐</p>
                    <p className="text-[#4a4f6a] text-xs">No websites added yet</p>
                    <button onClick={() => setShowModal(true)}
                      className="mt-3 bg-[#4f6ef7] text-white text-xs px-4 py-2 rounded-md hover:bg-[#3d5ce6]">
                      Add Your First Website
                    </button>
                    
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredWebsites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                        <div>
                          <p className="text-white text-sm font-medium">{site.propertyName}</p>
                          <p className="text-white/70 text-xs">{site.websiteUrl}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSiteId(site.id);
                            setSelectedTab('rank-tracker');
                          }}
                          className="bg-linear-to-r from-[#4f6ef7] to-[#6b8cff] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#3d5ce6]">
                          Track
                        </button>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#13151f] border border-[#2a2d3a] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-medium text-base mb-1">Add Website</h2>
            <p className="text-[#4a4f6a] text-xs mb-4">Enter your website URL to start tracking</p>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#1e2130] border border-[#2a2d3a] text-white text-sm rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-[#4f6ef7]"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-[#1e2130] text-[#8890b5] text-sm py-2.5 rounded-lg hover:bg-[#2a2d3a]">
                Cancel
              </button>
              <button onClick={addWebsite} disabled={loading}
                className="flex-1 bg-[#4f6ef7] text-white text-sm py-2.5 rounded-lg hover:bg-[#3d5ce6] disabled:opacity-50">
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
