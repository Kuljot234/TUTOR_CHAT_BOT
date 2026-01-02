import { useMemory } from '@/hooks/useMemory';
import { renderHook, act } from '@testing-library/react';
import { Message } from '@/types';

describe('useMemory Hook', () => {
  const createMockMessage = (role: 'user' | 'tutor', content: string): Message => ({
    id: Math.random().toString(),
    role,
    content,
    timestamp: Date.now(),
  });

  it('should initialize with empty memory', () => {
    const { result } = renderHook(() => useMemory());
    
    const summary = result.current.generateSummary();
    expect(summary).toBe('');
  });

  it('should add messages to memory', () => {
    const { result } = renderHook(() => useMemory());
    
    const message1 = createMockMessage('user', 'Test question');
    const message2 = createMockMessage('tutor', 'Test answer');
    
    act(() => {
      result.current.addToMemory(message1);
      result.current.addToMemory(message2);
    });
    
    const summary = result.current.generateSummary();
    expect(summary).toContain('Student: Test question');
    expect(summary).toContain('Tutor: Test answer');
  });

  it('should maintain verbatim messages up to limit', () => {
    const { result } = renderHook(() => useMemory());
    
    // Add 12 messages (limit is 10 verbatim)
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToMemory(
          createMockMessage('user', `Message ${i}`)
        );
      }
    });
    
    const summary = result.current.generateSummary();
    
    // Should contain recent messages
    expect(summary).toContain('Message 11');
    expect(summary).toContain('Message 10');
    
    // Older messages should be compressed
    expect(summary).toContain('Previous conversation summary');
  });

  it('should generate summary with context', () => {
    const { result } = renderHook(() => useMemory());
    
    act(() => {
      result.current.addToMemory(
        createMockMessage('user', 'What is photosynthesis?')
      );
      result.current.addToMemory(
        createMockMessage('tutor', 'Photosynthesis is a process...')
      );
    });
    
    const summary = result.current.generateSummary();
    
    expect(summary).toContain('Recent conversation:');
    expect(summary).toContain('Student:');
    expect(summary).toContain('Tutor:');
  });

  it('should track turns since last summary', () => {
    const { result } = renderHook(() => useMemory());
    
    expect(result.current.needsSummaryUpdate).toBe(false);
    
    act(() => {
      // Add 5 messages (update interval is 5)
      for (let i = 0; i < 5; i++) {
        result.current.addToMemory(
          createMockMessage('user', `Message ${i}`)
        );
      }
    });
    
    expect(result.current.needsSummaryUpdate).toBe(true);
  });

  it('should clear all memory', () => {
    const { result } = renderHook(() => useMemory());
    
    act(() => {
      result.current.addToMemory(createMockMessage('user', 'Test'));
      result.current.addToMemory(createMockMessage('tutor', 'Response'));
    });
    
    let summary = result.current.generateSummary();
    expect(summary).not.toBe('');
    
    act(() => {
      result.current.clearMemory();
    });
    
    summary = result.current.generateSummary();
    expect(summary).toBe('');
  });

  it('should compress messages intelligently', () => {
    const { result } = renderHook(() => useMemory());
    
    act(() => {
      // Add many messages to trigger compression
      for (let i = 0; i < 15; i++) {
        result.current.addToMemory(
          createMockMessage('user', `Question about derivatives number ${i}`)
        );
        result.current.addToMemory(
          createMockMessage('tutor', `Answer about calculus number ${i}`)
        );
      }
    });
    
    const summary = result.current.generateSummary();
    
    // Should have compressed older messages
    expect(summary).toContain('Previous conversation summary');
    // Should still have recent verbatim
    expect(summary).toContain('Recent conversation:');
  });
});
