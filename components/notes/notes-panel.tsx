'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Edit2, Save, X } from 'lucide-react';
import { Message } from '@/types';
import { useSessionStore } from '@/store/session-store';

interface NotesPanelProps {
  messages: Message[];
}

export function NotesPanel({ messages }: NotesPanelProps) {
  const { notes, addNote, updateNote, activeTopic } = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  // Auto-generate notes from new tutor messages
  useEffect(() => {
    const tutorMessages = messages.filter((m) => m.role === 'tutor');
    if (tutorMessages.length > notes.length) {
      const newMessages = tutorMessages.slice(notes.length);
      newMessages.forEach((msg) => {
        const noteContent = extractKeyPoints(msg.content);
        addNote({
          content: noteContent,
          topic: activeTopic || 'General',
        });
      });
    }
  }, [messages, notes.length, activeTopic, addNote]);

  const allNotesContent = notes.map((n) => n.content).join('\n\n');

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(allNotesContent);
  };

  const handleSave = () => {
    // Update the first note with all content, or create new
    if (notes.length > 0) {
      updateNote(notes[0].id, editedContent);
      // Clear other notes
      notes.slice(1).forEach(n => updateNote(n.id, ''));
    } else {
      addNote({
        content: editedContent,
        topic: activeTopic || 'General',
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleExport = () => {
    const content = formatNotesForExport(notes, activeTopic);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = activeTopic 
      ? `${activeTopic.replace(/\s+/g, '-')}-notes.md`
      : `study-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Study Notes</CardTitle>
          {activeTopic && (
            <p className="text-xs text-muted-foreground mt-1">{activeTopic}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport} disabled={notes.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full min-h-[400px] resize-none border-0 focus:outline-none focus:ring-0 font-serif text-sm leading-relaxed bg-transparent"
              placeholder="Your notes will appear here..."
            />
          ) : (
            <div className="prose prose-sm max-w-none font-serif">
              {notes.length > 0 ? (
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                  {allNotesContent}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Notes will appear here as you learn...</p>
                  <p className="text-xs mt-2">
                    Key concepts and examples will be automatically extracted from your conversation.
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function extractKeyPoints(content: string): string {
  const lines = content.split('\n');
  const keyPoints: string[] = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
      keyPoints.push(trimmed);
    } else if (trimmed.length > 30 && trimmed.endsWith('.')) {
      if (trimmed.includes('important') || trimmed.includes('key') || trimmed.includes('remember')) {
        keyPoints.push(`• ${trimmed}`);
      }
    }
  });
  
  return keyPoints.length > 0 ? keyPoints.join('\n') : content.substring(0, 200) + '...';
}

interface Note {
  content: string;
}

function formatNotesForExport(notes: Note[], topic: string | null): string {
  let content = '';
  
  if (topic) {
    content += `# ${topic}\n\n`;
  } else {
    content += `# Study Notes\n\n`;
  }
  
  content += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  content += `---\n\n`;
  
  notes.forEach((note, index) => {
    if (note.content.trim()) {
      content += `## Section ${index + 1}\n\n`;
      content += note.content + '\n\n';
    }
  });
  
  return content;
}
