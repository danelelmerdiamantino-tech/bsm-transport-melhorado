import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { cn } from '@/lib/utils';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  formattedValue: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  delay?: number;
  accentColor?: 'primary' | 'success' | 'warning' | 'destructive';
}

export function AnimatedStatCard({
  title,
  value,
  formattedValue,
  icon: Icon,
  trend,
  subtitle,
  delay = 0,
  accentColor = 'primary'
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  const trendConfig = {
    up: { color: 'text-success', icon: TrendingUp, bg: 'bg-success/10' },
    down: { color: 'text-destructive', icon: TrendingDown, bg: 'bg-destructive/10' },
    neutral: { color: 'text-muted-foreground', icon: null, bg: 'bg-muted/10' }
  };

  const accentConfig = {
    primary: 'from-primary/20 to-transparent',
    success: 'from-success/20 to-transparent',
    warning: 'from-warning/20 to-transparent',
    destructive: 'from-destructive/20 to-transparent'
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <NeonCard 
      glow 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        accentConfig[accentColor]
      )} />
      
      {/* Animated glow ring */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <NeonCardHeader className="relative flex flex-row items-center justify-between pb-2">
        <NeonCardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </NeonCardTitle>
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          `bg-${accentColor}/20`
        )}>
          <Icon className={cn("h-5 w-5", `text-${accentColor}`)} />
        </div>
      </NeonCardHeader>
      
      <NeonCardContent className="relative">
        <div className="text-3xl font-bold font-display neon-text tracking-tight">
          {formattedValue}
        </div>
        
        {subtitle && (
          <div className={cn(
            "flex items-center gap-1.5 mt-2 text-xs",
            trend ? trendConfig[trend].color : 'text-muted-foreground'
          )}>
            {TrendIcon && (
              <span className={cn("p-1 rounded-full", trendConfig[trend!].bg)}>
                <TrendIcon className="h-3 w-3" />
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        )}
      </NeonCardContent>
    </NeonCard>
  );
}
