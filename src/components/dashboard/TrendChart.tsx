import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { formatMZN } from '@/utils/format';
import { Activity } from 'lucide-react';
import { Revenue, Expense } from '@/types';
import { format, subDays, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrendChartProps {
  revenues: Revenue[];
  expenses: Expense[];
}

export function TrendChart({ revenues, expenses }: TrendChartProps) {
  const data = useMemo(() => {
    const days = 7;
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayRevenue = revenues
        .filter(r => {
          const rDate = parseISO(r.date);
          return isWithinInterval(rDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, r) => sum + r.amount, 0);
      
      const dayExpenses = expenses
        .filter(e => {
          const eDate = parseISO(e.date);
          return isWithinInterval(eDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      result.push({
        date: format(date, 'EEE', { locale: ptBR }),
        fullDate: format(date, 'dd/MM', { locale: ptBR }),
        receita: dayRevenue,
        despesas: dayExpenses,
        lucro: dayRevenue - dayExpenses,
      });
    }
    
    return result;
  }, [revenues, expenses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-primary/50 rounded-xl p-4 shadow-2xl neon-border">
        <p className="font-display font-bold text-primary mb-2">{payload[0]?.payload?.fullDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className={
              entry.name === 'receita' ? 'text-success font-semibold' :
              entry.name === 'despesas' ? 'text-destructive font-semibold' :
              entry.value >= 0 ? 'text-primary font-semibold' : 'text-destructive font-semibold'
            }>
              {formatMZN(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const hasData = data.some(d => d.receita > 0 || d.despesas > 0);

  if (!hasData) return null;

  return (
    <NeonCard glow className="animate-fade-in lg:col-span-2">
      <NeonCardHeader className="flex flex-row items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <NeonCardTitle>Tendência dos Últimos 7 Dias</NeonCardTitle>
      </NeonCardHeader>
      <NeonCardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 80%, 50%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(145, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <filter id="areaGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(180, 30%, 20%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              stroke="hsl(180, 30%, 50%)" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'hsl(180, 30%, 30%)' }}
            />
            <YAxis 
              stroke="hsl(180, 30%, 50%)" 
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={{ stroke: 'hsl(180, 30%, 30%)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(145, 80%, 50%)" 
              strokeWidth={3}
              fill="url(#revenueAreaGradient)"
              filter="url(#areaGlow)"
            />
            <Area 
              type="monotone" 
              dataKey="despesas" 
              stroke="hsl(0, 84%, 60%)" 
              strokeWidth={3}
              fill="url(#expensesAreaGradient)"
              filter="url(#areaGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </NeonCardContent>
    </NeonCard>
  );
}
