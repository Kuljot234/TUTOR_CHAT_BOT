"use client";

import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AIVoiceInputDemo() {
  const [recordings, setRecordings] = useState<{ duration: number; timestamp: Date }[]>([]);

  const handleStop = (duration: number) => {
    if (duration > 0) {
      setRecordings(prev => [...prev.slice(-4), { duration, timestamp: new Date() }]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Voice Input</CardTitle>
          <CardDescription>
            Click the microphone to start/stop recording. Watch the animated visualizer respond to your voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIVoiceInput 
            onStart={() => console.log('Recording started')}
            onStop={handleStop}
          />
          
          {recordings.length > 0 && (
            <div className="mt-8 space-y-2">
              <h4 className="text-sm font-semibold">Recent Recordings</h4>
              <div className="space-y-1">
                {recordings.map((recording, index) => (
                  <div 
                    key={index}
                    className="text-xs text-muted-foreground flex items-center justify-between p-2 rounded bg-muted/50"
                  >
                    <span>Recording #{recordings.length - index}</span>
                    <span>{formatDuration(recording.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Demo Mode</CardTitle>
          <CardDescription>
            Automatic demonstration mode that cycles through recording states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIVoiceInput 
            demoMode={true}
            demoInterval={3000}
            onStart={() => console.log('Demo recording started')}
            onStop={() => console.log('Demo recording stopped')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
