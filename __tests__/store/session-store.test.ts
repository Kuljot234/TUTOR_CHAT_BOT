import { renderHook, act } from '@testing-library/react';
import { useSessionStore } from '@/store/session-store';

describe('SessionStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store state
    useSessionStore.setState({
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
    });
  });

  describe('Message Management', () => {
    it('should add a message', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Test message',
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Test message');
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].id).toBeDefined();
      expect(result.current.messages[0].timestamp).toBeDefined();
    });

    it('should update a message', () => {
      const { result } = renderHook(() => useSessionStore());

      let messageId: string;

      act(() => {
        const msg = result.current.addMessage({
          role: 'tutor',
          content: 'Initial content',
        });
        messageId = msg.id;
      });

      act(() => {
        result.current.updateMessage(messageId, 'Updated content');
      });

      expect(result.current.messages[0].content).toBe('Updated content');
    });

    it('should add multiple messages', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addMessage({ role: 'user', content: 'Message 1' });
        result.current.addMessage({ role: 'tutor', content: 'Message 2' });
        result.current.addMessage({ role: 'user', content: 'Message 3' });
      });

      expect(result.current.messages).toHaveLength(3);
    });
  });

  describe('Session Configuration', () => {
    it('should set subject and level', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setSubject('Mathematics');
        result.current.setLevel('University');
      });

      expect(result.current.subject).toBe('Mathematics');
      expect(result.current.level).toBe('University');
    });

    it('should set tutor mode', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setTutorMode('socratic');
      });

      expect(result.current.tutorMode).toBe('socratic');
    });

    it('should set active topic', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setActiveTopic('Calculus');
      });

      expect(result.current.activeTopic).toBe('Calculus');
    });

    it('should add weak areas without duplicates', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addWeakArea('Derivatives');
        result.current.addWeakArea('Integrals');
        result.current.addWeakArea('Derivatives'); // Duplicate
      });

      expect(result.current.weakAreas).toHaveLength(2);
      expect(result.current.weakAreas).toContain('Derivatives');
      expect(result.current.weakAreas).toContain('Integrals');
    });
  });

  describe('Notes Management', () => {
    it('should add a note', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addNote({
          content: 'Test note content',
          topic: 'Test topic',
        });
      });

      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].content).toBe('Test note content');
      expect(result.current.notes[0].topic).toBe('Test topic');
    });

    it('should update a note', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addNote({
          content: 'Original note',
          topic: 'Topic',
        });
      });

      const noteId = result.current.notes[0].id;

      act(() => {
        result.current.updateNote(noteId, 'Updated note');
      });

      expect(result.current.notes[0].content).toBe('Updated note');
    });

    it('should delete a note', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addNote({
          content: 'Test note',
          topic: 'Topic',
        });
      });

      const noteId = result.current.notes[0].id;

      act(() => {
        result.current.deleteNote(noteId);
      });

      expect(result.current.notes).toHaveLength(0);
    });
  });

  describe('UI State', () => {
    it('should manage generation state', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setIsGenerating(true);
      });

      expect(result.current.isGenerating).toBe(true);

      act(() => {
        result.current.setIsGenerating(false);
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('should manage abort controller', () => {
      const { result } = renderHook(() => useSessionStore());

      const controller = new AbortController();

      act(() => {
        result.current.setAbortController(controller);
      });

      expect(result.current.abortController).toBe(controller);

      act(() => {
        result.current.setAbortController(null);
      });

      expect(result.current.abortController).toBeNull();
    });
  });

  describe('Session Reset', () => {
    it('should reset session while preserving subject and level', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setSubject('Physics');
        result.current.setLevel('High School');
        result.current.addMessage({ role: 'user', content: 'Test' });
        result.current.addNote({ content: 'Note', topic: 'Topic' });
        result.current.setActiveTopic('Mechanics');
        result.current.addWeakArea('Forces');
      });

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.notes).toHaveLength(0);
      expect(result.current.activeTopic).toBeNull();
      expect(result.current.weakAreas).toHaveLength(0);
      expect(result.current.subject).toBe('Physics'); // Preserved
      expect(result.current.level).toBe('High School'); // Preserved
    });
  });

  describe('Persistence', () => {
    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setSubject('Chemistry');
        result.current.addMessage({ role: 'user', content: 'Test message' });
      });

      const stored = localStorage.getItem('study-tutor-session');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.subject).toBe('Chemistry');
        expect(parsed.state.messages).toHaveLength(1);
      }
    });
  });
});
