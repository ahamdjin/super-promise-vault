import Link from 'next/link';
import { CaseCard } from '@/components/case-card';
import { mockCases } from '@/lib/mock-cases';

const features = [
  'Detect supported chat widgets before the user closes the tab.',
  'Capture visible transcript context plus a screenshot fallback.',
  'Turn a disappearing support promise into a tracked follow-up case.',
];

export default function Home() {
  return (
    <main className="marketing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Narrow and strong</p>
          <h1>Support promises are easy to make and easy to lose.</h1>
          <p className="hero-body">
            Support Promise Vault is an extension-first workflow for saving the moment support says
            &quot;we&apos;ll refund that,&quot; &quot;we&apos;ll replace it,&quot; or &quot;wait 48 hours.&quot;
          </p>
          <div className="hero-actions">
            <Link href="/demo" className="button button--primary">
              Open protected dashboard
            </Link>
            <Link href="/login" className="button button--ghost">
              Sign in with Supabase OAuth
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel__header">
            <span className="status-pill status-pill--waiting">ready</span>
            <span>Zendesk, Intercom, Help Scout, Gorgias</span>
          </div>
          <h2>Capture the promise before the proof disappears.</h2>
          <p>
            The extension detects known providers, captures visible chat context, and preserves the
            screenshot fallback when extraction is messy.
          </p>
          <ul className="feature-list">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-grid" id="how-it-works">
        <div className="section-intro">
          <p className="eyebrow">Capture flow</p>
          <h2>One click to preserve the conversation, not just the memory of it.</h2>
        </div>
        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Detect the provider</h3>
            <p>The extension checks the page for supported widget signatures and marks the page ready.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Capture the visible proof</h3>
            <p>We save URL, domain, title, visible transcript when possible, and a screenshot fallback every time.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Track the next move</h3>
            <p>The promise becomes a real case with follow-up timing, amount, and escalation-ready notes.</p>
          </article>
        </div>
      </section>

      <section className="section-grid">
        <div className="section-intro">
          <p className="eyebrow">Case preview</p>
          <h2>The dashboard is for proof, timing, and follow-up.</h2>
        </div>
        <div className="cases-preview">
          {mockCases.map((item) => (
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
