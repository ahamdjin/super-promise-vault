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
        <div className="auth-card__surface">
          <div className="auth-brand-panel">
            <div className="auth-brand-panel__header">
              <span className="auth-brand-panel__mark">SPV</span>
              <div>
                <p>Support Promise Vault</p>
                <span>Operator access</span>
              </div>
            </div>

            <div className="auth-brand-panel__copy">
              <p className="eyebrow">Secure access</p>
              <h1>Sign in before the support trail goes cold.</h1>
              <p className="auth-copy">
                Use direct email access or Google. The entry point stays focused, simple, and professional.
              </p>
            </div>

            <div className="auth-brand-panel__quote">
              <p>
                “The screen should tell me what was promised, what is still unresolved, and what needs action
                next.”
              </p>
              <span>Operator requirement</span>
            </div>

            <div className="auth-brand-panel__footer">
              <div>
                <span className="auth-card__meta-label">Current access</span>
                <strong>Google + email only</strong>
              </div>
              <p>GitHub sign-in is removed so the auth surface stays tighter and easier to trust.</p>
            </div>
          </div>

          <div className="auth-form-shell">
            <div className="auth-form-shell__header">
              <span className="auth-card__meta-label">Protected route</span>
              <strong>Next after sign-in: {nextPath}</strong>
            </div>
            <AuthPanel nextPath={nextPath} />
          </div>
        </div>

        <p className="auth-footnote">
          Supabase still needs the right provider and redirect settings in the dashboard, but the app-side flow is ready.
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
