import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatMZN } from '@/utils/format';
import { toast } from 'sonner';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { DRIVERS } from '@/types';

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
      content: 'Olá! 👋 Sou o assistente da BSM Transport.\n\nDigite "ajuda" para ver todos os comandos disponíveis, ou experimente:\n\n• "receita 5000 Pompilio"\n• "despesa combustível 1500 Tito"\n• "listar motoristas"\n• "resumo"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    addRevenue, addExpense, addSalary, 
    getCompanyFinancials, getAllDriversFinancials,
    revenues, expenses, salaries 
  } = useFinance();

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

  const formatDriversList = () => {
    return DRIVERS.map(d => `🚗 **${d.name}** → ${d.vehicle}`).join('\n');
  };

  const formatRevenuesList = () => {
    if (revenues.length === 0) return '📭 Nenhuma receita registrada ainda.';
    
    const recent = revenues.slice(-5).reverse();
    const total = revenues.reduce((sum, r) => sum + r.amount, 0);
    
    const list = recent.map(r => {
      const driver = DRIVERS.find(d => d.id === r.driverId);
      return `💰 ${formatMZN(r.amount)} - ${driver?.name || r.driverId} (${r.date})`;
    }).join('\n');
    
    return `📊 **Últimas 5 receitas:**\n${list}\n\n**Total geral:** ${formatMZN(total)}`;
  };

  const formatExpensesList = () => {
    if (expenses.length === 0) return '📭 Nenhuma despesa registrada ainda.';
    
    const recent = expenses.slice(-5).reverse();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const expenseTypeEmojis: Record<string, string> = {
      fuel: '⛽',
      maintenance: '🔧',
      fines: '🚨',
      other: '📦'
    };
    
    const list = recent.map(e => {
      const driver = DRIVERS.find(d => d.id === e.driverId);
      const emoji = expenseTypeEmojis[e.type] || '📦';
      return `${emoji} ${formatMZN(e.amount)} - ${driver?.name || e.driverId} (${e.date})`;
    }).join('\n');
    
    return `📊 **Últimas 5 despesas:**\n${list}\n\n**Total geral:** ${formatMZN(total)}`;
  };

  const formatSalariesList = () => {
    if (salaries.length === 0) return '📭 Nenhum salário registrado ainda.';
    
    const recent = salaries.slice(-5).reverse();
    const total = salaries.reduce((sum, s) => sum + s.amount, 0);
    
    const list = recent.map(s => {
      const driver = DRIVERS.find(d => d.id === s.driverId);
      return `💵 ${formatMZN(s.amount)} - ${driver?.name || s.driverId} (${s.date})`;
    }).join('\n');
    
    return `📊 **Últimos 5 salários:**\n${list}\n\n**Total geral:** ${formatMZN(total)}`;
  };

  const formatSummary = () => {
    const financials = getCompanyFinancials();
    const driversStats = getAllDriversFinancials();
    
    const profitEmoji = financials.totalProfit >= 0 ? '✅' : '❌';
    const profitStatus = financials.totalProfit >= 0 ? 'LUCRATIVA' : 'EM PREJUÍZO';
    
    let summary = `📊 **RESUMO FINANCEIRO BSM TRANSPORT**\n\n`;
    summary += `💰 Receitas: ${formatMZN(financials.totalRevenue)}\n`;
    summary += `💸 Despesas: ${formatMZN(financials.totalExpenses)}\n`;
    summary += `💵 Salários: ${formatMZN(financials.totalSalaries)}\n`;
    summary += `${profitEmoji} **Lucro: ${formatMZN(financials.totalProfit)}** (${profitStatus})\n\n`;
    
    summary += `📅 **Por Período:**\n`;
    summary += `• Hoje: ${formatMZN(financials.dailyRevenue)}\n`;
    summary += `• Esta semana: ${formatMZN(financials.weeklyRevenue)}\n`;
    summary += `• Este mês: ${formatMZN(financials.monthlyRevenue)}\n\n`;
    
    summary += `👥 **Por Motorista:**\n`;
    driversStats.forEach(d => {
      const emoji = d.profit >= 0 ? '🟢' : '🔴';
      summary += `${emoji} ${d.driver.name}: ${formatMZN(d.profit)}\n`;
    });
    
    return summary;
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

      if (result.error && !result.response) {
        addMessage('assistant', result.response || '❌ Ocorreu um erro. Tente novamente.');
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

      const today = new Date().toISOString().split('T')[0];

      switch (result.type) {
        case 'revenue':
          if (result.data?.driver && result.data?.amount) {
            addRevenue({
              driverId: result.data.driver.toLowerCase(),
              amount: result.data.amount,
              date: today
            });
            toast.success(`Receita de ${formatMZN(result.data.amount)} registrada!`);
          }
          addMessage('assistant', result.response);
          break;

        case 'expense':
          if (result.data?.driver && result.data?.amount) {
            addExpense({
              driverId: result.data.driver.toLowerCase(),
              type: mapExpenseType(result.data.expenseType),
              amount: result.data.amount,
              date: today,
              description: result.data.description || 'Via chat'
            });
            toast.success(`Despesa de ${formatMZN(result.data.amount)} registrada!`);
          }
          addMessage('assistant', result.response);
          break;

        case 'salary':
          if (result.data?.driver && result.data?.amount) {
            addSalary({
              driverId: result.data.driver.toLowerCase(),
              amount: result.data.amount,
              date: today
            });
            toast.success(`Salário de ${formatMZN(result.data.amount)} registrado!`);
          }
          addMessage('assistant', result.response);
          break;

        case 'list_drivers':
          addMessage('assistant', `👥 **Motoristas da BSM Transport:**\n\n${formatDriversList()}`);
          break;

        case 'list_revenues':
          addMessage('assistant', formatRevenuesList());
          break;

        case 'list_expenses':
          addMessage('assistant', formatExpensesList());
          break;

        case 'list_salaries':
          addMessage('assistant', formatSalariesList());
          break;

        case 'summary':
          addMessage('assistant', formatSummary());
          break;

        case 'help':
          const helpText = `📚 **COMANDOS DISPONÍVEIS:**

💰 **Registrar Receita:**
• "receita 5000 Pompilio"
• "entrada 3000 John"

💸 **Registrar Despesa:**
• "despesa combustível 1500 Tito"
• "gasto manutenção 2000 Pompilio"

💵 **Registrar Salário:**
• "salário John 8000"
• "pagar Tito 7500"

📋 **Listar Dados:**
• "listar motoristas"
• "mostrar receitas"
• "ver despesas"
• "listar salários"

📊 **Resumo:**
• "resumo" ou "balanço"
• "como está a empresa?"
• "quanto lucro temos?"

👥 **Motoristas:**
${formatDriversList()}`;
          addMessage('assistant', helpText);
          break;

        default:
          addMessage('assistant', result.response || 'Digite "ajuda" para ver os comandos disponíveis.');
      }

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', '❌ Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto rounded-2xl overflow-hidden neon-border bg-card/50 backdrop-blur-sm">
      <ChatHeader />
      
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
