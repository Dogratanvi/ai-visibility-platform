export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface/90 text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">AI Visibility</p>
          <p className="text-xs text-white/50">AI Visibility & Search Optimization</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <a href="/geo-score" className="transition hover:text-white">GEO Score</a>
          <a href="/crawl-radar" className="transition hover:text-white">Crawl Radar</a>
          <a href="/free-audit" className="transition hover:text-white">Free AI Report</a>
          <a href="/cited-index" className="transition hover:text-white">AI Visibility Index</a>
        </div>
      </div>
    </footer>
  );
}
