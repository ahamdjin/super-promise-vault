import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthButtons } from '@/components/auth-buttons';
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
        <p className="eyebrow">Supabase OAuth</p>
        <h1>Sign in before the support promise disappears.</h1>
        <p className="auth-copy">
          The web app uses Supabase Auth for OAuth instead of a custom login system. Start with Google
          or GitHub, then the extension can hand cases into your dashboard flow.
        </p>
        <AuthButtons nextPath={nextPath} />
        <p className="auth-footnote">
          First setup still needs your Supabase provider keys and redirect URLs in the Supabase dashboard.
        </p>
        <Link href="/" className="button button--ghost auth-link">
          Back to product page
        </Link>
      </section>
    </main>
  );
}
