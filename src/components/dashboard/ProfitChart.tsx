import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { formatMZN } from '@/utils/format';
import { DriverFinancials } from '@/types';
import { TrendingUp } from 'lucide-react';

interface ProfitChartProps {
  driversStats: DriverFinancials[];
}

export function ProfitChart({ driversStats }: ProfitChartProps) {
  const data = useMemo(() => 
    driversStats.map(d => ({
      name: d.driver.name,
      lucro: d.profit,
      receita: d.totalRevenue,
      despesas: d.totalExpenses,
    })), [driversStats]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-primary/50 rounded-xl p-4 shadow-2xl neon-border">
        <p className="font-display font-bold text-primary mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Lucro:</span>
            <span className={entry.value >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              {formatMZN(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <NeonCard glow className="animate-fade-in">
      <NeonCardHeader className="flex flex-row items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <NeonCardTitle>Lucro por Motorista</NeonCardTitle>
      </NeonCardHeader>
      <NeonCardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 80%, 55%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(145, 80%, 35%)" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(0, 84%, 40%)" stopOpacity={0.8} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis 
              dataKey="name" 
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
            <ReferenceLine y={0} stroke="hsl(180, 50%, 30%)" strokeDasharray="3 3" />
            <Bar 
              dataKey="lucro" 
              radius={[8, 8, 0, 0]}
              filter="url(#glow)"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.lucro >= 0 ? 'url(#profitGradient)' : 'url(#lossGradient)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </NeonCardContent>
    </NeonCard>
  );
}
