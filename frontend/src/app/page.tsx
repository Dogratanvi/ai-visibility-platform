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

  return (
    <div className="min-h-screen overflow-hidden bg-[#07101e] text-white">
      <PublicHeader />

      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:py-16">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[#64f4d2]/50 to-transparent" />

        <section className="grid min-h-[680px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative z-10 space-y-7">
            <span className="inline-flex items-center gap-3 rounded-full border border-[#64f4d2]/20 bg-[#0a1727]/80 px-4 py-2 text-xs uppercase text-[#64f4d2] shadow-lg shadow-[#020814]/30">
              <span className="h-2 w-2 rounded-full bg-[#64f4d2]" />
              AI Visibility Optimization
            </span>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                Your customers are asking AI.
                <span className="block text-[#8fa4ff]">Are you the answer?</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/72">Every day, millions of people ask ChatGPT, Perplexity, and Gemini for product recommendations. AI Visibility tracks whether AI mentions your brand and shows you exactly how to change it.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="/free-audit" className="inline-flex min-h-12 min-w-[10.75rem] shrink-0 items-center justify-center rounded-full bg-[#5b74ff] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5b74ff]/25 transition hover:bg-[#7890ff] whitespace-nowrap">Get Free Report →</a>
              <a href="/pricing" className="inline-flex min-h-12 min-w-[8.5rem] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:border-[#64f4d2]/40 hover:bg-white/[0.1] whitespace-nowrap">View Pricing</a>
              <a href="https://cal.com/ai-visibility/30min" target="_blank" rel="noreferrer" className="inline-flex min-h-12 min-w-[10rem] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:border-[#64f4d2]/40 hover:bg-white/[0.1] whitespace-nowrap">Book a Demo →</a>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              {[
                ['257+', 'Brands'],
                ['185', 'Prompts'],
                ['5', 'Platforms'],
              ].map(([value, label]) => (
                <div key={label} className="border-l border-white/12 pl-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs uppercase text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border border-[#64f4d2]/10 bg-linear-to-br from-[#123746]/60 via-transparent to-[#5b74ff]/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/12 bg-[#091322]/95 p-5 shadow-2xl shadow-black/30 lg:p-7">
              <div className="mb-5 grid grid-cols-3 gap-3">
                {[
                  ['68%', 'Mention rate', '#64f4d2'],
                  ['#3', 'Avg position', '#f8d36a'],
                  ['22%', 'SOV lift', '#8fa4ff'],
                ].map(([value, label, color]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
                    <p className="mt-1 text-xs text-white/50">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-[#0c1728] p-5">
                <div>
                  <p className="text-xs uppercase text-[#64f4d2]">Skincare & Beauty</p>
                  <p className="mt-3 text-xl font-semibold text-white">AI Visibility Leaderboard</p>
                </div>
                <span className="rounded-full bg-[#64f4d2]/12 px-3 py-1 text-xs text-[#9ff8df]">Latest</span>
              </div>

              <div className="mt-2">
                <RankingsPanel />
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/72">
                <p>257+ brands · 185 prompts across 8 categories · 5 AI platforms</p>
                <a href="/cited-index" className="mt-4 inline-block text-sm font-semibold text-[#8fa4ff] transition hover:text-white">See full AI Visibility Index →</a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-7 transition hover:border-[#64f4d2]/30 hover:bg-white/[0.06]">
              <p className="text-xs uppercase text-[#64f4d2]">{item.title}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0a1727] p-8 lg:p-10">
            <p className="text-xs uppercase text-[#64f4d2]">The shift</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">The brands AI recommends are winning the customers you&apos;re losing.</h2>
            <p className="mt-4 text-base leading-7 text-white/70">Nearly 40% of consumers now start product searches on AI chatbots. When someone asks ChatGPT ‘best skincare brand in India,’ your Google ranking doesn&apos;t matter — only AI’s answer does.</p>
          </div>
          <div className="space-y-6">
            {steps.map((item, index) => (
              <div key={item.heading} className="flex gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#64f4d2]/12 text-sm font-semibold text-[#64f4d2]">{index + 1}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.heading}</div>
                  <p className="mt-2 leading-7 text-white/66">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
