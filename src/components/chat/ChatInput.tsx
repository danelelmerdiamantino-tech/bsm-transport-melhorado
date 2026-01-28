import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-primary/20 glass-effect">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite um comando... ex: receita 5000 Pompilio"
            className="pl-10 pr-4 h-12 chat-input-glow bg-card/50 border-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={onSend} 
          disabled={!value.trim() || isLoading}
          size="icon"
          className="h-12 w-12 rounded-xl send-button-glow bg-primary hover:bg-primary/90"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {['ajuda', 'resumo', 'motoristas', 'receitas', 'despesas'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => onChange(cmd === 'motoristas' || cmd === 'receitas' || cmd === 'despesas' ? `listar ${cmd}` : cmd)}
            className="px-3 py-1.5 text-xs rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover-glow"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
