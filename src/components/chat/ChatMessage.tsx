import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 bot-avatar-glow neon-border">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-300",
          isUser
            ? "chat-bubble-user text-primary-foreground"
            : "chat-bubble-assistant"
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <span className={cn(
          "text-[10px] mt-1 block opacity-60",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0 neon-border border-secondary/50">
          <User className="w-5 h-5 text-secondary" />
        </div>
      )}
    </div>
  );
}
