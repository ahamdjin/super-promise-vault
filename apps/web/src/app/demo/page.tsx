import { redirect } from 'next/navigation';
import { CaseCard } from '@/components/case-card';
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
  const promisedCases = mockCases.filter((item) => item.status === 'promised');
  const waitingCount = mockCases.filter((item) => item.status === 'waiting').length;
  const promisedCount = mockCases.filter((item) => item.status === 'promised').length;
  const focusQueue = [...mockCases].sort((left, right) => left.followUp.localeCompare(right.followUp));
  const providerMix = Array.from(new Set(mockCases.map((item) => item.provider)));

  return (
    <main className="demo-shell">
      <aside className="demo-sidebar">
        <div className="demo-sidebar__brand">
          <span className="demo-sidebar__mark">SPV</span>
          <div>
            <p>Support Promise Vault</p>
            <span>Operator view</span>
          </div>
        </div>

        <nav className="demo-sidebar__nav" aria-label="Dashboard sections">
          <a href="#overview" className="demo-nav-link demo-nav-link--active">
            Overview
          </a>
          <a href="#board" className="demo-nav-link">
            Cases board
          </a>
          <a href="#focus" className="demo-nav-link">
            Focus queue
          </a>
        </nav>

        <div className="demo-sidebar__note">
          <span className="eyebrow">Current mode</span>
          <p>Auth is live. Dashboard data is still mocked until the first Supabase write flow is connected.</p>
        </div>
      </aside>

      <section className="demo-workspace">
        <header className="demo-topbar" id="overview">
          <div className="demo-topbar__copy">
            <p className="eyebrow">Overview</p>
            <h1>Cases that still need proof, timing, or follow-up.</h1>
            <p>
              Keep the screen useful: who promised what, how much is at stake, and which case needs the
              next move first.
            </p>
          </div>
          <SessionActions email={user.email ?? 'Signed in user'} />
        </header>

        <section className="demo-overview">
          <article>
            <span>Open cases</span>
            <strong>{mockCases.length}</strong>
            <p>All saved promises currently tracked in the dashboard.</p>
          </article>
          <article>
            <span>Due soon</span>
            <strong>{waitingCount}</strong>
            <p>Cases waiting on a refund, replacement, or next support reply.</p>
          </article>
          <article>
            <span>Stable</span>
            <strong>{promisedCount}</strong>
            <p>Promises saved but not urgent yet.</p>
          </article>
        </section>

        <section className="demo-status-strip">
          <div>
            <span className="demo-status-strip__label">Providers</span>
            <div className="demo-token-row">
              {providerMix.map((provider) => (
                <span key={provider} className="demo-token">
                  {provider}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="demo-status-strip__label">Data source</span>
            <strong>Mock dashboard data</strong>
          </div>
          <div>
            <span className="demo-status-strip__label">Next build step</span>
            <strong>Replace this board with Supabase reads</strong>
          </div>
        </section>

        <section className="demo-grid" id="board">
          <div className="demo-board">
            <section className="demo-column">
              <div className="demo-column__header">
                <div>
                  <span className="demo-column__label">Needs follow-up</span>
                  <h2>Waiting</h2>
                </div>
                <strong>{waitingCases.length}</strong>
              </div>
              <p className="demo-column__hint">Cases that should stay visible until the promised outcome lands.</p>
              <div className="demo-column__stack">
                {waitingCases.map((item) => (
                  <CaseCard
                    key={item.id}
                    company={item.company}
                    provider={item.provider}
                    promise={item.promise}
                    summary={item.summary}
                    followUp={item.followUp}
                    status={item.status}
                    amount={item.amount}
                  />
                ))}
              </div>
            </section>

            <section className="demo-column">
              <div className="demo-column__header">
                <div>
                  <span className="demo-column__label">Saved, not urgent</span>
                  <h2>Promised</h2>
                </div>
                <strong>{promisedCases.length}</strong>
              </div>
              <p className="demo-column__hint">Cases with clean proof saved, but no immediate follow-up required.</p>
              <div className="demo-column__stack">
                {promisedCases.map((item) => (
                  <CaseCard
                    key={item.id}
                    company={item.company}
                    provider={item.provider}
                    promise={item.promise}
                    summary={item.summary}
                    followUp={item.followUp}
                    status={item.status}
                    amount={item.amount}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="demo-focus" id="focus">
            <section className="demo-panel">
              <div className="demo-panel__header">
                <span className="eyebrow">Focus queue</span>
                <h2>Next actions</h2>
              </div>
              <div className="demo-focus-list">
                {focusQueue.map((item) => (
                  <article key={item.id} className="demo-focus-item">
                    <div>
                      <strong>{item.company}</strong>
                      <p>{item.promise}</p>
                    </div>
                    <span>{item.followUp}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="demo-panel">
              <div className="demo-panel__header">
                <span className="eyebrow">Operator notes</span>
                <h2>What this screen should become</h2>
              </div>
              <ul className="demo-checklist">
                <li>Real cases from Supabase instead of static mock objects.</li>
                <li>One clean create-case flow from the web before extension sync.</li>
                <li>Proof attachments and transcript preview in the side panel.</li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
