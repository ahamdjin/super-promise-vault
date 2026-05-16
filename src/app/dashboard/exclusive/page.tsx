'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ExclusivePage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <Alert>
          <Icons.lock className='h-5 w-5 text-yellow-600' />
          <AlertDescription>
            The original starter gated this page behind Clerk Billing&apos;s Pro plan. We kept the
            page in place so the exact shell stays intact while your own plan system is wired in.
          </AlertDescription>
        </Alert>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <Icons.badgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area
          </h1>
          <p className='text-muted-foreground'>
            Upgrade handling will plug in here once billing is connected through{' '}
            <Link className='underline' href='/dashboard/billing'>
              Billing &amp; Plans
            </Link>
            .
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pro feature slot</CardTitle>
            <CardDescription>
              This keeps the original route and layout in place without the old Clerk plan guard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-lg'>Have a wonderful day!</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
