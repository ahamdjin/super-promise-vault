import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthPanel } from '@/components/auth-buttons';
import { createClient } from '@/lib/supabase/server';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = nextParam?.startsWith('/') ? nextParam : '/demo';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__copy">
          <p className="eyebrow">Secure access</p>
          <h1>Sign in before the support trail goes cold.</h1>
          <p className="auth-copy">
            Use a direct email login or Google. Keep the auth entry simple, professional, and easy to trust.
          </p>
        </div>

        <div className="auth-card__surface">
          <div className="auth-card__meta">
            <span className="auth-card__meta-label">Current access</span>
            <strong>Google + email only</strong>
            <p>GitHub sign-in has been removed so the entry point stays focused and easier to manage.</p>
          </div>
          <AuthPanel nextPath={nextPath} />
        </div>

        <p className="auth-footnote">
          Supabase still needs the right provider and redirect settings in the dashboard, but the app-side login flow is ready.
        </p>
        <div className="auth-card__footer">
          <span>Protected route after auth: `/demo`</span>
          <span>Next build step: replace mock cases with live Supabase rows</span>
        </div>
        <Link href="/" className="button button--ghost auth-link">
          Back to product page
        </Link>
      </section>
    </main>
  );
}
