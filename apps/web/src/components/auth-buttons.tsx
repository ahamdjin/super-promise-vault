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
    <div className="auth-panel">
      <div className="auth-panel__intro">
        <h2>{modeCopy.title}</h2>
        <p>{modeCopy.helper}</p>
      </div>

      <form className="auth-form" onSubmit={handleEmailSubmit}>
        <label className="auth-field">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === 'create-account' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a secure password"
            minLength={8}
            required
          />
        </label>

        <button
          type="submit"
          className="button button--primary auth-button"
          disabled={isSubmitting || isGooglePending}
        >
          {isSubmitting ? 'Working...' : modeCopy.submitLabel}
        </button>

        <div className="auth-panel__switch">
          <span>{mode === 'create-account' ? 'Already have an account?' : 'Need an account?'}</span>
          <button
            type="button"
            className="auth-inline-button"
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

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="button button--ghost auth-button auth-button--google"
        onClick={signInWithGoogle}
        disabled={isSubmitting || isGooglePending}
      >
        {isGooglePending ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
      {successMessage ? <p className="auth-success">{successMessage}</p> : null}
    </div>
  );
}
