import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Support Promise Vault',
    description:
      'Capture visible support promises from supported chat providers before the proof disappears.',
    permissions: ['activeTab', 'storage', 'tabs'],
  },
});
