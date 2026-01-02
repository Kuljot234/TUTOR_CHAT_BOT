'use client';

import React, { useState } from 'react';
import { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimatedText } from '@/components/ui/animated-text';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function Message({ message, isStreaming = false, onRegenerate }: MessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const shouldAnimate = !isUser && !isStreaming && !hasAnimated;
  const animatedContent = useAnimatedText(
    shouldAnimate ? message.content : "",
    ""
  );

  React.useEffect(() => {
    if (!isUser && !isStreaming && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 8500);
      return () => clearTimeout(timer);
    }
  }, [isUser, isStreaming, hasAnimated]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group mb-6 p-4 rounded-lg relative',
        isUser
          ? 'bg-muted/50 ml-8'
          : 'bg-card border border-border mr-8'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {isUser ? 'You' : 'Tutor'}
        </span>
        {!isStreaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            {!isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 w-7 p-0"
                aria-label="Regenerate response"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div
        className={cn(
          isUser ? 'font-sans' : 'font-serif'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <div className="space-y-2">
            <MarkdownRenderer content={shouldAnimate ? animatedContent : message.content} />
            {shouldAnimate && animatedContent.length < message.content.length && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-primary/70 ml-1"
              />
            )}
          </div>
        )}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary ml-1"
          />
        )}
      </div>
    </motion.div>
  );
}
