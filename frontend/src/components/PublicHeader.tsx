import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="border-b border-white/10 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-3xl bg-linear-to-br from-[#4f6ef7] to-[#7f9bff] flex items-center justify-center text-lg font-bold shadow-lg shadow-slate-900/30">
            C
          </div>
          <div>
            <p className="text-sm font-semibold">AI Visibility</p>
            <p className="text-[11px] text-white/60">AI search optimization</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex text-sm text-white/70">
          <Link href="/geo-score" className="transition hover:text-white">GEO Score</Link>
          <Link href="/crawl-radar" className="transition hover:text-white">Crawl Radar</Link>
          <Link href="/free-audit" className="transition hover:text-white">Free AI Report</Link>
          <Link href="/cited-index" className="transition hover:text-white">AI Visibility Index</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 transition hover:text-white">Login</Link>
          <Link href="/pricing" className="rounded-md btn-brand px-4 py-2 text-sm transition">Get started</Link>
        </div>
      </div>
    </header>
  );
}
