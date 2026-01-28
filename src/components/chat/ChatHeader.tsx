import { MessageCircle, Zap } from 'lucide-react';

export function ChatHeader() {
  return (
    <div className="p-4 border-b border-primary/20 glass-effect">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-border animate-glow-pulse">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-success-foreground" />
          </div>
        </div>
        <div>
          <h2 className="font-display font-bold text-lg neon-text">Assistente BSM</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Online • Pronto para ajudar
          </p>
        </div>
      </div>
    </div>
  );
}
