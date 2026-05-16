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

  const waitingCount = mockCases.filter((item) => item.status === 'waiting').length;
  const promisedCount = mockCases.filter((item) => item.status === 'promised').length;

  return (
    <main className="demo-page">
      <section className="demo-hero">
        <div className="demo-hero__copy">
          <p className="eyebrow">Dashboard demo</p>
          <h1>Support promises in one place.</h1>
          <p>
            Supabase OAuth is live here now. The capture dashboard is still using mock cases until
            the database sync layer is connected.
          </p>
        </div>
        <SessionActions email={user.email ?? 'Signed in user'} />
        <div className="demo-hero__stats">
          <div>
            <strong>{mockCases.length}</strong>
            <span>open cases</span>
          </div>
          <div>
            <strong>{waitingCount}</strong>
            <span>follow-ups due this week</span>
          </div>
          <div>
            <strong>{promisedCount}</strong>
            <span>saved promises</span>
          </div>
        </div>
      </section>

      <section className="demo-board">
        <div className="demo-column">
          <div className="demo-column__header">
            <h2>Waiting</h2>
            <span>Needs a follow-up soon</span>
          </div>
          {mockCases
            .filter((item) => item.status === 'waiting')
            .map((item) => (
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

        <div className="demo-column">
          <div className="demo-column__header">
            <h2>Promised</h2>
            <span>Saved, but not due yet</span>
          </div>
          {mockCases
            .filter((item) => item.status === 'promised')
            .map((item) => (
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
    </main>
  );
}
