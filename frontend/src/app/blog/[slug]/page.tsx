'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  readTime: number;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch the specific blog
        const blogRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`);
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          setBlog(blogData);

          // Fetch related blogs from same category
          const relatedRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/blog?category=${encodeURIComponent(blogData.category)}&limit=3`
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelated(relatedData.data.filter((b: Blog) => b.id !== blogData.id).slice(0, 2));
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
        <PublicHeader />
        <main className="mx-auto max-w-4xl px-6 py-12 text-center">
          <p className="text-slate-500 font-bold">Loading article...</p>
        </main>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
        <PublicHeader />
        <main className="mx-auto max-w-4xl px-6 py-12 text-center">
          <p className="mb-4 text-slate-500 font-bold">Article not found</p>
          <Link href="/blog" className="text-indigo-650 hover:text-indigo-800 font-bold">
            Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500 font-bold">
          <Link href="/blog" className="hover:text-indigo-650">
            Blog
          </Link>
          <span>/</span>
          <Link href={`/blog?category=${blog.category}`} className="hover:text-indigo-650">
            {blog.category}
          </Link>
        </div>

        {/* Hero Section */}
        <article className="mb-12 space-y-6">
          <header className="space-y-4">
            <div className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-705">
              {blog.category}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
              {blog.title}
            </h1>
            <div className="flex flex-col gap-4 border-t border-slate-200 border-b pt-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-bold text-slate-900">{blog.author}</p>
                  <p className="text-sm text-slate-550">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-550 font-semibold">
                <span>{blog.readTime} min read</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{blog.views} views</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.imageUrl && (
            <div className="overflow-hidden rounded-3xl bg-indigo-50">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose mx-auto max-w-none space-y-6 text-slate-700">
            {blog.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('##')) {
                return (
                  <h2 key={idx} className="text-2xl font-bold text-indigo-650 pt-4">
                    {paragraph.replace(/^##\s/, '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('###')) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-slate-900 pt-2">
                    {paragraph.replace(/^###\s/, '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((line) => line.startsWith('- '));
                return (
                  <ul key={idx} className="space-y-2 list-none pl-0">
                    {items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-650 font-medium">
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                        <span>{item.replace(/^-\s/, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('**') || paragraph.includes('**')) {
                return (
                  <p key={idx} className="text-lg leading-relaxed text-slate-650">
                    {paragraph.split('**').map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="font-bold text-slate-900">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }
              return (
                <p key={idx} className="text-lg leading-relaxed text-slate-655">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Divider */}
        <div className="my-12 border-t border-slate-200" />

        {/* Author Section */}
        <section className="mb-12 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-slate-900">About the Author</h3>
          <p className="text-slate-600 font-medium">
            {blog.author} is an expert in AI visibility and brand optimization. Follow for more insights on how to optimize your brand for AI-powered platforms.
          </p>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900">Related Articles</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((relatedBlog) => (
                <Link href={`/blog/${relatedBlog.slug}`} key={relatedBlog.id}>
                  <article className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-md">
                    {relatedBlog.imageUrl && (
                      <div className="relative h-40 overflow-hidden bg-indigo-50">
                        <img
                          src={relatedBlog.imageUrl}
                          alt={relatedBlog.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700">
                          {relatedBlog.category}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{relatedBlog.readTime} min</span>
                      </div>
                      <h4 className="line-clamp-2 font-bold text-slate-900 group-hover:text-indigo-650 transition">
                        {relatedBlog.title}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{relatedBlog.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-16 rounded-4xl border border-slate-250 bg-white p-8 text-center sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full" />
          <h3 className="mb-4 text-2xl font-extrabold text-slate-900">Ready to Optimize Your AI Visibility?</h3>
          <p className="mb-6 text-slate-600 max-w-xl mx-auto">
            Get a free report on how your brand appears across AI platforms.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/free-audit"
              className="inline-flex items-center justify-center rounded-full btn-brand px-6 py-3 font-bold text-white transition shadow-md cursor-pointer"
            >
              Get Free Report →
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              Read More Articles
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
