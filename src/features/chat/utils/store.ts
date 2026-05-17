import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import type { Attachment, Conversation, Message } from './types';
import { initialConversations } from './data';

type ChatState = {
  conversations: Conversation[];
  selectedConversationId: string;
  draft: string;

  selectConversation: (id: string) => void;
  setDraft: (text: string) => void;
  sendMessage: (
    text: string,
    attachments?: Attachment[],
    options?: { sender?: Message['sender']; author?: string }
  ) => void;
  upsertImportedConversations: (conversations: Conversation[]) => void;
  getActiveConversation: () => Conversation | undefined;
};

export const useChatStore = create<ChatState>()(
  // To enable persistence across refreshes, uncomment the persist wrapper below:
  // persist(
  (set, get) => ({
    conversations: initialConversations,
    selectedConversationId: initialConversations[0]?.id ?? '',
    draft: '',

    selectConversation: (id) =>
      set((state) => ({
        selectedConversationId: id,
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
      })),

    setDraft: (text) => set({ draft: text }),

    sendMessage: (text, attachments, options) => {
      const state = get();
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const sender = options?.sender ?? 'user';
      const outgoing: Message = {
        id: 'outgoing-' + Date.now().toString(),
        sender,
        author: options?.author ?? 'You',
        text: text.trim(),
        timestamp,
        attachments: attachments?.length ? attachments : undefined
      };

      set({
        draft: '',
        conversations: state.conversations.map((c) =>
          c.id === state.selectedConversationId
            ? { ...c, messages: [...c.messages, outgoing], unread: 0 }
            : c
        )
      });
    },

    upsertImportedConversations: (importedConversations) => {
      if (!importedConversations.length) return;

      const state = get();
      const importedIds = new Set(importedConversations.map((conversation) => conversation.id));
      const existing = state.conversations.filter((conversation) => !importedIds.has(conversation.id));
      const next = [...importedConversations, ...existing];

      set({
        conversations: next,
        selectedConversationId: importedIds.has(state.selectedConversationId)
          ? state.selectedConversationId
          : importedConversations[0]?.id || state.selectedConversationId
      });
    },

    getActiveConversation: () => {
      const state = get();
      return state.conversations.find((c) => c.id === state.selectedConversationId);
    }
  })
  //   ,
  //   { name: 'chat' }
  // )
);
