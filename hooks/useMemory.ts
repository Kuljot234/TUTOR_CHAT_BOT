'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/types';

const MAX_VERBATIM_TURNS = 10;
const SUMMARY_UPDATE_INTERVAL = 5;

interface MemoryState {
  verbatimMessages: Message[];
  compressedTurns: string[];
  turnsSinceLastSummary: number;
}

export function useMemory() {
  const [memoryState, setMemoryState] = useState<MemoryState>({
    verbatimMessages: [],
    compressedTurns: [],
    turnsSinceLastSummary: 0,
  });

  const addToMemory = useCallback((message: Message) => {
    setMemoryState((prev) => {
      const newVerbatim = [...prev.verbatimMessages, message];
      let updatedCompressed = prev.compressedTurns;
      let updatedVerbatim = newVerbatim;
      let turnCount = prev.turnsSinceLastSummary + 1;

      // If we have too many verbatim messages, compress the oldest ones
      if (newVerbatim.length > MAX_VERBATIM_TURNS) {
        const toCompress = newVerbatim.slice(0, newVerbatim.length - MAX_VERBATIM_TURNS);
        updatedVerbatim = newVerbatim.slice(-MAX_VERBATIM_TURNS);
        
        // Create simple compression (in production, this would call LLM)
        const compressed = compressMessages(toCompress);
        updatedCompressed = [...prev.compressedTurns, compressed];
      }

      return {
        verbatimMessages: updatedVerbatim,
        compressedTurns: updatedCompressed,
        turnsSinceLastSummary: turnCount,
      };
    });
  }, []);

  const generateSummary = useCallback((): string => {
    const { compressedTurns, verbatimMessages } = memoryState;
    
    let summary = '';
    
    if (compressedTurns.length > 0) {
      summary += 'Previous conversation summary:\n' + compressedTurns.join('\n') + '\n\n';
    }
    
    if (verbatimMessages.length > 0) {
      summary += 'Recent conversation:\n';
      verbatimMessages.forEach((msg) => {
        summary += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
      });
    }
    
    return summary;
  }, [memoryState]);

  const clearMemory = useCallback(() => {
    setMemoryState({
      verbatimMessages: [],
      compressedTurns: [],
      turnsSinceLastSummary: 0,
    });
  }, []);

  return {
    addToMemory,
    generateSummary,
    clearMemory,
    needsSummaryUpdate: memoryState.turnsSinceLastSummary >= SUMMARY_UPDATE_INTERVAL,
  };
}

// Simple compression function (in production, use LLM for better compression)
function compressMessages(messages: Message[]): string {
  const topics = new Set<string>();
  const keyPoints: string[] = [];
  
  messages.forEach((msg) => {
    if (msg.role === 'user') {
      // Extract potential topics from user questions
      const words = msg.content.split(' ').filter(w => w.length > 5);
      words.slice(0, 2).forEach(w => topics.add(w));
    }
  });
  
  return `Discussed: ${Array.from(topics).join(', ')}. ${messages.length} exchanges.`;
}
