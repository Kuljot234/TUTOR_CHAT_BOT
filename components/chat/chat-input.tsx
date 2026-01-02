'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { FileUpload, UploadedFile } from './file-upload';
import { AIVoiceInput } from '@/components/ui/ai-voice-input';

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[], audio?: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if ((input.trim() || uploadedFiles.length > 0 || audioBlob) && !disabled) {
      onSend(
        input.trim(), 
        uploadedFiles.length > 0 ? uploadedFiles : undefined,
        audioBlob || undefined
      );
      setInput('');
      setUploadedFiles([]);
      setAudioBlob(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceStart = () => {
    console.log('Voice recording started');
  };

  const handleVoiceStop = (duration: number) => {
    setIsRecording(false);
    if (duration > 0) {
      console.log(`Recording completed: ${duration}s`);
      // In a real app, you'd capture the audio blob here
      // For now, we'll simulate it with a placeholder
    }
  };

  return (
    <div className="border-t bg-background">
      {audioBlob && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
            <span className="text-xs text-primary">Audio recorded</span>
            <button
              onClick={() => setAudioBlob(null)}
              className="text-xs text-primary hover:text-primary/80"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Expanded Voice Input - Only when recording */}
        {isRecording && (
          <div className="mb-4 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <AIVoiceInput
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
              visualizerBars={48}
              className="py-3"
            />
          </div>
        )}

        {/* Main Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || 'Ask a question...'}
              disabled={disabled || isRecording}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] font-sans"
              rows={3}
            />
            
            {/* File Upload & Voice Button - Hidden during recording */}
            {!isRecording && (
              <div className="flex items-center gap-2">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  files={uploadedFiles}
                  disabled={disabled}
                />
                
                {/* Compact Voice Input Button */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsRecording(true);
                      handleVoiceStart();
                    }}
                    className="h-9 w-9 relative group"
                    title="Voice input"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && uploadedFiles.length === 0 && !audioBlob) || disabled || isRecording}
            size="icon"
            className="h-[80px] w-12"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
