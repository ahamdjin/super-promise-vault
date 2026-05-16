'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { FilePreview } from '@/components/ui/file-preview';
import { Icons } from '@/components/icons';
import type { Conversation, SupportCasePriority, SupportCaseStatus } from '../utils/types';

const stageOrder: SupportCaseStatus[] = ['promised', 'follow-up-due', 'awaiting-user', 'resolved'];

const caseStatusCopy: Record<SupportCaseStatus, string> = {
  promised: 'Promise Captured',
  'follow-up-due': 'Follow-up Due',
  'awaiting-user': 'Waiting on You',
  resolved: 'Resolved'
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
  const attachmentFiles = useMemo(
    () =>
      conversation.caseAttachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        description: attachment.description
      })),
    [conversation.caseAttachments]
  );

  return (
    <div className='border-border/40 bg-background/60 rounded-2xl border px-4 py-3'>
      <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <Badge variant='secondary'>{caseStatusCopy[conversation.caseStatus]}</Badge>
          <span className='text-muted-foreground'>Amount: {conversation.amountLabel}</span>
          <span className='text-muted-foreground'>Follow-up: {conversation.followUpAt}</span>
          <span className='text-muted-foreground'>Priority: {priorityCopy[conversation.priority]}</span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline'>{conversation.channel}</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <Icons.paperclip className='size-4' />
                Attachments
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Case attachments</DialogTitle>
                <DialogDescription>
                  Proof files, screenshots, and saved evidence for {conversation.company}.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <FilePreview files={attachmentFiles} />
                <div className='grid gap-3'>
                  {conversation.caseAttachments.map((attachment) => (
                    <div key={attachment.id} className='rounded-xl border p-3'>
                      <p className='text-sm font-medium'>{attachment.name}</p>
                      <p className='text-muted-foreground text-xs'>
                        {attachment.description || 'Saved case proof'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]'>
        <div className='rounded-xl border p-3'>
          <div className='flex items-center gap-2'>
            <Icons.badgeCheck className='text-primary size-4' />
            <p className='text-sm font-medium'>Promised outcome</p>
          </div>
          <p className='mt-2 text-sm leading-6'>{conversation.promisedOutcome}</p>
          <p className='text-muted-foreground mt-2 text-xs'>{conversation.nextAction}</p>
        </div>

        <div className='rounded-xl border p-3'>
          <div className='flex items-center gap-2'>
            <Icons.kanban className='text-primary size-4' />
            <p className='text-sm font-medium'>Case stage</p>
          </div>
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {stageOrder.map((stage) => {
              const isActive = stage === conversation.caseStatus;
              return (
                <div
                  key={stage}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    isActive ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {caseStatusCopy[stage]}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
