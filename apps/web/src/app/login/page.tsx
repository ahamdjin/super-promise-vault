import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthPanel } from '@/components/auth-buttons';
import { InteractiveGridPattern } from '@/components/interactive-grid-pattern';
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute top-4 right-4 hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur md:top-8 md:right-8 md:inline-flex"
      >
        Back home
      </Link>

      <section className="relative hidden h-full flex-col overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="relative z-20 flex items-center text-lg font-medium text-white">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold tracking-[0.18em]">
            SPV
          </div>
          Support Promise Vault
        </div>

        <InteractiveGridPattern
          className="mask-[radial-gradient(520px_circle_at_center,white,transparent)] inset-x-0 inset-y-[0%] h-full skew-y-12"
        />

        <div className="relative z-20 mt-20 max-w-lg space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">Secure access</p>
          <h1 className="font-serif text-5xl leading-[0.95] text-white">
            Sign in before the support trail goes cold.
          </h1>
          <p className="max-w-md text-base leading-7 text-slate-300">
            Google plus email access only. Keep the operator entry clean, direct, and easy to trust.
          </p>
        </div>

        <div className="relative z-20 mt-auto max-w-md space-y-3 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg leading-8">
              “The screen should tell me what was promised, what is unresolved, and what needs action next.”
            </p>
            <footer className="text-sm text-slate-400">Operator requirement</footer>
          </blockquote>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Protected route</p>
            <p className="mt-2 text-sm text-slate-200">Next after sign-in: {nextPath}</p>
          </div>
        </div>
      </section>

      <section className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6">
          <div className="w-full rounded-[28px] border border-slate-200 bg-white/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <AuthPanel nextPath={nextPath} />
          </div>
          <div className="space-y-2 px-8 text-center text-xs text-slate-500">
            <p>App-side auth is powered by Supabase and limited to Google plus email access.</p>
            <p>
              By continuing, you agree to our{' '}
              <span className="underline underline-offset-4">Terms of Service</span> and{' '}
              <span className="underline underline-offset-4">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
