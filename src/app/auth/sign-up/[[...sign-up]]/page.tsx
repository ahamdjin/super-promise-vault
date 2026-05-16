import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard/overview');
  }

  let stars = 3000; // Default value

  try {
    const response = await fetch(
      'https://api.github.com/repos/ahamdjin/super-promise-vault',
      {
        next: { revalidate: 86400 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count || stars; // Update stars if API response is valid
    }
  } catch {
    // Error fetching GitHub stars, using default value
  }
  return <SignUpViewPage stars={stars} />;
}
