import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center bot-avatar-glow neon-border">
        <Bot className="w-5 h-5 text-primary animate-pulse" />
      </div>
      <div className="chat-bubble-assistant rounded-2xl px-5 py-4">
        <div className="flex gap-1.5 items-center">
          <div className="typing-dot animate-typing-dot" />
          <div className="typing-dot animate-typing-dot" />
          <div className="typing-dot animate-typing-dot" />
        </div>
      </div>
    </div>
  );
}
