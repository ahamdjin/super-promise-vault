'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { workspacesInfoContent } from '@/config/infoconfig';
import Link from 'next/link';

export default function WorkspacesPage() {
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>
            The original Kiranism template used Clerk Organizations here. Supabase auth is live
            now, and workspace management is the next data layer to wire in.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground max-w-2xl text-sm'>
            Your shell stays the same. This page is ready for the future multi-workspace model
            instead of sending you into a broken Clerk screen.
          </p>
          <Button asChild>
            <Link href='/dashboard/workspaces/team'>Open team settings</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
