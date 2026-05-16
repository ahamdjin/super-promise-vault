'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { teamInfoContent } from '@/config/infoconfig';

export default function TeamPage() {
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Workspace team settings</CardTitle>
          <CardDescription>
            This section used Clerk&apos;s organization profile widget in the original starter.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground space-y-3 text-sm'>
          <p>
            The UI shell is preserved, but the organization backend has not been rebuilt on top of
            Supabase yet.
          </p>
          <p>
            When we wire the workspace layer, this page is where member invites, roles, and access
            rules will plug back in.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
