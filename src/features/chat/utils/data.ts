import type { Conversation } from './types';

export const initialConversations: Conversation[] = [
  {
    id: 'loom-refund',
    company: 'Loom',
    name: 'Alex from Billing Support',
    title: 'Duplicate Pro charge after annual renewal',
    caseId: 'LM-4821',
    sourceUrl: 'https://www.loom.com/help/billing',
    channel: 'chat',
    status: 'online',
    caseStatus: 'promised',
    priority: 'high',
    promisedOutcome: 'Refund for the duplicate annual renewal charge',
    amountLabel: '$96.00',
    followUpAt: 'May 20',
    nextAction: 'Check for the pending refund and follow up if no credit appears.',
    proofLabel: 'Refund promise and screenshot attached',
    caseAttachments: [
      {
        id: 'loom-proof-1',
        name: 'refund-confirmation.pdf',
        size: 182400,
        type: 'application/pdf',
        description: 'Refund confirmation shared by support'
      },
      {
        id: 'loom-proof-2',
        name: 'billing-screenshot.png',
        size: 224100,
        type: 'image/png',
        description: 'Screenshot of duplicate charge'
      }
    ],
    unread: 2,
    initials: 'LS',
    messages: [
      {
        id: 'loom-1',
        sender: 'contact',
        author: 'Alex',
        text: "I can confirm you were charged twice for the annual Pro renewal. I've already initiated a refund for the duplicate payment.",
        timestamp: '10:02'
      },
      {
        id: 'loom-2',
        sender: 'user',
        author: 'You',
        text: 'Thanks. How long should I wait before checking again?',
        timestamp: '10:05'
      },
      {
        id: 'loom-3',
        sender: 'contact',
        author: 'Alex',
        text: 'You should see the pending credit within 24 hours and the full refund can take 3 to 5 business days depending on your bank.',
        timestamp: '10:08'
      },
      {
        id: 'loom-4',
        sender: 'user',
        author: 'You',
        text: 'Understood. If the refund is still missing after May 20, I will follow up again and ask for the reference number.',
        timestamp: '10:11'
      }
    ],
    quickReplies: [
      'Please email me the refund confirmation too.',
      'Can you share the refund reference number?',
      'I will check again tomorrow and follow up if needed.'
    ]
  },
  {
    id: 'apollo-trial',
    company: 'Apollo',
    name: 'Priya from Customer Success',
    title: 'Free trial converted before intended cancellation',
    caseId: 'AP-2240',
    sourceUrl: 'https://www.apollo.io/support',
    channel: 'email',
    status: 'online',
    caseStatus: 'follow-up-due',
    priority: 'high',
    promisedOutcome: 'Manual review for a courtesy refund and account downgrade',
    amountLabel: '$99.00',
    followUpAt: 'Today',
    nextAction: 'Send follow-up note referencing the trial cancellation timing.',
    proofLabel: 'Email thread and cancellation timing note saved',
    caseAttachments: [
      {
        id: 'apollo-proof-1',
        name: 'trial-conversion-email.eml',
        size: 98304,
        type: 'message/rfc822',
        description: 'Billing conversion email'
      },
      {
        id: 'apollo-proof-2',
        name: 'cancel-attempt.png',
        size: 197632,
        type: 'image/png',
        description: 'Cancellation attempt timing screenshot'
      }
    ],
    unread: 0,
    initials: 'AC',
    messages: [
      {
        id: 'apollo-1',
        sender: 'user',
        author: 'You',
        text: 'My trial converted before I expected and I had already intended to cancel. Can this charge be reversed?',
        timestamp: '09:15'
      },
      {
        id: 'apollo-2',
        sender: 'contact',
        author: 'Priya',
        text: 'I cannot guarantee it yet, but I have sent this to billing for a manual courtesy review. I expect an answer within one business day.',
        timestamp: '09:18'
      },
      {
        id: 'apollo-3',
        sender: 'user',
        author: 'You',
        text: 'Following up today if billing still has not answered. I can resend the cancellation screenshot if needed.',
        timestamp: '09:20'
      }
    ],
    quickReplies: [
      'Following up on the billing review from yesterday.',
      'Can you confirm whether billing approved the courtesy refund?',
      'I can send the cancellation screenshot again if needed.'
    ]
  },
  {
    id: 'notion-security',
    company: 'Notion',
    name: 'Jordan from Security',
    title: 'Unrecognized login and session lock',
    caseId: 'NT-9031',
    sourceUrl: 'https://www.notion.so/help',
    channel: 'chat',
    status: 'offline',
    caseStatus: 'resolved',
    priority: 'medium',
    promisedOutcome: 'Revoke unknown session and enable extra account protection',
    amountLabel: 'No charge',
    followUpAt: 'Closed',
    nextAction: 'No follow-up needed unless another unknown login alert appears.',
    proofLabel: 'Security confirmation captured',
    caseAttachments: [
      {
        id: 'notion-proof-1',
        name: 'security-confirmation.txt',
        size: 1200,
        type: 'text/plain',
        description: 'Confirmation note from security agent'
      }
    ],
    unread: 1,
    initials: 'NS',
    messages: [
      {
        id: 'notion-1',
        sender: 'contact',
        author: 'Jordan',
        text: 'We noticed a login attempt from an unrecognized device in São Paulo and temporarily locked the session.',
        timestamp: 'Yesterday'
      },
      {
        id: 'notion-2',
        sender: 'user',
        author: 'You',
        text: "That wasn't me. Please revoke that session and secure the account.",
        timestamp: 'Yesterday'
      },
      {
        id: 'notion-3',
        sender: 'contact',
        author: 'Jordan',
        text: 'Done. We revoked every unknown session and enabled extra account verification on the next login.',
        timestamp: 'Yesterday'
      },
      {
        id: 'notion-4',
        sender: 'user',
        author: 'You',
        text: 'Thanks. I will keep this confirmation in case the login alert happens again.',
        timestamp: 'Yesterday'
      }
    ],
    quickReplies: [
      'Thanks, that resolves it.',
      'Can you also send a confirmation email?',
      'Please confirm whether any data was accessed.'
    ]
  }
];
