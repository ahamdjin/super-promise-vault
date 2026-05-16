'use client';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation, SupportCasePriority, SupportCaseStatus } from '../utils/types';

const statusDotColor = {
  online: 'bg-green-500',
  offline: 'bg-red-500'
} as const;

interface ChatHeaderProps {
  conversation: Conversation;
}

const caseStatusCopy: Record<SupportCaseStatus, string> = {
  promised: 'Promise Captured',
  'follow-up-due': 'Follow-up Due',
  'awaiting-user': 'Waiting on You',
  resolved: 'Resolved'
};

const priorityTone: Record<SupportCasePriority, string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority'
};

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <header className='flex flex-wrap items-center justify-between gap-3 sm:gap-4'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <div className='relative'>
          <Avatar className='border-border/40 bg-card/80 text-foreground h-10 w-10 rounded-2xl border sm:h-12 sm:w-12 sm:rounded-3xl'>
            <AvatarFallback className='bg-primary/20 text-primary rounded-2xl text-sm font-semibold sm:rounded-3xl sm:text-base'>
              {conversation.initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'border-background absolute right-0 bottom-0 inline-flex h-3 w-3 rounded-full border-2 sm:h-3.5 sm:w-3.5',
              statusDotColor[conversation.status]
            )}
            aria-label={conversation.status === 'online' ? 'Online' : 'Offline'}
          />
        </div>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-foreground text-sm font-semibold sm:text-base'>{conversation.company}</p>
            <Badge variant='outline'>{conversation.caseId}</Badge>
            <Badge variant='secondary'>{caseStatusCopy[conversation.caseStatus]}</Badge>
          </div>
          <p className='text-muted-foreground text-xs sm:text-sm'>{conversation.title}</p>
          <p className='text-muted-foreground text-[0.7rem] sm:text-xs'>
            {conversation.name} • {conversation.channel} • {priorityTone[conversation.priority]}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-1.5 sm:gap-2'>
        <Button
          asChild
          variant='outline'
          size='sm'
          className='gap-2'
        >
          <a href={conversation.sourceUrl} target='_blank' rel='noreferrer'>
            <Icons.externalLink className='size-4' />
            Source
          </a>
        </Button>
      </div>
    </header>
  );
}
