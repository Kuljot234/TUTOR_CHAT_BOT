'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSessionStore } from '@/store/session-store';

export function SetupDialog() {
  const { subject, level, setSubject, setLevel } = useSessionStore();
  const [open, setOpen] = useState(false);
  const [tempSubject, setTempSubject] = useState('');
  const [tempLevel, setTempLevel] = useState('');

  useEffect(() => {
    // Show dialog if not set
    if (!subject || !level) {
      setOpen(true);
    }
  }, [subject, level]);

  const handleSave = () => {
    if (tempSubject.trim() && tempLevel.trim()) {
      setSubject(tempSubject.trim());
      setLevel(tempLevel.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Study Tutor</DialogTitle>
          <DialogDescription>
            Tell me about yourself so I can provide better guidance
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">
              What subject are you studying?
            </Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, Biology, History"
              value={tempSubject}
              onChange={(e) => setTempSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">
              What's your level?
            </Label>
            <Input
              id="level"
              placeholder="e.g., High School, University Year 1, GCSE"
              value={tempLevel}
              onChange={(e) => setTempLevel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave}
            disabled={!tempSubject.trim() || !tempLevel.trim()}
          >
            Start Learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
