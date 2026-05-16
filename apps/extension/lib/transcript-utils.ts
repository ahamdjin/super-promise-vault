import type {
  DetectionResult,
  ExtractionResult,
  ProviderName,
  SpeakerType,
  TranscriptMessage,
} from '@/lib/types';

const SELECTOR_MAP: Record<ProviderName, string[]> = {
  zendesk: [
    '[data-testid*="message"]',
    '[class*="conversation"] [class*="message"]',
    '[class*="chat"] [class*="message"]',
  ],
  intercom: [
    '[data-testid*="conversation-part"]',
    '[class*="intercom"] [class*="message"]',
    '[class*="intercom"] [class*="conversation"] > *',
  ],
  helpscout: [
    '[class*="Beacon"] [class*="message"]',
    '[class*="BeaconConversation"] [class*="Message"]',
  ],
  gorgias: [
    '[class*="gorgias"] [class*="message"]',
    '[data-testid*="message"]',
  ],
  unknown: [
    '[role="log"] > *',
    '[aria-live="polite"] > *',
    '[class*="chat"] [class*="message"]',
    '[class*="conversation"] [class*="message"]',
  ],
};

function detectSpeaker(element: Element): SpeakerType {
  const text = [
    element.getAttribute('data-author'),
    element.getAttribute('data-sender'),
    element.getAttribute('aria-label'),
    element.className,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('agent') || text.includes('support')) return 'agent';
  if (text.includes('visitor') || text.includes('customer') || text.includes('user')) return 'user';
  if (text.includes('system') || text.includes('bot')) return 'system';
  return 'unknown';
}

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function collectFromDocument(doc: Document, selectors: string[]) {
  const messages: TranscriptMessage[] = [];
  const hints: string[] = [];

  for (const selector of selectors) {
    const nodes = Array.from(doc.querySelectorAll(selector));
    if (!nodes.length) continue;

    hints.push(`selector:${selector}`);

    for (const node of nodes) {
      const text = cleanText(node.textContent || '');
      if (!text || text.length < 3) continue;

      messages.push({
        speaker: detectSpeaker(node),
        text,
      });
    }

    if (messages.length >= 3) break;
  }

  return { messages, hints };
}

function collectAccessibleFrameDocuments(doc: Document) {
  const documents: Document[] = [doc];

  for (const frame of Array.from(doc.querySelectorAll('iframe'))) {
    try {
      if (frame.contentDocument) {
        documents.push(frame.contentDocument);
      }
    } catch {
      // Cross-origin iframe. We rely on screenshot fallback for these.
    }
  }

  return documents;
}

export function extractVisibleTranscript(detection: DetectionResult): ExtractionResult {
  const selectors = SELECTOR_MAP[detection.provider] ?? SELECTOR_MAP.unknown;
  const docs = collectAccessibleFrameDocuments(document);
  const messages: TranscriptMessage[] = [];
  const hints: string[] = [];

  for (const doc of docs) {
    const result = collectFromDocument(doc, selectors);
    messages.push(...result.messages);
    hints.push(...result.hints);
  }

  const dedupedMessages = messages.filter((message, index, list) => {
    const firstIndex = list.findIndex((item) => item.text === message.text);
    return firstIndex === index;
  });

  const limited =
    !dedupedMessages.length ||
    Array.from(document.querySelectorAll('iframe')).length > docs.length - 1;

  const rawText = dedupedMessages.map((message) => message.text).join('\n');

  return {
    messages: dedupedMessages.slice(0, 20),
    rawText,
    limited,
    captureHints: hints.length
      ? hints
      : ['Visible transcript extraction was limited. Screenshot fallback is recommended.'],
  };
}
