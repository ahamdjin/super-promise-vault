import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Auth error</p>
        <h1>The OAuth callback did not finish cleanly.</h1>
        <p className="auth-copy">
          Check that your Supabase redirect allow list includes this app URL, then try the login flow
          again.
        </p>
        <div className="hero-actions">
          <Link href="/login" className="button button--primary">
            Try sign in again
          </Link>
          <Link href="/" className="button button--ghost">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
