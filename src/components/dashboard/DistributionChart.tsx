import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { formatMZN } from '@/utils/format';
import { PieChart as PieIcon } from 'lucide-react';

interface DistributionChartProps {
  totalRevenue: number;
  totalExpenses: number;
  totalSalaries: number;
}

const COLORS = [
  { name: 'Receitas', gradient: 'url(#revenueGradient)', color: 'hsl(145, 80%, 45%)' },
  { name: 'Despesas', gradient: 'url(#expensesGradient)', color: 'hsl(0, 84%, 60%)' },
  { name: 'Salários', gradient: 'url(#salariesGradient)', color: 'hsl(45, 100%, 50%)' },
];

export function DistributionChart({ totalRevenue, totalExpenses, totalSalaries }: DistributionChartProps) {
  const data = useMemo(() => [
    { name: 'Receitas', value: totalRevenue },
    { name: 'Despesas', value: totalExpenses },
    { name: 'Salários', value: totalSalaries },
  ].filter(item => item.value > 0), [totalRevenue, totalExpenses, totalSalaries]);

  const total = totalRevenue + totalExpenses + totalSalaries;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    
    const item = payload[0];
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-primary/50 rounded-xl p-4 shadow-2xl neon-border">
        <p className="font-display font-bold text-primary mb-1">{item.name}</p>
        <p className="text-lg font-semibold">{formatMZN(item.value)}</p>
        <p className="text-xs text-muted-foreground">{percentage}% do total</p>
      </div>
    );
  };

  const renderCustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full animate-pulse" 
            style={{ backgroundColor: COLORS[index]?.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  if (data.length === 0) return null;

  return (
    <NeonCard glow className="animate-fade-in">
      <NeonCardHeader className="flex flex-row items-center gap-2">
        <PieIcon className="h-5 w-5 text-primary" />
        <NeonCardTitle>Distribuição Financeira</NeonCardTitle>
      </NeonCardHeader>
      <NeonCardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(145, 80%, 55%)" />
                <stop offset="100%" stopColor="hsl(145, 80%, 35%)" />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 65%)" />
                <stop offset="100%" stopColor="hsl(0, 84%, 45%)" />
              </linearGradient>
              <linearGradient id="salariesGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(45, 100%, 55%)" />
                <stop offset="100%" stopColor="hsl(45, 100%, 40%)" />
              </linearGradient>
              <filter id="pieGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(222, 47%, 6%)"
              filter="url(#pieGlow)"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]?.gradient || COLORS[0].gradient}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderCustomLegend} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-40px' }}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-display font-bold neon-text">{formatMZN(total)}</p>
          </div>
        </div>
      </NeonCardContent>
    </NeonCard>
  );
}
