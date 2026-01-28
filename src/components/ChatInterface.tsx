import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { formatMZN } from '@/utils/format';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou o assistente da BSM Transport. Digite comandos como:\n\n• "receita 5000 Pompilio"\n• "despesa combustível 1500 Tito"\n• "salário John 8000"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addRevenue, addExpense, addSalary, getCompanyFinancials } = useFinance();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-finance-command`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      const result = await response.json();

      if (result.error) {
        addMessage('assistant', result.response || 'Desculpe, ocorreu um erro.');
        return;
      }

      // Map Portuguese expense types to English
      const mapExpenseType = (pt: string): 'fuel' | 'maintenance' | 'fines' | 'other' => {
        const map: Record<string, 'fuel' | 'maintenance' | 'fines' | 'other'> = {
          'combustível': 'fuel',
          'combustivel': 'fuel',
          'manutenção': 'maintenance',
          'manutencao': 'maintenance',
          'multas': 'fines',
          'multa': 'fines',
          'outros': 'other',
          'outro': 'other'
        };
        return map[pt?.toLowerCase()] || 'other';
      };

      // Process the command based on type
      if (result.understood && result.data) {
        const { type, data } = result;
        const today = new Date().toISOString().split('T')[0];

        switch (type) {
          case 'revenue':
            if (data.driver && data.amount) {
              addRevenue({
                driverId: data.driver.toLowerCase(),
                amount: data.amount,
                date: today
              });
              toast.success(`Receita de ${formatMZN(data.amount)} registrada!`);
            }
            break;

          case 'expense':
            if (data.driver && data.amount) {
              addExpense({
                driverId: data.driver.toLowerCase(),
                type: mapExpenseType(data.expenseType),
                amount: data.amount,
                date: today,
                description: data.description || 'Via chat'
              });
              toast.success(`Despesa de ${formatMZN(data.amount)} registrada!`);
            }
            break;

          case 'salary':
            if (data.driver && data.amount) {
              addSalary({
                driverId: data.driver.toLowerCase(),
                amount: data.amount,
                date: today
              });
              toast.success(`Salário de ${formatMZN(data.amount)} registrado!`);
            }
            break;

          case 'question':
            // For questions about finances, add summary info
            const financials = getCompanyFinancials();
            const summary = `📊 Resumo atual:\n• Receitas: ${formatMZN(financials.totalRevenue)}\n• Despesas: ${formatMZN(financials.totalExpenses)}\n• Salários: ${formatMZN(financials.totalSalaries)}\n• Lucro: ${formatMZN(financials.totalProfit)}`;
            addMessage('assistant', result.response + '\n\n' + summary);
            return;
        }
      }

      addMessage('assistant', result.response);

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', 'Desculpe, ocorreu um erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite um comando... ex: receita 5000 Pompilio"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
