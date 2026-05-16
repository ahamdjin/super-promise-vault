import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SignInViewPage from '@/features/auth/components/sign-in-view';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard/overview');
  }

  return <SignInViewPage />;
}
