export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
};

export type Message = {
  id: string;
  sender: 'user' | 'contact';
  author: string;
  text: string;
  timestamp: string;
  attachments?: Attachment[];
};

export type ContactStatus = 'online' | 'offline';
export type SupportCaseStatus = 'promised' | 'follow-up-due' | 'awaiting-user' | 'resolved';
export type SupportCasePriority = 'low' | 'medium' | 'high';

export type Conversation = {
  id: string;
  company: string;
  name: string;
  title: string;
  caseId: string;
  sourceUrl: string;
  channel: 'chat' | 'email' | 'web-form';
  status: ContactStatus;
  caseStatus: SupportCaseStatus;
  priority: SupportCasePriority;
  promisedOutcome: string;
  amountLabel: string;
  followUpAt: string;
  nextAction: string;
  proofLabel: string;
  caseAttachments: Attachment[];
  unread: number;
  initials: string;
  messages: Message[];
  quickReplies: string[];
};
