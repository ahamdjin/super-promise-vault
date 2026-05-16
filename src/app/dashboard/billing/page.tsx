'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';

export default function BillingPage() {
  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription='Manage your subscription and usage limits for your workspace'
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Billing is not wired yet on top of Supabase. The exact dashboard shell stays intact
            while we replace the original Clerk billing dependency with your own billing system.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your workspace&apos;s needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground max-w-3xl text-sm leading-6'>
              This page is ready for a Stripe, Polar, or custom billing integration. Right now it
              is a safe placeholder instead of a broken Clerk pricing table.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
