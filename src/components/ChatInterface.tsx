import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatMZN } from '@/utils/format';
import { toast } from 'sonner';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

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

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto rounded-2xl overflow-hidden neon-border bg-card/50 backdrop-blur-sm">
      <ChatHeader />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <ChatMessage key={msg.id} message={msg} index={index} />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
