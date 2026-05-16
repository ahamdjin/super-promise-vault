export type ProviderName =
  | 'zendesk'
  | 'intercom'
  | 'helpscout'
  | 'gorgias'
  | 'unknown';

export type SupportTier = 'structured' | 'fallback' | 'unsupported';

export type CaptureState = 'promised' | 'waiting' | 'resolved' | 'denied';

export type SpeakerType = 'agent' | 'user' | 'system' | 'unknown';

export interface DetectionResult {
  provider: ProviderName;
  tier: SupportTier;
  url: string;
  title: string;
  domain: string;
  detectedVia: string[];
  notes: string[];
}

export interface TranscriptMessage {
  speaker: SpeakerType;
  text: string;
}

export interface ExtractionResult {
  messages: TranscriptMessage[];
  rawText: string;
  limited: boolean;
  captureHints: string[];
}

export interface SupportCaseDraft {
  id: string;
  provider: ProviderName;
  companyName: string;
  pageUrl: string;
  pageTitle: string;
  domain: string;
  caseId: string;
  orderId: string;
  promisedOutcome: string;
  promiseSummary: string;
  amount: string;
  followUpDate: string;
  screenshotDataUrl?: string;
  transcriptPreview: string;
  messages: TranscriptMessage[];
  status: CaptureState;
  createdAt: string;
}

export interface CapturedSupportContext {
  detection: DetectionResult;
  extraction: ExtractionResult;
  screenshotDataUrl?: string;
}
