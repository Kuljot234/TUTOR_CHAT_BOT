'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from '@/components/chat/message';
import { MessageSkeleton } from '@/components/chat/message-skeleton';
import { ChatInput } from '@/components/chat/chat-input';
import { TutorModeSelector } from '@/components/chat/tutor-mode-selector';
import { SuggestionChips } from '@/components/chat/suggestion-chips';
import { NotesPanel } from '@/components/notes/notes-panel';
import { SetupDialog } from '@/components/setup-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSessionStore } from '@/store/session-store';
import { RotateCcw, StopCircle, Settings, MessageSquare, FileText, Wifi, WifiOff } from 'lucide-react';
import { SuggestionChip } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedFile } from '@/components/chat/file-upload';

export function TutorInterface() {
  const {
    messages,
    tutorMode,
    subject,
    level,
    activeTopic,
    isGenerating,
    abortController,
    addMessage,
    updateMessage,
    setTutorMode,
    setActiveTopic,
    addWeakArea,
    resetSession,
    setIsGenerating,
    setAbortController,
    setSubject,
    setLevel,
  } = useSessionStore();

  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleStopGeneration();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const modes = ['explain', 'socratic', 'revision', 'exam-focused'] as const;
        setTutorMode(modes[parseInt(e.key) - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTutorMode]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, streamingMessageId]);

  const handleSendMessage = useCallback(async (content: string, files?: UploadedFile[], audio?: Blob) => {
    if (!isOnline) {
      alert('You are offline. Please check your connection.');
      return;
    }

    let messageContent = content;
    if (files && files.length > 0) {
      messageContent += `\n\n[Attached ${files.length} file(s): ${files.map(f => f.file.name).join(', ')}]`;
    }
    if (audio) {
      messageContent += '\n\n[Audio message attached]';
    }

    const userMessage = addMessage({ role: 'user', content: messageContent });
    
    const potentialTopic = extractTopic(content);
    if (potentialTopic && !activeTopic) {
      setActiveTopic(potentialTopic);
    }

    setIsGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    const tutorMessage = addMessage({ role: 'tutor', content: '' });
    setStreamingMessageId(tutorMessage.id);

    try {
      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('message', content);
        formData.append('tutorMode', tutorMode);
        formData.append('sessionSummary', generateSessionSummary());
        formData.append('subject', subject || '');
        formData.append('level', level || '');
        
        files.forEach((uploadedFile, index) => {
          formData.append(`file_${index}`, uploadedFile.file);
        });
        
        body = formData;
      } else if (audio) {
        const formData = new FormData();
        formData.append('message', content);
        formData.append('tutorMode', tutorMode);
        formData.append('sessionSummary', generateSessionSummary());
        formData.append('subject', subject || '');
        formData.append('level', level || '');
        formData.append('audio', audio, 'recording.webm');
        
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          message: content,
          tutorMode,
          sessionSummary: generateSessionSummary(),
          subject,
          level,
        });
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMsg = 'Failed to get response';
        try {
          const json = await response.json();
          if (json?.error) errMsg = json.error;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  updateMessage(tutorMessage.id, accumulatedText);
                }
              } catch (e) {
              }
            }
          }
        }
      }

      if (content.toLowerCase().includes('confused') || content.toLowerCase().includes("don't understand")) {
        addWeakArea(potentialTopic || 'General concept');
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation cancelled');
      } else {
        console.error('Streaming error:', error);
        const err = error as Error;
        let errorMessage = "I apologize, but I'm having trouble responding right now. ";
        
        if (!isOnline) {
          errorMessage += 'Check your internet connection.';
        } else if (err.message?.includes('API key')) {
          errorMessage += 'API configuration issue.';
        } else if (err.message?.includes('quota') || err.message?.includes('limit')) {
          errorMessage += 'API limit reached. Try again later.';
        } else {
          errorMessage += 'Try rephrasing your question.';
        }
        
        updateMessage(tutorMessage.id, errorMessage);
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
      setAbortController(null);
    }
  }, [
    isOnline,
    addMessage,
    updateMessage,
    tutorMode,
    subject,
    level,
    activeTopic,
    setActiveTopic,
    setIsGenerating,
    setAbortController,
    addWeakArea,
  ]);

  const handleStopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setStreamingMessageId(null);
      setAbortController(null);
    }
  }, [abortController, setIsGenerating, setAbortController]);

  const handleEditSession = useCallback(() => {
    const newSubject = prompt('Set subject (e.g., Mathematics)', subject || '')?.trim();
    const newLevel = prompt('Set level (e.g., High School)', level || '')?.trim();
    if (newSubject) setSubject(newSubject);
    if (newLevel) setLevel(newLevel);
  }, [subject, level, setSubject, setLevel]);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset the session? Your notes will be preserved.')) {
      resetSession();
      setStreamingMessageId(null);
    }
  }, [resetSession]);

  const handleSuggestionClick = (suggestion: SuggestionChip) => {
    const messageMap = {
      example: 'Can you provide a concrete example of this?',
      simplify: 'Can you explain this more simply?',
      exam: 'How would I answer this in an exam?',
      deeper: 'Can you explain this in more depth?',
    };
    handleSendMessage(messageMap[suggestion.type]);
  };

  const suggestions: SuggestionChip[] = [
    { type: 'example', label: '💡 Show example' },
    { type: 'simplify', label: '🔍 Simplify' },
    { type: 'exam', label: '📝 Exam answer' },
    { type: 'deeper', label: '🔬 Go deeper' },
  ];

  const generateSessionSummary = (): string => {
    const recentMessages = messages.slice(-10);
    return recentMessages
      .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content.substring(0, 100)}`)
      .join('\n');
  };

  return (
    <>
      <SetupDialog />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen flex-row gap-4 p-4 bg-background">
        {/* Left Panel - Chat */}
        <Card className="flex-1 flex flex-col">
          <TutorModeSelector currentMode={tutorMode} onModeChange={setTutorMode} />
          
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h2 className="font-semibold text-sm">Tutor Chat</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                {messages.length} messages
                {!isOnline && (
                  <span className="flex items-center gap-1 text-destructive">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Subject:</strong> {subject || 'Not set'} • <strong>Level:</strong> {level || 'Not set'}
              </p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleEditSession}>
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {isGenerating && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopGeneration}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isGenerating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <EmptyState onExampleClick={handleSendMessage} />
              ) : (
                <div>
                  {messages.map((message, index) => (
                    <div 
                      key={message.id}
                      ref={index === messages.length - 1 ? lastMessageRef : null}
                    >
                      <Message
                        message={message}
                        isStreaming={message.id === streamingMessageId}
                        onRegenerate={
                          message.role === 'tutor' && index === messages.length - 1 && !isGenerating
                            ? () => {
                                const previousUserMessage = messages[index - 1];
                                if (previousUserMessage) {
                                  handleSendMessage(previousUserMessage.content);
                                }
                              }
                            : undefined
                        }
                      />
                    </div>
                  ))}
                  {isGenerating && streamingMessageId === null && <MessageSkeleton />}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {messages.length > 0 && (
            <SuggestionChips
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
              disabled={isGenerating}
            />
          )}

          <ChatInput
            onSend={handleSendMessage}
            disabled={isGenerating || !isOnline}
            placeholder={
              !isOnline
                ? 'You are offline...'
                : isGenerating
                ? 'Tutor is responding...'
                : 'Ask a question or request clarification...'
            }
          />
        </Card>

        {/* Right Panel - Notes */}
        <div className="flex-1">
          <NotesPanel messages={messages} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-screen flex flex-col p-4 bg-background">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'notes')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:flex">
            <Card className="flex-1 flex flex-col">
              <TutorModeSelector currentMode={tutorMode} onModeChange={setTutorMode} />
              
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <h2 className="font-semibold text-sm">Tutor</h2>
                  <p className="text-xs text-muted-foreground">{messages.length} messages</p>
                </div>
                <div className="flex gap-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <EmptyState onExampleClick={handleSendMessage} />
                ) : (
                  <div>
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        message={message}
                        isStreaming={message.id === streamingMessageId}
                      />
                    ))}
                    {isGenerating && <MessageSkeleton />}
                  </div>
                )}
              </ScrollArea>

              {messages.length > 0 && (
                <SuggestionChips
                  suggestions={suggestions}
                  onSelect={handleSuggestionClick}
                  disabled={isGenerating}
                />
              )}

              <ChatInput
                onSend={handleSendMessage}
                disabled={isGenerating || !isOnline}
                placeholder={isGenerating ? 'Tutor is responding...' : 'Ask a question...'}
              />
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 mt-0 data-[state=active]:flex">
            <NotesPanel messages={messages} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function EmptyState({ onExampleClick }: { onExampleClick: (msg: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <div className="mb-4 text-muted-foreground">
        <BookOpenIcon className="h-12 w-12 mx-auto mb-2" />
        <h3 className="font-semibold text-lg mb-2">Welcome to Your Study Tutor</h3>
        <p className="text-sm max-w-md">
          Ask any question to begin. I'll guide you step-by-step, remember our conversation,
          and help you build comprehensive study notes.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExampleClick('Can you explain photosynthesis?')}
        >
          Example: Photosynthesis
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExampleClick('Help me understand derivatives in calculus')}
        >
          Example: Derivatives
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExampleClick('What caused World War I?')}
        >
          Example: History
        </Button>
      </div>
      <div className="mt-8 text-xs text-muted-foreground space-y-1">
        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+K</kbd> Focus input</p>
        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+S</kbd> Stop generation</p>
        <p><kbd className="px-2 py-1 bg-muted rounded">Ctrl+1-4</kbd> Switch tutor mode</p>
      </div>
    </motion.div>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function extractTopic(message: string): string | null {
  // Simple topic extraction from common patterns
  const patterns = [
    /(?:explain|understand|learn about|studying)\s+(.+?)(?:\?|$)/i,
    /what (?:is|are)\s+(.+?)\??$/i,
    /tell me about\s+(.+?)(?:\?|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim().split(' ').slice(0, 3).join(' ');
    }
  }

  return null;
}
