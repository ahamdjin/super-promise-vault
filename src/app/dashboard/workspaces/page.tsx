import PageContainer from '@/components/layout/page-container';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { workspacesInfoContent } from '@/config/infoconfig';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default async function WorkspacesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const ownerName =
    (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user?.user_metadata?.name === 'string' && user.user_metadata.name) ||
    user?.email ||
    'Workspace Owner';

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <div className='space-y-3'>
        <Link href='/dashboard/workspaces/team' className='block'>
          <Card className='transition-colors hover:bg-accent/50'>
            <CardContent className='flex items-center justify-between gap-4 p-4'>
              <div className='flex items-center gap-4'>
                <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-xl'>
                  <Icons.workspace className='size-5' />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-lg font-semibold'>Personal Workspace</p>
                    <Badge variant='outline'>Owner</Badge>
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    {ownerName} • 1 member • Active workspace
                  </p>
                </div>
              </div>
              <Button variant='outline' asChild>
                <span>Manage</span>
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle>Create organization</CardTitle>
            <CardDescription>
              The original version used Clerk Organizations here. The UI is ready; the multi-workspace
              data model is the next backend slice to wire on top of Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-muted-foreground max-w-2xl text-sm'>
              Right now every signed-in user gets one personal workspace surface. Multi-workspace
              creation, switching, and member invites are the next real backend step.
            </p>
            <Button disabled>Create organization</Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
