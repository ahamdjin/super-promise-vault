export const mockCases = [
  {
    id: 'case-1',
    company: 'Amazon',
    provider: 'zendesk',
    promise: 'Refund of $87.42 after return inspection',
    summary:
      'Agent confirmed the refund would land within 5 business days after the return scanned as received.',
    followUp: '2026-05-19',
    status: 'waiting',
    amount: '$87.42',
  },
  {
    id: 'case-2',
    company: 'Notion',
    provider: 'intercom',
    promise: 'Prorated billing credit on next invoice',
    summary:
      'Support approved the downgrade credit but said finance needed one billing cycle to apply it.',
    followUp: '2026-05-22',
    status: 'promised',
    amount: '$24.00',
  },
  {
    id: 'case-3',
    company: 'Gymshark',
    provider: 'gorgias',
    promise: 'Replacement shipment after stock check',
    summary:
      'Support promised a replacement once the warehouse confirmed the damaged item on the submitted photo.',
    followUp: '2026-05-18',
    status: 'waiting',
    amount: '$0',
  },
];
