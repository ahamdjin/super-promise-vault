'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Provider = 'google' | 'github';

type AuthButtonsProps = {
  nextPath?: string;
};

const providers: Array<{ id: Provider; label: string }> = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
];

export function AuthButtons({ nextPath = '/demo' }: AuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithProvider(provider: Provider) {
    setPendingProvider(provider);
    setErrorMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      setPendingProvider(null);
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="auth-actions">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="button button--primary auth-button"
          onClick={() => signInWithProvider(provider.id)}
          disabled={pendingProvider !== null}
        >
          {pendingProvider === provider.id ? 'Redirecting...' : provider.label}
        </button>
      ))}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
    </div>
  );
}
