'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function BlogManagementPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchBlogs();
    }
  }, [status, router]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to load blogs');
      } else {
        setBlogs(data.data);
      }
    } catch (err) {
      setError('Unable to load blogs');
    }

    setLoading(false);
  };

  const createBlog = async () => {
    setCreatingBlog(true);
    setError('');

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
        setError(data.error || 'Unable to create blog');
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
      setError('Unable to create blog');
    }

    setCreatingBlog(false);
  };

  if (status === 'loading') {
    return <div className="p-6 text-sm text-slate-400 font-semibold">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-slate-800">
      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        {/* Create Blog Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
          <h2 className="text-lg font-bold text-slate-950 mb-4">Blog Management</h2>
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>
          )}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900 text-sm">Create New Blog</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Title"
              />
              <input
                value={newBlog.slug}
                onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Slug"
              />
              <input
                value={newBlog.author}
                onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Author"
              />
              <input
                value={newBlog.category}
                onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Category"
              />
              <input
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Excerpt"
              />
              <input
                value={newBlog.imageUrl}
                onChange={(e) => setNewBlog({ ...newBlog, imageUrl: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                placeholder="Image URL"
              />
              <textarea
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                className="min-h-30 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition resize-y"
                placeholder="Content (Markdown supported)"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={newBlog.readTime}
                  onChange={(e) => setNewBlog({ ...newBlog, readTime: Number(e.target.value) })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-semibold transition"
                  placeholder="Read time (minutes)"
                />
                <label className="inline-flex items-center gap-2 text-xs text-slate-550 font-bold select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBlog.featured}
                    onChange={(e) => setNewBlog({ ...newBlog, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  />
                  Featured Post
                </label>
              </div>
              <button
                onClick={createBlog}
                disabled={creatingBlog}
                className="rounded-2xl btn-brand px-4 py-3 text-xs font-bold text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
              >
                {creatingBlog ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Blogs List Card */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
          <h3 className="font-bold text-slate-950 mb-4 text-lg">Existing Blog Posts</h3>
          {loading ? (
            <p className="text-xs font-semibold text-slate-400">Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400">No blogs found.</p>
          ) : (
            <div className="space-y-3 text-xs text-slate-600">
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-xl border border-slate-150 bg-white p-3 hover:border-slate-250 transition">
                  <p className="font-bold text-slate-900">{blog.title}</p>
                  <p className="text-[10px] font-bold text-indigo-650 mt-1 uppercase tracking-wider">
                    {blog.category} • {blog.published ? 'Published' : 'Draft'}
                  </p>
                  <p className="mt-2 text-slate-500 font-semibold line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
