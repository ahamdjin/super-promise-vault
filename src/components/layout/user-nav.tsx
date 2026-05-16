'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export function UserNav() {
  const [user, setUser] = useState<{
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user;
      if (!currentUser?.email) {
        setUser(null);
        return;
      }

      setUser({
        email: currentUser.email,
        fullName:
          (typeof currentUser.user_metadata?.full_name === 'string' &&
            currentUser.user_metadata.full_name) ||
          (typeof currentUser.user_metadata?.name === 'string' && currentUser.user_metadata.name) ||
          null,
        avatarUrl:
          (typeof currentUser.user_metadata?.avatar_url === 'string' &&
            currentUser.user_metadata.avatar_url) ||
          (typeof currentUser.user_metadata?.picture === 'string' &&
            currentUser.user_metadata.picture) ||
          null
      });
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/auth/sign-in');
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <UserAvatarProfile user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' sideOffset={10} forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>{user.fullName}</p>
              <p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
