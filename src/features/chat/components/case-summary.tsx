'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { Conversation, SupportCasePriority, SupportCaseStatus } from '../utils/types';

const caseStatusCopy: Record<SupportCaseStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> =
  {
    promised: { label: 'Promise Captured', variant: 'default' },
    'follow-up-due': { label: 'Follow-up Due', variant: 'secondary' },
    'awaiting-user': { label: 'Waiting on You', variant: 'outline' },
    resolved: { label: 'Resolved', variant: 'outline' }
  };

const priorityCopy: Record<SupportCasePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

interface CaseSummaryProps {
  conversation: Conversation;
}

export function CaseSummary({ conversation }: CaseSummaryProps) {
  const caseStatus = caseStatusCopy[conversation.caseStatus];

  return (
    <Card className='border-border/40 bg-background/60 shadow-none'>
      <CardContent className='grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Icons.badgeCheck className='text-primary size-4' />
            <p className='text-sm font-medium'>Promised outcome</p>
          </div>
          <p className='text-sm leading-6'>{conversation.promisedOutcome}</p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Icons.creditCard className='text-primary size-4' />
            <p className='text-sm font-medium'>Amount / value</p>
          </div>
          <p className='text-sm leading-6'>{conversation.amountLabel}</p>
          <Badge variant={caseStatus.variant}>{caseStatus.label}</Badge>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Icons.calendar className='text-primary size-4' />
            <p className='text-sm font-medium'>Follow-up date</p>
          </div>
          <p className='text-sm leading-6'>{conversation.followUpAt}</p>
          <p className='text-muted-foreground text-xs'>{conversation.nextAction}</p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Icons.paperclip className='text-primary size-4' />
            <p className='text-sm font-medium'>Proof saved</p>
          </div>
          <p className='text-sm leading-6'>{conversation.proofLabel}</p>
          <p className='text-muted-foreground text-xs'>Priority: {priorityCopy[conversation.priority]}</p>
        </div>
      </CardContent>
    </Card>
  );
}
