import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import RankingsPanel from '@/components/RankingsPanel';

export default function Home() {
  const stats = [
    { title: 'Brands Tracked', value: '257+', detail: 'Across beauty, travel, SaaS, and retail' },
    { title: 'AI Responses Analyzed', value: '19,000+', detail: 'ChatGPT, Gemini, Perplexity, Claude, Copilot' },
    { title: 'AI Platforms Monitored', value: '5', detail: 'Daily movement across leading answer engines' },
  ];

  const steps = [
    { heading: 'Track', copy: 'Mention rate, position, sentiment, and share of voice across every AI platform.' },
    { heading: 'Diagnose', copy: 'Platform-by-platform gap analysis showing exactly why you are missing.' },
    { heading: 'Fix', copy: 'Prioritized actions and ready-to-use content briefs, not just advice.' },
  ];

  const blogs = [
    {
      image: '/ai_seo_graph.png',
      tag: 'Research',
      title: 'What is AISO? The Definitive Guide to AI Search Optimization',
      copy: 'Learn the core mechanics of how search engines like ChatGPT Search and Perplexity citation algorithms rank websites.',
      author: 'Dr. Sarah Lin',
      date: 'June 28, 2026',
      readTime: '6 min read'
    },
    {
      image: '/chatgpt_robot.png',
      tag: 'Case Study',
      title: "How We Lifted a Skincare Brand's Share of Voice by 35% on Gemini",
      copy: 'A deep dive into our optimization experiment using product structured schema and authority backlinks.',
      author: 'Rajesh Kumar',
      date: 'June 25, 2026',
      readTime: '8 min read'
    },
    {
      image: '/brand_visibility.png',
      tag: 'Algorithm',
      title: "Understanding Perplexity Pro's Citation Models in 2026",
      copy: 'An analysis of the new real-time indexer used by Perplexity to select recommended brand recommendations.',
      author: 'Alex Rivera',
      date: 'June 21, 2026',
      readTime: '5 min read'
    }
  ];

  const testimonials = [
    {
      quote: "AI Visibility changed our entire search strategy. We went from being completely invisible on ChatGPT to being the #1 recommended skincare brand for alternatives in under a month.",
      name: "Tanvi Sharma",
      role: "VP of Marketing",
      company: "Dermacare India",
      initials: "TS",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      quote: "Before AI Visibility, we had no idea if LLMs were recommending our travel products. Now we have a live dashboard tracking our citation rate and direct recommendations across 5 search engines.",
      name: "Michael Chen",
      role: "SEO Specialist",
      company: "Global Getaways",
      initials: "MC",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      quote: "The Crawl Radar and GEO Score tool are pure magic. We identified 12 blocked crawlers and fixed our structured data in minutes, immediately seeing a lift in Perplexity references.",
      name: "Emma Watson",
      role: "Director of Growth",
      company: "SaaSify Inc",
      initials: "EW",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <PublicHeader />

      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:py-16">
        
        {/* Top Accent Gradient Border Line */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Hero Section */}
        <section className="grid min-h-[680px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center py-8">
          <div className="relative z-10 space-y-7">
            <span className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              AI Visibility Optimization
            </span>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] text-slate-900 sm:text-6xl lg:text-7xl">
                Your customers are asking AI.
                <span className="block bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Are you the answer?</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">Every day, millions of people ask ChatGPT, Perplexity, and Gemini for product recommendations. AI Visibility tracks whether AI mentions your brand and shows you exactly how to optimize it.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap pt-2">
              <a href="/free-audit" className="inline-flex min-h-12 min-w-[10.75rem] shrink-0 items-center justify-center rounded-full btn-brand px-6 py-3 text-sm font-bold shadow-lg transition whitespace-nowrap">Get Free Report →</a>
              <a href="/pricing" className="inline-flex min-h-12 min-w-[8.5rem] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap">View Pricing</a>
              <a href="https://cal.com/ai-visibility/30min" target="_blank" rel="noreferrer" className="inline-flex min-h-12 min-w-[10rem] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap">Book a Demo →</a>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-6 border-t border-slate-200/80">
              {[
                ['257+', 'Brands'],
                ['185', 'Prompts'],
                ['5', 'Platforms'],
              ].map(([value, label]) => (
                <div key={label} className="border-l-2 border-indigo-500 pl-4">
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Widget Display */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-indigo-500/10 via-transparent to-emerald-500/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 lg:p-7">
              <div className="mb-5 grid grid-cols-3 gap-3">
                {[
                  ['68%', 'Mention rate', '#10b981'],
                  ['#3', 'Avg position', '#f59e0b'],
                  ['22%', 'SOV lift', '#6366f1'],
                ].map(([value, label, color]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Skincare & Beauty</p>
                  <p className="mt-1.5 text-lg font-bold text-slate-900">AI Visibility Leaderboard</p>
                </div>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-600">Latest Run</span>
              </div>

              <div className="mt-2 bg-slate-50/20 rounded-2xl overflow-hidden p-2 border border-slate-100/50">
                <RankingsPanel />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-slate-500 text-sm flex items-center justify-between">
                <span>257+ brands · 185 prompts · 5 AIs</span>
                <a href="/cited-index" className="font-bold text-indigo-600 transition hover:text-indigo-850 hover:underline">Full Index →</a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-16 grid gap-8 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{item.title}</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.detail}</p>
            </div>
          ))}
        </section>

        {/* Shift Section */}
        <section className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-bl-full" />
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Market Shift</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-snug text-slate-900">The brands AI recommends are winning the customers you&apos;re losing.</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">Nearly 40% of consumers now start product searches directly on AI chatbots. When someone asks ChatGPT &apos;best skincare brand in India,&apos; your traditional Google ranking doesn&apos;t matter — only AI’s recommended citations do.</p>
          </div>
          <div className="space-y-6">
            {steps.map((item, index) => (
              <div key={item.heading} className="flex gap-5 rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-sm font-bold text-indigo-600">{index + 1}</div>
                <div>
                  <div className="text-base font-bold text-slate-900">{item.heading}</div>
                  <p className="mt-1.5 leading-relaxed text-slate-500">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="mt-24 border-t border-slate-200/80 pt-20">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">Testimonials</span>
            <h2 className="text-4xl font-extrabold text-slate-900">What Marketing Leaders Say</h2>
            <p className="text-slate-500">AI Visibility helps forward-thinking brands dominate conversational search engine recommendations.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-5">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed text-sm">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${t.gradient} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BLOGS SECTION */}
        <section className="mt-24 border-t border-slate-200/80 pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">Resources</span>
              <h2 className="text-4xl font-extrabold text-slate-900">AISO Insights & Research</h2>
              <p className="text-slate-500 max-w-xl">Stay ahead of the curve with our latest findings, guides, and algorithm research on AI search engines.</p>
            </div>
            <a href="/blog" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition shrink-0 hover:underline">View All Articles &rarr;</a>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {blogs.map((b, index) => (
              <article key={index} className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-indigo-200 transition">
                <div>
                  <div className="relative overflow-hidden h-48 bg-slate-100">
                    <img 
                      src={b.image} 
                      alt={b.title} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {b.tag}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                      {b.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {b.copy}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">{b.author}</span>
                  <span>{b.date} · {b.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
