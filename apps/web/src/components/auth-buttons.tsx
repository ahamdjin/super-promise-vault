'use client';

import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthPanelProps = {
  nextPath?: string;
};

type AuthMode = 'sign-in' | 'create-account';

export function AuthPanel({ nextPath = '/demo' }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const modeCopy = useMemo(() => {
    if (mode === 'create-account') {
      return {
        title: 'Create your account',
        submitLabel: 'Create account',
        helper:
          'Use email for a direct account, or continue with Google if you want the fastest sign-in path.',
      };
    }

    return {
      title: 'Continue with email',
      submitLabel: 'Sign in',
      helper: 'Use your email and password, or continue with Google if that is how you prefer to log in.',
    };
  }, [mode]);

  async function signInWithGoogle() {
    setIsGooglePending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      setIsGooglePending(false);
      setErrorMessage(error.message);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createClient();

    if (mode === 'create-account') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        setIsSubmitting(false);
        setErrorMessage(error.message);
        return;
      }

      setIsSubmitting(false);
      setSuccessMessage('Account created. Check your email if confirmation is required, then come back and sign in.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    window.location.assign(nextPath);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{modeCopy.title}</h2>
        <p className="text-sm leading-6 text-slate-500">{modeCopy.helper}</p>
      </div>

      <button
        type="button"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={signInWithGoogle}
        disabled={isSubmitting || isGooglePending}
      >
        {isGooglePending ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 font-medium tracking-[0.16em] text-slate-400">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === 'create-account' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a secure password"
            minLength={8}
            required
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
          />
        </label>

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isGooglePending}
        >
          {isSubmitting ? 'Working...' : modeCopy.submitLabel}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>{mode === 'create-account' ? 'Already have an account?' : 'Need an account?'}</span>
          <button
            type="button"
            className="font-medium text-slate-950 underline underline-offset-4"
            onClick={() => {
              setMode(mode === 'create-account' ? 'sign-in' : 'create-account');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            {mode === 'create-account' ? 'Sign in instead' : 'Create one'}
          </button>
        </div>
      </form>

      {errorMessage ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
