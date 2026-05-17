'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserAvatarProfile, type SidebarUserProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProfileSettingsPanelProps = {
  profile: SidebarUserProfile | null;
  providers: string[];
  createdAt?: string | null;
};

export function ProfileSettingsPanel({
  profile,
  providers,
  createdAt
}: ProfileSettingsPanelProps) {
  const [displayName, setDisplayName] = useState(profile?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const formattedCreatedAt = useMemo(() => {
    if (!createdAt) {
      return 'Recently created';
    }

    const value = new Date(createdAt);
    if (Number.isNaN(value.getTime())) {
      return 'Recently created';
    }

    return value.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [createdAt]);

  async function handleSave() {
    setIsSaving(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        name: displayName
      }
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
      setIsSaving(false);
      return;
    }

    setStatus({ type: 'success', message: 'Profile updated successfully.' });
    setIsSaving(false);
  }

  return (
    <Tabs defaultValue='profile' className='space-y-6'>
      <TabsList>
        <TabsTrigger value='profile'>Profile</TabsTrigger>
        <TabsTrigger value='security'>Security</TabsTrigger>
      </TabsList>

      <TabsContent value='profile' className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              Keep your account details current so the workspace footer and operator surfaces stay
              accurate.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <UserAvatarProfile className='h-16 w-16 rounded-xl' user={profile} />
                <div className='space-y-1'>
                  <p className='text-lg font-semibold'>
                    {profile?.fullName || profile?.email || 'Support Promise Vault'}
                  </p>
                  <p className='text-muted-foreground text-sm'>{profile?.email || 'No email found'}</p>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {providers.map((provider) => (
                  <Badge key={provider} variant='outline' className='capitalize'>
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='display-name'>Display name</Label>
                <Input
                  id='display-name'
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder='Enter your name'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email-address'>Email address</Label>
                <Input id='email-address' value={profile?.email || ''} readOnly disabled />
              </div>
            </div>

            {status ? (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  status.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <div className='flex justify-end'>
              <Button onClick={handleSave} isLoading={isSaving}>
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='security' className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Authentication status</CardTitle>
            <CardDescription>
              Your current account is protected by Supabase authentication and the providers shown
              below.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-xl border p-4'>
              <p className='text-sm font-medium'>Signed in with</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {providers.map((provider) => (
                  <Badge key={provider} variant='secondary' className='capitalize'>
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>
            <div className='rounded-xl border p-4'>
              <p className='text-sm font-medium'>Account created</p>
              <p className='text-muted-foreground mt-3 text-sm'>{formattedCreatedAt}</p>
            </div>
            <div className='rounded-xl border p-4'>
              <p className='text-sm font-medium'>Password management</p>
              <p className='text-muted-foreground mt-3 text-sm'>
                Email and Google sign-in are both active. Password reset flows can be handled
                through the Supabase auth settings when needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
