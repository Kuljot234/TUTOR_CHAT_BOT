'use client';

import { useState, useCallback } from 'react';
import { SessionState, Message, TutorMode } from '@/types';

const INITIAL_STATE: SessionState = {
  subject: null,
  level: null,
  activeTopic: null,
  weakAreas: [],
  preferredStyle: null,
  tutorMode: 'explain',
  rollingSummary: '',
  messages: [],
};

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_STATE);

  const updateSession = useCallback((updates: Partial<SessionState>) => {
    setSessionState((prev) => ({ ...prev, ...updates }));
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    setSessionState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
    
    return newMessage;
  }, []);

  const setTutorMode = useCallback((mode: TutorMode) => {
    setSessionState((prev) => ({ ...prev, tutorMode: mode }));
  }, []);

  const updateRollingSummary = useCallback((summary: string) => {
    setSessionState((prev) => ({ ...prev, rollingSummary: summary }));
  }, []);

  const resetSession = useCallback(() => {
    setSessionState(INITIAL_STATE);
  }, []);

  return {
    sessionState,
    updateSession,
    addMessage,
    setTutorMode,
    updateRollingSummary,
    resetSession,
  };
}
