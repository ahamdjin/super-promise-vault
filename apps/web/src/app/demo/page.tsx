import { redirect } from 'next/navigation';
import { CaseList } from '@/components/case-list';
import { SessionActions } from '@/components/session-actions';
import { mockCases } from '@/lib/mock-cases';
import { createClient } from '@/lib/supabase/server';

export default async function DemoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/demo');
  }

  const waitingCases = mockCases.filter((item) => item.status === 'waiting');
  const waitingCount = mockCases.filter((item) => item.status === 'waiting').length;
  const promisedCount = mockCases.filter((item) => item.status === 'promised').length;
  const focusQueue = [...mockCases].sort((left, right) => left.followUp.localeCompare(right.followUp));
  const primaryCase = focusQueue[0];
  const providerMix = Array.from(new Set(mockCases.map((item) => item.provider)));

  return (
    <main className="flex min-h-screen w-full bg-slate-50 text-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold tracking-[0.18em]">
            SPV
          </div>
          <div>
            <p className="font-semibold">Support Promise Vault</p>
            <span className="text-sm text-slate-400">Operator workspace</span>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cases</div>
          <nav className="space-y-1">
            <a className="flex items-center rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-white" href="#overview">
              Overview
            </a>
            <a className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5" href="#board">
              Active cases
            </a>
            <a className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5" href="#focus">
              Focus item
            </a>
          </nav>
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current mode</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Auth is live. The next product step is replacing these mock cases with Supabase reads and one create-case flow.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overview</span>
            <strong className="truncate text-sm font-semibold text-slate-900">Support promises that still need action</strong>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:flex">
              Search cases, merchants, IDs
            </div>
            <SessionActions email={user.email ?? 'Signed in user'} />
          </div>
        </header>

        <div className="flex flex-1 flex-col space-y-4 px-4 pt-4 pb-4 md:px-6">
          <section className="flex items-center justify-between" id="overview">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Hi, Welcome back 👋</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Track the promises that are easiest for support teams to forget.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 *:bg-gradient-to-t *:from-slate-100/70 *:to-white *:shadow-sm md:grid-cols-2 lg:grid-cols-3">
            <article data-slot="card" className="flex flex-col gap-6 rounded-xl border border-slate-200 py-6">
              <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div data-slot="card-description" className="text-sm text-slate-500">Open cases</div>
                <div data-slot="card-title" className="text-2xl font-semibold tabular-nums text-slate-950 @[250px]/card:text-3xl">
                  {mockCases.length}
                </div>
              </div>
              <div data-slot="card-footer" className="flex flex-col items-start gap-1.5 px-6 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-slate-950">
                  Proof saved and still unresolved
                </div>
                <div className="text-slate-500">Cases that still need verification or escalation</div>
              </div>
            </article>
            <article data-slot="card" className="flex flex-col gap-6 rounded-xl border border-slate-200 py-6">
              <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div data-slot="card-description" className="text-sm text-slate-500">Due soon</div>
                <div data-slot="card-title" className="text-2xl font-semibold tabular-nums text-slate-950 @[250px]/card:text-3xl">
                  {waitingCount}
                </div>
              </div>
              <div data-slot="card-footer" className="flex flex-col items-start gap-1.5 px-6 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-slate-950">
                  Follow-ups leading the queue
                </div>
                <div className="text-slate-500">Support trails that can go cold if ignored</div>
              </div>
            </article>
            <article data-slot="card" className="flex flex-col gap-6 rounded-xl border border-slate-200 py-6">
              <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div data-slot="card-description" className="text-sm text-slate-500">Stable</div>
                <div data-slot="card-title" className="text-2xl font-semibold tabular-nums text-slate-950 @[250px]/card:text-3xl">
                  {promisedCount}
                </div>
              </div>
              <div data-slot="card-footer" className="flex flex-col items-start gap-1.5 px-6 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-slate-950">
                  Saved proof, lower urgency
                </div>
                <div className="text-slate-500">Cases with evidence attached but not at the top of the board</div>
              </div>
            </article>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_340px]" id="board">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Primary queue</span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Active cases</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Use a list-first operator view: company, promise, amount, due date, and state in one scan.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    All
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Waiting
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Promised
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {providerMix.map((provider) => (
                  <span
                    key={provider}
                    className="inline-flex min-h-8 items-center rounded-full bg-emerald-50 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                  >
                    {provider}
                  </span>
                ))}
              </div>

              <CaseList items={focusQueue} />
            </section>

            <aside className="flex flex-col gap-4" id="focus">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Case spotlight</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Focus item</h2>
                <div className="mt-4 space-y-4">
                  <span className="inline-flex min-h-8 items-center rounded-full bg-emerald-50 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    {primaryCase.provider}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{primaryCase.company}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{primaryCase.promise}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</span>
                      <strong className="mt-2 block text-sm text-slate-950">{primaryCase.amount}</strong>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Follow up</span>
                      <strong className="mt-2 block text-sm text-slate-950">{primaryCase.followUp}</strong>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Saved note</span>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{primaryCase.summary}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Upcoming</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Next actions</h2>
                <div className="mt-4 space-y-3">
                  {waitingCases.map((item) => (
                    <article key={item.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <strong className="block text-sm text-slate-950">{item.company}</strong>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.promise}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.followUp}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
