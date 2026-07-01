'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  featured: boolean;
  imageUrl?: string;
  readTime: number;
  views: number;
  createdAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featured, setFeatured] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Fetch featured blogs
        const featuredRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/featured?limit=3`);
        if (featuredRes.ok) {
          const data = await featuredRes.json();
          setFeatured(data.data);
        }

        // Fetch all blogs
        const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog?limit=100`);
        if (allRes.ok) {
          const data = await allRes.json();
          setBlogs(data.data);
          
          // Extract unique categories
          const cats = [...new Set(data.data.map((b: Blog) => b.category))];
          setCategories(cats as string[]);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = selectedCategory
    ? blogs.filter((b) => b.category === selectedCategory)
    : blogs;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        {/* Hero Section */}
        <section className="mb-16 space-y-6 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight">
            AI Visibility <span className="text-indigo-650">Blog</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Stay informed with the latest insights on AI platform optimization, brand visibility strategies, and citation management.
          </p>
        </section>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="mb-20">
            <h2 className="mb-8 text-2xl font-extrabold text-slate-900">Featured Articles</h2>
            <div className="grid gap-8 lg:grid-cols-3">
              {featured.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id}>
                  <article className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-md">
                    {blog.imageUrl && (
                      <div className="relative h-48 overflow-hidden bg-indigo-50">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                          {blog.category}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{blog.readTime} min read</span>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-indigo-650 transition">
                        {blog.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-slate-500">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span>{blog.author}</span>
                        <span>{blog.views} views</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Blog List */}
        <section>
          {loading ? (
            <div className="text-center text-slate-500 font-bold">Loading articles...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center text-slate-500 font-bold">No articles found in this category.</div>
          ) : (
            <div className="space-y-6">
              {filteredBlogs.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id}>
                  <article className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                            {blog.category}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-indigo-650 transition">
                          {blog.title}
                        </h2>
                        <p className="mb-4 text-slate-650 leading-relaxed text-sm">{blog.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-550">
                          <span>By {blog.author}</span>
                          <span>•</span>
                          <span>{blog.readTime} min read</span>
                          <span>•</span>
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                      {blog.imageUrl && (
                        <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-indigo-50 sm:h-24 sm:w-40">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-20 rounded-4xl border border-slate-250 bg-white p-8 text-center sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full animate-pulse" />
          <h3 className="mb-4 text-2xl font-extrabold text-slate-900">Subscribe for Updates</h3>
          <p className="mb-6 text-slate-650 max-w-xl mx-auto">Get the latest AI visibility insights delivered to your inbox</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white transition flex-1"
            />
            <button className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700 cursor-pointer">
              Subscribe
            </button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
