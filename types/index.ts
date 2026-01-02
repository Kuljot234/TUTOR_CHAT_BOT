export type TutorMode = 'explain' | 'socratic' | 'revision' | 'exam-focused';

export type MessageRole = 'user' | 'tutor';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface SessionState {
  subject: string | null;
  level: string | null;
  activeTopic: string | null;
  weakAreas: string[];
  preferredStyle: string | null;
  tutorMode: TutorMode;
  rollingSummary: string;
  messages: Message[];
}

export interface ConversationTurn {
  userMessage: string;
  tutorResponse: string;
  timestamp: number;
}

export interface Note {
  id: string;
  content: string;
  topic: string;
  timestamp: number;
}

export type SuggestionChip = 
  | { type: 'example'; label: string }
  | { type: 'simplify'; label: string }
  | { type: 'exam'; label: string }
  | { type: 'deeper'; label: string };
