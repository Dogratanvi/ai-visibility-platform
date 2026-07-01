'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
  websites: Array<{ id: string; propertyName: string; websiteUrl: string }>;
  subscription: { plan: string; status: string } | null;
};

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  featured: boolean;
  published: boolean;
  readTime: number;
  imageUrl?: string;
  createdAt: string;
};

export default function AdminPanel({ compact, modalStyle }: { compact?: boolean; modalStyle?: boolean } = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [error, setError] = useState('');
  const [blogError, setBlogError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'modules' | 'blogs'>('users');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    featured: false,
    published: true,
    imageUrl: '',
    readTime: 5,
  });
  const [creatingBlog, setCreatingBlog] = useState(false);

  // List of all system modules and their API integrations (Peec AI reference)
  const systemModules = [
    {
      id: 'visibility_pct',
      name: 'Visibility %',
      type: 'Core Analytics',
      provider: 'OpenAI (GPT-4o) / Perplexity Search API',
      description: 'Calculates the brand recommendation frequency across AI answer runs.',
      status: 'Active',
    },
    {
      id: 'sentiment_score',
      name: 'Sentiment Score',
      type: 'Core Analytics',
      provider: 'OpenAI Sentiment Classifier API',
      description: 'Performs natural language evaluation of AI citations to extract user perception.',
      status: 'Active',
    },
    {
      id: 'position_tracking',
      name: 'Position Tracking',
      type: 'Core Analytics',
      provider: 'DataForSEO SERP Google API',
      description: 'Tracks website organic positions for custom keywords and search queries.',
      status: 'Active',
    },
    {
      id: 'ai_prompt_tracking',
      name: 'AI Prompt Tracking',
      type: 'Core Analytics',
      provider: 'OpenAI, Anthropic & Gemini API Engine',
      description: 'Monitors brand performance on multiple models using pre-configured system queries.',
      status: 'Active',
    },
    {
      id: 'competitor_comparison',
      name: 'Competitor Comparison',
      type: 'Core Analytics',
      provider: 'LLM Parser & Share of Voice Processor',
      description: 'Compares user domain citation frequency directly with competitor domains.',
      status: 'Active',
    },
    {
      id: 'source_urls',
      name: 'Source URLs Used by AI',
      type: 'Core Analytics',
      provider: 'Perplexity / Gemini Grounding Array Payload',
      description: 'Extracts the source links cited by AI models in references and grounding metadata.',
      status: 'Active',
    },
    {
      id: 'trend_reports',
      name: 'Daily Trend Reports',
      type: 'Core Analytics',
      provider: 'Timescale / PostgreSQL Local Time-Series',
      description: 'Aggregates periodic scans to display historical chart trend metrics.',
      status: 'Active',
    },
    {
      id: 'multi_platform_tracking',
      name: 'ChatGPT, Gemini, Perplexity, Google AI Tracking',
      type: 'Paid Feature',
      provider: 'Official OpenAI, Anthropic, Gemini, Perplexity Clients',
      description: 'Performs multi-platform AI crawls to audit citations.',
      status: 'Active',
    },
    {
      id: 'custom_prompts',
      name: 'Custom Prompts',
      type: 'Paid Feature',
      provider: 'User Custom Prompt Interface',
      description: 'Allows enterprise users to insert custom queries to track conversational placements.',
      status: 'Active',
    },
    {
      id: 'country_specific_tracking',
      name: 'Country-Specific Tracking',
      type: 'Paid Feature',
      provider: 'DataForSEO Location Codes / LLM Geo Instructions',
      description: 'Audits recommendations based on regional access blocks or location variables.',
      status: 'Active',
    },
    {
      id: 'csv_exports',
      name: 'CSV Exports',
      type: 'Paid Feature',
      provider: 'Express CSV stream generator',
      description: 'Allows users to download visibility summaries and raw query logs.',
      status: 'Active',
    },
    {
      id: 'api_access',
      name: 'REST API Access',
      type: 'Paid Feature',
      provider: 'Platform OAuth Client Access Tokens',
      description: 'Provides programmatic visibility data access via API keys.',
      status: 'Active',
    },
    {
      id: 'looker_studio',
      name: 'Looker Studio Integration',
      type: 'Paid Feature',
      provider: 'Google Apps Script Connector Scheme',
      description: 'Exposes data schema integration for enterprise Looker Studio reports.',
      status: 'Active',
    },
    {
      id: 'team_workspaces',
      name: 'Team Workspaces',
      type: 'Paid Feature',
      provider: 'Multi-tenant Workspace schemas (Postgres)',
      description: 'Supports user permissions sharing and collaborative dashboards.',
      status: 'Active',
    },
    {
      id: 'daily_automated_scans',
      name: 'Daily Automated Scans',
      type: 'Paid Feature',
      provider: 'Node-cron Scheduler / Agenda BG Workers',
      description: 'Automates visibility checks in a background scheduler.',
      status: 'Active',
    },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUsers();
      fetchBlogs();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to load users');
      } else {
        setUsers(data);
      }
    } catch (err) {
      setError('Unable to load users');
    }

    setLoading(false);
  };

  const updateSubscriptionPlan = async (userId: string, plan: string) => {
    setUpdatingUserId(userId);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ plan, status: 'active' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to update subscription');
      } else {
        // Reload users list
        await fetchUsers();
      }
    } catch (err) {
      setError('Failed to update subscription plan');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    setBlogError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setBlogError(data.error || 'Unable to load blogs');
      } else {
        setBlogs(data.data);
      }
    } catch (err) {
      setBlogError('Unable to load blogs');
    }

    setLoadingBlogs(false);
  };

  const createBlog = async () => {
    setCreatingBlog(true);
    setBlogError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(newBlog),
      });
      const data = await res.json();
      if (!res.ok) {
        setBlogError(data.error || 'Unable to create blog');
      } else {
        setNewBlog({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          author: '',
          category: '',
          featured: false,
          published: true,
          imageUrl: '',
          readTime: 5,
        });
        fetchBlogs();
      }
    } catch (err) {
      setBlogError('Unable to create blog');
    }

    setCreatingBlog(false);
  };

  if (status === 'loading') return <div className="p-6 text-sm text-slate-400 font-semibold">Loading...</div>;

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN') {
    return (
      <div className="p-6">
        <p className="text-sm font-semibold text-slate-500">You do not have access to this page.</p>
      </div>
    );
  }

  const wrapperClasses = modalStyle
    ? 'w-full max-w-6xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl p-6 text-slate-800'
    : 'min-h-screen bg-transparent text-slate-800 p-6';

  const innerContainer = modalStyle ? 'p-0' : 'max-w-6xl mx-auto';

  return (
    <div className={wrapperClasses}>
      <div className={innerContainer}>
        {/* Header */}
        <div className={`mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
          <div>
            <h1 className="text-slate-900 font-extrabold text-3xl tracking-tight">Admin Portal</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Configure users, subscription plans, blog articles, and core system modules.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer">
              Refresh System
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-150 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              activeTab === 'users' ? 'bg-indigo-50 text-indigo-750 border border-indigo-150' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            👥 User Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              activeTab === 'modules' ? 'bg-indigo-50 text-indigo-750 border border-indigo-150' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            ⚙️ Modules & API Health
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              activeTab === 'blogs' ? 'bg-indigo-50 text-indigo-750 border border-indigo-150' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            ✍️ Blog Publications
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>
        )}

        {/* Tab 1: User Subscriptions */}
        {activeTab === 'users' && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Manage User Plan Entitlements</h2>
            {loading ? (
              <p className="text-xs font-semibold text-slate-400">Loading user list...</p>
            ) : users.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400">No user accounts found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-slate-150 bg-white p-5 transition hover:border-slate-350 hover:shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.name || 'Unnamed user'}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{user.email || 'No email'}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[9px] font-extrabold text-slate-500 uppercase">
                          {user.role || 'USER'}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-1.5 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3">
                        <p className="flex items-center justify-between">
                          <span>Websites Connected:</span>
                          <span className="text-slate-800 font-extrabold">{user.websites?.length ?? 0}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Current Plan State:</span>
                          <span className="text-indigo-700 font-extrabold uppercase text-[10px] bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5">
                            {user.subscription?.plan || 'free'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Subscription Upgrader */}
                    <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Modify Plan:</span>
                      <select
                        disabled={updatingUserId === user.id}
                        value={user.subscription?.plan || 'free'}
                        onChange={(e) => updateSubscriptionPlan(user.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-850 outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        <option value="free">Free Audit</option>
                        <option value="paid">Pro Subscription</option>
                        <option value="enterprise">Enterprise Plan</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Modules & API Health */}
        {activeTab === 'modules' && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">System Modules Dashboard</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Overview of the 14 visibility modules. Simulated details correspond to Peec AI Dashboard backend routing.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemModules.map((mod) => (
                <div key={mod.id} className="rounded-2xl border border-slate-150 bg-white p-4 flex flex-col justify-between hover:shadow-xs hover:border-slate-350 transition">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-900 text-xs">{mod.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase border ${
                        mod.type === 'Paid Feature' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {mod.type}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500 font-semibold leading-relaxed">{mod.description}</p>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <div>
                      <p className="font-bold text-[9px] text-slate-350 uppercase tracking-wide">Provider API</p>
                      <p className="text-slate-600 font-bold mt-0.5">{mod.provider}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold uppercase text-[8px]">
                      {mod.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Blog Posts Publication */}
        {activeTab === 'blogs' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
            {/* Create Blog */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Create Blog Entry</h2>
              {blogError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{blogError}</div>
              )}
              <div className="grid gap-3">
                <input
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Title"
                />
                <input
                  value={newBlog.slug}
                  onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Slug"
                />
                <input
                  value={newBlog.author}
                  onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Author"
                />
                <input
                  value={newBlog.category}
                  onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Category"
                />
                <input
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Excerpt"
                />
                <input
                  value={newBlog.imageUrl}
                  onChange={(e) => setNewBlog({ ...newBlog, imageUrl: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Image URL"
                />
                <textarea
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  className="min-h-32 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition resize-y"
                  placeholder="Content (Markdown supported)"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    value={newBlog.readTime}
                    onChange={(e) => setNewBlog({ ...newBlog, readTime: Number(e.target.value) })}
                    className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 outline-none font-semibold transition"
                    placeholder="Read time"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-slate-550 font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBlog.featured}
                      onChange={(e) => setNewBlog({ ...newBlog, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                    />
                    Featured Post
                  </label>
                </div>
                <button
                  onClick={createBlog}
                  disabled={creatingBlog}
                  className="rounded-2xl btn-brand px-4 py-3 text-xs font-bold text-white hover:shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  {creatingBlog ? 'Creating...' : 'Create Blog'}
                </button>
              </div>
            </div>

            {/* List Existing Blogs */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
              <h2 className="text-base font-bold text-slate-900 mb-4">Published Posts</h2>
              {loadingBlogs ? (
                <p className="text-xs font-semibold text-slate-400">Loading published blogs...</p>
              ) : blogs.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400">No blogs found.</p>
              ) : (
                <div className="space-y-3 text-xs text-slate-600">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="rounded-xl border border-slate-150 bg-slate-50 p-3 hover:border-slate-250 transition">
                      <p className="font-bold text-slate-900">{blog.title}</p>
                      <p className="text-[9px] font-bold text-indigo-650 mt-1 uppercase tracking-wider">
                        {blog.category} • {blog.published ? 'Published' : 'Draft'}
                      </p>
                      <p className="mt-2 text-slate-500 font-semibold line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
