import { detectProvider } from '@/lib/provider-utils';
import { extractVisibleTranscript } from '@/lib/transcript-utils';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'detect-provider') {
        return Promise.resolve(detectProvider(document));
      }

      if (message.type === 'extract-transcript') {
        const detection = detectProvider(document);
        return Promise.resolve(extractVisibleTranscript(detection));
      }

      return undefined;
    });
  },
});
