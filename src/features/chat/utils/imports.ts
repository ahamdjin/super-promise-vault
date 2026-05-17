import type { Attachment, Conversation, Message } from './types';

type ExtensionCaptureRow = {
  id: string;
  extension_capture_id: string;
  company: string | null;
  issue_title: string | null;
  promised_outcome: string | null;
  provider_name: string | null;
  source_url: string | null;
  follow_up_at: string | null;
  amount_label: string | null;
  capture: ExtensionCapture;
  created_at: string;
};

type ExtensionProvider = {
  name?: string;
};

type ExtensionCaptureContext = {
  amount?: string;
  company?: string;
  followUpAt?: string;
  issueTitle?: string;
  pageUrl?: string;
};

type ExtensionCaptureExtraction = {
  promisedOutcome?: string;
};

type ExtensionCaptureTranscript = {
  stitchedText?: string;
};

type ExtensionCaptureProof = {
  dataUrl?: string;
  filename?: string;
  mimeType?: string;
};

type ExtensionCaptureAttachment = {
  id?: string;
  kind?: string;
  label?: string;
  name?: string;
  source?: string;
  type?: string;
  url?: string;
};

type ExtensionCaptureAssets = {
  attachments?: ExtensionCaptureAttachment[];
};

type ExtensionCapture = {
  amount?: string;
  assets?: ExtensionCaptureAssets;
  attachments?: ExtensionCaptureAttachment[];
  caseId?: string;
  company?: string;
  context?: ExtensionCaptureContext;
  extraction?: ExtensionCaptureExtraction;
  followUpAt?: string;
  id?: string;
  internalNote?: string;
  issueTitle?: string;
  pageUrl?: string;
  promisedOutcome?: string;
  proof?: ExtensionCaptureProof;
  provider?: ExtensionProvider;
  providerName?: string;
  transcript?: string | ExtensionCaptureTranscript;
};

export async function fetchExtensionCaptureConversations(): Promise<Conversation[]> {
  const response = await fetch('/api/extension/captures', {
    credentials: 'include',
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { captures?: ExtensionCaptureRow[] };
  return (payload.captures || []).map(extensionCaptureRowToConversation);
}

function extensionCaptureRowToConversation(row: ExtensionCaptureRow): Conversation {
  const capture = row.capture || {};
  const transcript = getCaptureTranscript(capture);
  const messages = transcriptToMessages(transcript, row.created_at, row.company || capture.company || 'Support');
  const attachments = normalizeAttachments(capture.attachments || capture.assets?.attachments || [], capture.proof);
  const company = row.company || capture.company || 'Support case';

  return {
    id: `extension-${row.extension_capture_id}`,
    company,
    name: row.provider_name || capture.providerName || 'Support',
    title: row.issue_title || capture.issueTitle || 'Imported support conversation',
    caseId: capture.caseId || 'Imported',
    sourceUrl: row.source_url || capture.pageUrl || '',
    channel: 'chat',
    status: 'offline',
    caseStatus: 'promised',
    priority: row.promised_outcome ? 'high' : 'medium',
    promisedOutcome: row.promised_outcome || capture.promisedOutcome || 'Review imported conversation for the promised outcome.',
    amountLabel: row.amount_label || capture.amount || 'Not captured',
    followUpAt: row.follow_up_at ? new Date(row.follow_up_at).toLocaleDateString() : 'Not set',
    nextAction: 'Review the imported transcript and confirm the follow-up date.',
    proofLabel: capture.proof?.filename || 'Extension proof saved',
    caseAttachments: attachments,
    unread: 0,
    initials: initialsFor(company),
    messages,
    quickReplies: [
      'Please confirm this promise in writing.',
      'Can you share a case or reference number?',
      'I will follow up if this is not completed by the promised date.'
    ]
  };
}

function transcriptToMessages(transcript: string, createdAt: string, company: string): Message[] {
  if (!transcript) {
    return [
      {
        id: `imported-empty-${createdAt}`,
        sender: 'contact',
        author: company,
        text: 'Imported capture did not include readable transcript text yet.',
        timestamp: 'Imported'
      }
    ];
  }

  return transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 80)
    .map((line, index) => ({
      id: `imported-${createdAt}-${index}`,
      sender: /^(you|me|customer|user)\b[:-]/i.test(line) ? 'user' : 'contact',
      author: /^(you|me|customer|user)\b[:-]/i.test(line) ? 'You' : company,
      text: line.replace(/^(you|me|customer|user|support|agent)\b[:-]\s*/i, ''),
      timestamp: index === 0 ? 'Imported' : ''
    }));
}

function getCaptureTranscript(capture: ExtensionCapture) {
  if (typeof capture.transcript === 'string') {
    return capture.transcript.trim();
  }

  if (typeof capture.transcript?.stitchedText === 'string') {
    return capture.transcript.stitchedText.trim();
  }

  return (capture.internalNote || '').trim();
}

function normalizeAttachments(attachments: ExtensionCaptureAttachment[], proof?: ExtensionCaptureProof): Attachment[] {
  const normalized = attachments.map((attachment, index) => ({
    id: attachment.id || `imported-attachment-${index}`,
    name: attachment.label || attachment.name || `Attachment ${index + 1}`,
    size: 0,
    type: attachment.kind || attachment.type || 'file',
    url: attachment.url || undefined,
    description: attachment.source ? `Captured from ${attachment.source}` : 'Imported from extension capture'
  }));

  if (proof?.dataUrl) {
    normalized.unshift({
      id: proof.filename || 'extension-proof',
      name: proof.filename || 'Extension proof screenshot',
      size: 0,
      type: proof.mimeType || 'image/jpeg',
      url: proof.dataUrl,
      description: 'Cropped screenshot proof from the extension'
    });
  }

  return normalized;
}

function initialsFor(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
