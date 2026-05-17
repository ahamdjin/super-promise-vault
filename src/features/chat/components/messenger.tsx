'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore } from '../utils/store';
import type { Attachment } from '../utils/types';
import { fetchExtensionCaptureConversations } from '../utils/imports';
import { ConversationList } from './conversation-list';
import { ConversationSelect } from './conversation-select';
import { ChatArea } from './chat-area';

export function Messenger() {
  const {
    conversations,
    selectedConversationId,
    draft,
    selectConversation,
    setDraft,
    sendMessage,
    upsertImportedConversations,
    getActiveConversation
  } = useChatStore();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [composeMode, setComposeMode] = useState<'user' | 'support'>('user');

  useEffect(() => {
    setAttachments([]);
    setComposeMode('user');
  }, [selectedConversationId]);

  useEffect(() => {
    let isActive = true;

    fetchExtensionCaptureConversations()
      .then((importedConversations) => {
        if (isActive && importedConversations.length) {
          upsertImportedConversations(importedConversations);
        }
      })
      .catch(() => {
        // Imported captures are optional; the demo chat should still render if Supabase is not set up yet.
      });

    return () => {
      isActive = false;
    };
  }, [upsertImportedConversations]);

  const handleAddAttachments = useCallback((files: FileList) => {
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const active = getActiveConversation();
      if ((!draft.trim() && attachments.length === 0) || !active) return;

      sendMessage(draft, attachments.length > 0 ? attachments : undefined, {
        sender: composeMode === 'user' ? 'user' : 'contact',
        author: composeMode === 'user' ? 'You' : active.name
      });
      setAttachments([]);
    },
    [
      draft,
      attachments,
      composeMode,
      getActiveConversation,
      sendMessage
    ]
  );

  const activeConversation = getActiveConversation();
  if (!activeConversation) return null;

  return (
    <div className='border-border/50 bg-background/70 relative grid h-[calc(100dvh-5.5rem)] w-full grid-rows-[auto,1fr] gap-3 overflow-hidden rounded-2xl border p-3 backdrop-blur-xl sm:gap-4 sm:p-4 lg:[grid-template-columns:30%_1fr] lg:grid-rows-[1fr] lg:gap-4 lg:rounded-3xl lg:p-5'>
      <ConversationSelect
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={selectConversation}
      />
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={selectConversation}
      />
      <ChatArea
        conversation={activeConversation}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
        composeMode={composeMode}
        onComposeModeChange={setComposeMode}
        attachments={attachments}
        onAddAttachments={handleAddAttachments}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
