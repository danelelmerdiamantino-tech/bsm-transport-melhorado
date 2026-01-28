import { Users, Truck, TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { formatMZN } from '@/utils/format';
import { cn } from '@/lib/utils';

interface DriverCardProps {
  name: string;
  vehicle: string;
  revenue: number;
  expenses: number;
  salary: number;
  profit: number;
  index: number;
}

export function DriverCard({ 
  name, 
  vehicle, 
  revenue, 
  expenses, 
  salary, 
  profit,
  index 
}: DriverCardProps) {
  const isProfitable = profit >= 0;
  const profitPercentage = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  
  return (
    <NeonCard 
      variant={isProfitable ? 'success' : 'danger'} 
      glow
      className={cn(
        "relative overflow-hidden transition-all duration-500 hover:scale-[1.02]",
        "animate-slide-in-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        isProfitable 
          ? "bg-gradient-to-br from-success via-transparent to-transparent"
          : "bg-gradient-to-br from-destructive via-transparent to-transparent"
      )} />
      
      {/* Animated border glow */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-50",
        isProfitable ? "animate-glow-pulse" : ""
      )} style={{
        boxShadow: isProfitable 
          ? '0 0 30px hsl(145 80% 45% / 0.3)' 
          : '0 0 30px hsl(0 84% 60% / 0.3)'
      }} />

      <NeonCardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <NeonCardTitle className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isProfitable ? "bg-success/20" : "bg-destructive/20"
            )}>
              <Users className={cn(
                "h-4 w-4",
                isProfitable ? "text-success" : "text-destructive"
              )} />
            </div>
            <span className="font-display">{name}</span>
          </NeonCardTitle>
          <span className={cn(
            "text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1",
            isProfitable 
              ? "bg-success/20 text-success border border-success/30" 
              : "bg-destructive/20 text-destructive border border-destructive/30"
          )}>
            {isProfitable ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isProfitable ? 'LUCRO' : 'PREJUÍZO'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Truck className="h-3 w-3" /> {vehicle}
        </p>
      </NeonCardHeader>
      
      <NeonCardContent className="relative space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/50 rounded-lg p-3 border border-success/20">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-muted-foreground text-xs">Receita</p>
            </div>
            <p className="font-semibold text-success text-lg">{formatMZN(revenue)}</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-destructive/20">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <p className="text-muted-foreground text-xs">Despesas</p>
            </div>
            <p className="font-semibold text-destructive text-lg">{formatMZN(expenses)}</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-warning/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="h-3 w-3 text-warning" />
              <p className="text-muted-foreground text-xs">Salário</p>
            </div>
            <p className="font-semibold text-warning text-lg">{formatMZN(salary)}</p>
          </div>
          <div className={cn(
            "bg-card/50 rounded-lg p-3 border",
            isProfitable ? "border-success/30" : "border-destructive/30"
          )}>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className={cn("h-3 w-3", isProfitable ? "text-success" : "text-destructive")} />
              <p className="text-muted-foreground text-xs">Lucro</p>
            </div>
            <p className={cn(
              "font-bold text-lg",
              isProfitable ? "text-success neon-text" : "text-destructive"
            )}>
              {formatMZN(profit)}
            </p>
          </div>
        </div>
        
        {/* Profit margin indicator */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground">Margem de lucro</span>
            <span className={cn(
              "font-semibold",
              isProfitable ? "text-success" : "text-destructive"
            )}>
              {profitPercentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isProfitable 
                  ? "bg-gradient-to-r from-success to-success/60" 
                  : "bg-gradient-to-r from-destructive to-destructive/60"
              )}
              style={{ 
                width: `${Math.min(Math.abs(Number(profitPercentage)), 100)}%`,
                boxShadow: isProfitable 
                  ? '0 0 10px hsl(145 80% 45% / 0.5)' 
                  : '0 0 10px hsl(0 84% 60% / 0.5)'
              }}
            />
          </div>
        </div>
      </NeonCardContent>
    </NeonCard>
  );
}
