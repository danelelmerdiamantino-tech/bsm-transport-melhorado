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

// Simple markdown-like formatting
function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    // Bold text **text**
    let formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>');
    
    // Check if it's a list item
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    
    return (
      <span 
        key={i} 
        className={cn(isBullet && "block ml-2")}
        dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }}
      />
    );
  });
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
          "max-w-[85%] rounded-2xl px-4 py-3 transition-all duration-300",
          isUser
            ? "chat-bubble-user text-primary-foreground"
            : "chat-bubble-assistant"
        )}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed space-y-0.5">
          {formatContent(message.content)}
        </div>
        <span className={cn(
          "text-[10px] mt-2 block opacity-60",
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
