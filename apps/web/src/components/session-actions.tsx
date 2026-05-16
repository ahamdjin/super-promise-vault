'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type SessionActionsProps = {
  email: string;
};

export function SessionActions({ email }: SessionActionsProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push('/');
      router.refresh();
      return;
    }

    setIsSigningOut(false);
  }

  return (
    <div className="session-actions">
      <div className="session-actions__identity">
        <span className="session-actions__label">Signed in</span>
        <strong>{email}</strong>
      </div>
      <button type="button" className="button button--ghost" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}
