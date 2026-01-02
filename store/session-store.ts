import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionState, Message, TutorMode, Note } from '@/types';

interface SessionStore extends SessionState {
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (id: string, content: string) => void;
  setTutorMode: (mode: TutorMode) => void;
  setSubject: (subject: string) => void;
  setLevel: (level: string) => void;
  setActiveTopic: (topic: string | null) => void;
  addWeakArea: (area: string) => void;
  updateRollingSummary: (summary: string) => void;
  resetSession: () => void;
  
  // Notes management
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  
  // UI state
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  abortController: AbortController | null;
  setAbortController: (controller: AbortController | null) => void;
}

const INITIAL_STATE: Omit<SessionStore, keyof ReturnType<typeof createActions>> = {
  subject: null,
  level: null,
  activeTopic: null,
  weakAreas: [],
  preferredStyle: null,
  tutorMode: 'explain',
  rollingSummary: '',
  messages: [],
  notes: [],
  isGenerating: false,
  abortController: null,
};

type SetState = (partial: Partial<SessionStore> | ((state: SessionStore) => Partial<SessionStore>)) => void;
type GetState = () => SessionStore;

const createActions = (set: SetState, get: GetState) => ({
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    set((state: SessionStore) => ({
      messages: [...state.messages, newMessage],
    }));
    
    return newMessage;
  },
  
  updateMessage: (id: string, content: string) => {
    set((state: SessionStore) => ({
      messages: state.messages.map(msg => 
        msg.id === id ? { ...msg, content } : msg
      ),
    }));
  },
  
  setTutorMode: (mode: TutorMode) => {
    set({ tutorMode: mode });
  },
  
  setSubject: (subject: string) => {
    set({ subject });
  },
  
  setLevel: (level: string) => {
    set({ level });
  },
  
  setActiveTopic: (topic: string | null) => {
    set({ activeTopic: topic });
  },
  
  addWeakArea: (area: string) => {
    set((state: SessionStore) => ({
      weakAreas: [...new Set([...state.weakAreas, area])],
    }));
  },
  
  updateRollingSummary: (summary: string) => {
    set({ rollingSummary: summary });
  },
  
  resetSession: () => {
    set({
      ...INITIAL_STATE,
      subject: get().subject, // Preserve subject/level across resets
      level: get().level,
    });
  },
  
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    set((state: SessionStore) => ({
      notes: [...state.notes, newNote],
    }));
  },
  
  updateNote: (id: string, content: string) => {
    set((state: SessionStore) => ({
      notes: state.notes.map(note => 
        note.id === id ? { ...note, content } : note
      ),
    }));
  },
  
  deleteNote: (id: string) => {
    set((state: SessionStore) => ({
      notes: state.notes.filter(note => note.id !== id),
    }));
  },
  
  setIsGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },
  
  setAbortController: (controller: AbortController | null) => {
    set({ abortController: controller });
  },
});

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      ...createActions(set, get),
    }),
    {
      name: 'study-tutor-session',
      partialize: (state) => ({
        subject: state.subject,
        level: state.level,
        tutorMode: state.tutorMode,
        messages: state.messages.slice(-50), // Keep last 50 messages
        notes: state.notes,
        weakAreas: state.weakAreas,
        activeTopic: state.activeTopic,
      }),
    }
  )
);
