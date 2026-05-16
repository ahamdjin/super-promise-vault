import type { SupportCaseDraft } from '@/lib/types';

const STORAGE_KEY = 'spv-cases';

export async function listCases() {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as SupportCaseDraft[] | undefined) ?? [];
}

export async function saveCase(draft: SupportCaseDraft) {
  const current = await listCases();
  const next = [draft, ...current].slice(0, 50);
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}
