import { createClient } from '@/lib/supabase/server';
import { ProfileSettingsPanel } from './profile-settings-panel';

export default async function ProfileViewPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = user?.email
    ? {
        email: user.email,
        fullName:
          (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
          (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
          null,
        avatarUrl:
          (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
          (typeof user.user_metadata?.picture === 'string' && user.user_metadata.picture) ||
          null
      }
    : null;

  const providers = Array.from(
    new Set(
      [
        ...(Array.isArray(user?.app_metadata?.providers) ? user?.app_metadata?.providers : []),
        ...(Array.isArray(user?.identities)
          ? user.identities
              .map((identity) =>
                typeof identity.provider === 'string' ? identity.provider : null
              )
              .filter((provider): provider is string => provider !== null)
          : [])
      ].filter((provider): provider is string => typeof provider === 'string' && provider.length > 0)
    )
  );

  return (
    <div className='flex w-full flex-col p-4'>
      <ProfileSettingsPanel
        profile={profile}
        providers={providers.length > 0 ? providers : ['email']}
        createdAt={user?.created_at || null}
      />
    </div>
  );
}
