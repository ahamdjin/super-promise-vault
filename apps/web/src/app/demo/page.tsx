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
          <p>Auth is live. This screen is the operator shell we will connect to live support cases next.</p>
        </div>
      </aside>

      <section className="demo-workspace">
        <header className="demo-topbar" id="overview">
          <div className="demo-topbar__copy">
            <p className="eyebrow">Overview</p>
            <h1>Track the promises that are easiest for support teams to forget.</h1>
            <p>
              The job of this screen is simple: hold proof, show urgency, and keep the next follow-up obvious.
            </p>
          </div>
          <SessionActions email={user.email ?? 'Signed in user'} />
        </header>

        <section className="demo-overview">
          <article>
            <span>Open cases</span>
            <strong>{mockCases.length}</strong>
            <p>Saved promises that still need verification, refund confirmation, or escalation.</p>
          </article>
          <article>
            <span>Due soon</span>
            <strong>{waitingCount}</strong>
            <p>Follow-ups that should stay visible before the support trail goes cold.</p>
          </article>
          <article>
            <span>Stable</span>
            <strong>{promisedCount}</strong>
            <p>Cases with proof saved already, but not urgent enough to lead the queue.</p>
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
            <strong>Mock cases for layout validation</strong>
          </div>
          <div>
            <span className="demo-status-strip__label">Next build step</span>
            <strong>Supabase read + create-case flow</strong>
          </div>
        </section>

        <section className="demo-grid" id="board">
          <section className="demo-board-panel">
            <div className="demo-board-panel__header">
              <div>
                <span className="demo-column__label">Primary queue</span>
                <h2>Active cases</h2>
              </div>
              <div className="demo-board-panel__filters">
                <span className="demo-filter demo-filter--active">All</span>
                <span className="demo-filter">Waiting</span>
                <span className="demo-filter">Promised</span>
              </div>
            </div>
            <p className="demo-column__hint">
              A cleaner operator view than stacked cards: scan company, promise, amount, due date, and state in one pass.
            </p>
            <CaseList items={focusQueue} />
          </section>

          <aside className="demo-focus" id="focus">
            <section className="demo-panel">
              <div className="demo-panel__header">
                <span className="eyebrow">Case spotlight</span>
                <h2>Focus item</h2>
              </div>
              <div className="demo-focus-card">
                <span className="case-list__chip">{primaryCase.provider}</span>
                <h3>{primaryCase.company}</h3>
                <p>{primaryCase.promise}</p>
                <div className="demo-focus-card__grid">
                  <div>
                    <span>Amount</span>
                    <strong>{primaryCase.amount}</strong>
                  </div>
                  <div>
                    <span>Follow up</span>
                    <strong>{primaryCase.followUp}</strong>
                  </div>
                </div>
                <div className="demo-focus-card__story">
                  <span>Saved note</span>
                  <p>{primaryCase.summary}</p>
                </div>
              </div>
            </section>

            <section className="demo-panel">
              <div className="demo-panel__header">
                <span className="eyebrow">Upcoming</span>
                <h2>Next actions</h2>
              </div>
              <div className="demo-focus-list">
                {waitingCases.map((item) => (
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
                <span className="eyebrow">Build queue</span>
                <h2>Next product step</h2>
              </div>
              <ul className="demo-checklist">
                <li>Read real cases from Supabase instead of static mock rows.</li>
                <li>Create one deliberate case-create flow before extension sync.</li>
                <li>Use this right rail for transcript proof and follow-up history.</li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
