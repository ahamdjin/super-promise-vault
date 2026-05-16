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
        sender: 'internal',
        author: 'Case note',
        text: 'Promise captured. If refund is still missing after May 20, ask for confirmation receipt and bank reference.',
        timestamp: '10:11'
      }
    ],
    quickReplies: [
      'Please email me the refund confirmation too.',
      'Can you share the refund reference number?',
      'I will check again tomorrow and follow up if needed.'
    ],
    autoReplies: [
      "Absolutely — I've emailed the refund confirmation to your account.",
      'The refund reference number is RF-99213. Keep it in case you need to contact your bank.',
      "That works. If the pending credit still doesn't show, reply here and we'll investigate further."
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
        sender: 'internal',
        author: 'Case note',
        text: 'Follow-up due today if no billing answer lands. Attach screenshot of cancellation attempt timing.',
        timestamp: '09:20'
      }
    ],
    quickReplies: [
      'Following up on the billing review from yesterday.',
      'Can you confirm whether billing approved the courtesy refund?',
      'I can send the cancellation screenshot again if needed.'
    ],
    autoReplies: [
      'Thanks for following up. I am checking with billing right now.',
      'Billing is still reviewing it. I will update you by the end of the day.',
      'Yes, please resend the cancellation screenshot so I can attach it to the case.'
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
        sender: 'internal',
        author: 'Case note',
        text: 'Resolved. Keep this thread for proof in case the login alert repeats.',
        timestamp: 'Yesterday'
      }
    ],
    quickReplies: [
      'Thanks, that resolves it.',
      'Can you also send a confirmation email?',
      'Please confirm whether any data was accessed.'
    ],
    autoReplies: [
      'Absolutely — I have emailed the confirmation.',
      'No data was accessed before the session lock triggered.',
      "You're all set. Let us know if the alert appears again."
    ]
  }
];
