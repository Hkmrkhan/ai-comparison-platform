import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 subtle-grid opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_30%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="flex flex-col justify-center space-y-8">
            <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-lg shadow-cyan-500/10">
              Human-centered AI comparison workspace
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Compare AI models in a workspace that feels premium.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Run one prompt across multiple models, review results side by side, and keep your history organized in a clean, focused interface.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/login">
                <Button className="h-12 rounded-full bg-cyan-400 px-6 text-sm font-semibold text-slate-950 shadow-[0_20px_40px_rgba(34,211,238,0.18)] hover:bg-cyan-300">
                  Get Started
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
                  Open Dashboard
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Multi-model', 'Compare across Groq, OpenAI, Gemini, and Anthropic.'],
                ['Saved history', 'Return to past prompts and reuse strong outputs.'],
                ['Private keys', 'Store provider keys under your own account.'],
              ].map(([title, text]) => (
                <div key={title} className="glass-panel rounded-2xl p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="glass-panel relative w-full max-w-xl overflow-hidden rounded-[2rem] p-6 shadow-[0_30px_100px_rgba(15,23,42,0.55)] sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Control room</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Fast setup, clear output</h2>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                    Ready
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="h-3 w-36 rounded-full bg-slate-700/80" />
                  <div className="h-3 w-full rounded-full bg-slate-800" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-800" />
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {['Prompt', 'Models', 'History'].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                        <div className="text-sm text-slate-400">{item}</div>
                        <div className="mt-2 text-lg font-semibold text-white">Organized</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                    <div className="text-sm text-cyan-100">Comparison speed</div>
                    <div className="mt-2 text-3xl font-semibold text-white">Parallel</div>
                  </div>
                  <div className="rounded-3xl border border-violet-400/15 bg-violet-400/10 p-5">
                    <div className="text-sm text-violet-100">Workspace feel</div>
                    <div className="mt-2 text-3xl font-semibold text-white">Refined</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}