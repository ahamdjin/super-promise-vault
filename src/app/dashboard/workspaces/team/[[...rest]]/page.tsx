import PageContainer from '@/components/layout/page-container';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { teamInfoContent } from '@/config/infoconfig';

export default async function TeamPage() {
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
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <Tabs defaultValue='members' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='members'>Members</TabsTrigger>
          <TabsTrigger value='roles'>Roles</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='general'>General</TabsTrigger>
        </TabsList>

        <TabsContent value='members'>
          <Card>
            <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle>Workspace members</CardTitle>
                <CardDescription>
                  Multi-member invites are the next backend slice. The current workspace owner is
                  shown below.
                </CardDescription>
              </div>
              <Button disabled>Invite member</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>{ownerName}</div>
                        <div className='text-muted-foreground text-xs'>{user?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>Owner</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>Active</Badge>
                    </TableCell>
                    <TableCell className='text-right text-sm'>Full access</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='roles'>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle>Owner</CardTitle>
                <CardDescription>Full workspace control.</CardDescription>
              </CardHeader>
              <CardContent className='text-muted-foreground text-sm'>
                Can manage members, billing, security, and every app surface.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Admin</CardTitle>
                <CardDescription>Operational management access.</CardDescription>
              </CardHeader>
              <CardContent className='text-muted-foreground text-sm'>
                Good for future operators who need app access without ownership.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Member</CardTitle>
                <CardDescription>Standard workspace access.</CardDescription>
              </CardHeader>
              <CardContent className='text-muted-foreground text-sm'>
                Can work inside the app once the membership model is wired in.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='security'>
          <Card>
            <CardHeader>
              <CardTitle>Security settings</CardTitle>
              <CardDescription>
                Workspace-level security controls will live here once organization data is backed
                by Supabase tables.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='flex items-center justify-between rounded-xl border p-4'>
                <div>
                  <p className='font-medium'>Require approved invites</p>
                  <p className='text-muted-foreground text-sm'>
                    Disabled until multi-member invites are live.
                  </p>
                </div>
                <Switch checked={false} disabled />
              </div>
              <div className='flex items-center justify-between rounded-xl border p-4'>
                <div>
                  <p className='font-medium'>Restrict domain access</p>
                  <p className='text-muted-foreground text-sm'>
                    Add domain-level membership controls in the next backend slice.
                  </p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='general'>
          <Card>
            <CardHeader>
              <CardTitle>General settings</CardTitle>
              <CardDescription>
                Workspace metadata will save here once the organization table is created.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-5 md:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='workspace-name'>Workspace name</Label>
                <Input id='workspace-name' value='Personal Workspace' disabled readOnly />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='workspace-slug'>Workspace slug</Label>
                <Input id='workspace-slug' value='personal-workspace' disabled readOnly />
              </div>
              <div className='md:col-span-2 flex justify-end'>
                <Button disabled>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
