import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatarProfile } from '@/components/user-avatar-profile';

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

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center gap-4'>
          <UserAvatarProfile className='h-14 w-14 rounded-xl' user={profile} />
          <div className='space-y-1'>
            <p className='text-lg font-semibold'>
              {profile?.fullName || profile?.email || 'Support Promise Vault'}
            </p>
            <p className='text-muted-foreground text-sm'>{profile?.email || 'No email found'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
