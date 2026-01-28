import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { formatMZN } from '@/utils/format';
import { cn } from '@/lib/utils';

interface PeriodStatsProps {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export function PeriodStats({ dailyRevenue, weeklyRevenue, monthlyRevenue }: PeriodStatsProps) {
  const periods = [
    { 
      label: 'Hoje', 
      value: dailyRevenue, 
      icon: Calendar,
      gradient: 'from-primary/30 to-primary/5',
      delay: 0
    },
    { 
      label: 'Esta Semana', 
      value: weeklyRevenue, 
      icon: CalendarDays,
      gradient: 'from-secondary/30 to-secondary/5',
      delay: 100
    },
    { 
      label: 'Este Mês', 
      value: monthlyRevenue, 
      icon: CalendarRange,
      gradient: 'from-accent/30 to-accent/5',
      delay: 200
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {periods.map((period, index) => (
        <NeonCard 
          key={period.label} 
          glow 
          className={cn(
            "relative overflow-hidden group animate-slide-in-up",
            "hover:scale-[1.02] transition-transform duration-300"
          )}
          style={{ animationDelay: `${period.delay}ms` }}
        >
          {/* Animated background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300",
            "group-hover:opacity-80",
            period.gradient
          )} />
          
          {/* Floating particles effect */}
          <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <period.icon className="h-16 w-16 text-primary animate-float" />
          </div>

          <NeonCardHeader className="relative flex flex-row items-center gap-2 pb-2">
            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <period.icon className="h-4 w-4 text-primary" />
            </div>
            <NeonCardTitle className="text-sm">{period.label}</NeonCardTitle>
          </NeonCardHeader>
          
          <NeonCardContent className="relative">
            <p className="text-3xl font-bold font-display text-success neon-text">
              {formatMZN(period.value)}
            </p>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-success/50 rounded-full animate-pulse"
                style={{ 
                  width: monthlyRevenue > 0 ? `${(period.value / monthlyRevenue) * 100}%` : '0%',
                  boxShadow: '0 0 10px hsl(145 80% 45% / 0.5)'
                }}
              />
            </div>
          </NeonCardContent>
        </NeonCard>
      ))}
    </div>
  );
}
