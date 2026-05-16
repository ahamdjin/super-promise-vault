import { listCases, saveCase } from '@/lib/storage';
import type { CapturedSupportContext, SupportCaseDraft } from '@/lib/types';

type RuntimeMessage =
  | { type: 'inspect-active-tab' }
  | { type: 'capture-support-context' }
  | { type: 'save-case'; payload: SupportCaseDraft }
  | { type: 'list-cases' }
  | { type: 'open-dashboard' };

const APP_URL = import.meta.env.WXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getActiveTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToActiveTab<T>(payload: Record<string, unknown>) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    throw new Error('No active tab was found.');
  }

  return browser.tabs.sendMessage(tab.id, payload) as Promise<T>;
}

async function inspectActiveTab() {
  try {
    return await sendToActiveTab<CapturedSupportContext['detection']>({ type: 'detect-provider' });
  } catch (error) {
    const tab = await getActiveTab();
    return {
      provider: 'unknown',
      tier: 'unsupported',
      url: tab?.url || '',
      title: tab?.title || 'Unsupported page',
      domain: tab?.url ? new URL(tab.url).hostname : '',
      detectedVia: [],
      notes: ['This page could not be inspected. Browser-internal pages are not supported.'],
      error: error instanceof Error ? error.message : 'Unknown inspection error',
    };
  }
}

async function captureSupportContext() {
  const [detection, extraction, screenshotDataUrl] = await Promise.all([
    sendToActiveTab<CapturedSupportContext['detection']>({ type: 'detect-provider' }),
    sendToActiveTab<CapturedSupportContext['extraction']>({ type: 'extract-transcript' }),
    browser.tabs.captureVisibleTab(),
  ]);

  return {
    detection,
    extraction,
    screenshotDataUrl,
  } satisfies CapturedSupportContext;
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: RuntimeMessage) => {
    switch (message.type) {
      case 'inspect-active-tab':
        return inspectActiveTab();
      case 'capture-support-context':
        return captureSupportContext();
      case 'save-case':
        return saveCase(message.payload);
      case 'list-cases':
        return listCases();
      case 'open-dashboard':
        return browser.tabs.create({ url: `${APP_URL}/demo` });
      default:
        return undefined;
    }
  });
});
