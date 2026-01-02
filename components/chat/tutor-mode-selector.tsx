'use client';

import React from 'react';
import { TutorMode } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageCircleQuestion, RotateCcw, GraduationCap } from 'lucide-react';

interface TutorModeSelectorProps {
  currentMode: TutorMode;
  onModeChange: (mode: TutorMode) => void;
}

const MODES = [
  { value: 'explain' as TutorMode, label: 'Explain', icon: BookOpen },
  { value: 'socratic' as TutorMode, label: 'Socratic', icon: MessageCircleQuestion },
  { value: 'revision' as TutorMode, label: 'Revision', icon: RotateCcw },
  { value: 'exam-focused' as TutorMode, label: 'Exam', icon: GraduationCap },
];

export function TutorModeSelector({ currentMode, onModeChange }: TutorModeSelectorProps) {
  return (
    <div className="p-4 border-b bg-muted/30">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Teaching Style</p>
      <Tabs value={currentMode} onValueChange={(value) => onModeChange(value as TutorMode)}>
        <TabsList className="grid w-full grid-cols-4">
          {MODES.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="text-xs">
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
