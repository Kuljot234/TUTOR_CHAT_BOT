import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChunkToCharacterDemo = dynamic(() => import("@/components/demo/animated-text-demo").then(mod => ({ default: mod.ChunkToCharacterDemo })), {
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-lg" />,
});

const ChunkToWordDemo = dynamic(() => import("@/components/demo/animated-text-demo").then(mod => ({ default: mod.ChunkToWordDemo })), {
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-lg" />,
});

const AIVoiceInputDemo = dynamic(() => import("@/components/demo/ai-voice-input-demo").then(mod => ({ default: mod.AIVoiceInputDemo })), {
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-lg" />,
});

export default function DemoPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-16">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbot
          </Button>
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Component Showcase</h1>
        <p className="text-lg text-muted-foreground">
          These components are integrated into the main chatbot interface
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Visit the <Link href="/" className="text-primary underline">chatbot</Link> to see them in action!
        </p>
      </div>

      <section>
        <h2 className="text-3xl font-bold mb-6">AI Voice Input</h2>
        <p className="text-muted-foreground mb-4">
          Integrated into the chat input area with animated visualizer
        </p>
        <AIVoiceInputDemo />
      </section>
      
      <div className="border-t my-16" />

      <section>
        <h2 className="text-3xl font-bold mb-6">Animated Text</h2>
        <p className="text-muted-foreground mb-4">
          Tutor responses animate character-by-character for enhanced readability
        </p>
        <div className="space-y-16">
          <ChunkToCharacterDemo />
          
          <div className="border-t my-8" />
          
          <ChunkToWordDemo />
        </div>
      </section>
    </div>
  );
}
