"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function PublicHeader() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const userName = session?.user?.name || session?.user?.email || 'Account';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ease-out ${
        isScrolled 
          ? 'bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md border-slate-200' 
          : 'bg-white/80 backdrop-blur-md border-slate-100'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <div>
              <p className="text-base font-extrabold bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">AI Visibility</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI search optimization</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-medium text-slate-600">
            <Link href="/geo-score" className="transition hover:text-slate-900">GEO Score</Link>
            <Link href="/crawl-radar" className="transition hover:text-slate-900">Crawl Radar</Link>
            <Link href="/free-audit" className="transition hover:text-slate-900">Free AI Report</Link>
            <Link href="/cited-index" className="transition hover:text-slate-900">AI Visibility Index</Link>
            <Link href="/blog" className="transition hover:text-slate-900">Blog</Link>
            <Link href="/pricing" className="transition hover:text-slate-900">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <>
                <span className="text-sm font-medium text-slate-600">{userName}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">Login</Link>
            )}
            <Link href="/pricing" className="rounded-full btn-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition">Get started</Link>
          </div>
        </div>
      </header>
      <div className="h-20" />
    </>
  );
}
