import * as React from "react";
import { cn } from "@/lib/utils";

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning";
  glow?: boolean;
  animate?: boolean;
}

const NeonCard = React.forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, variant = "default", glow = false, animate = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "border-primary/30 hover:border-primary/60",
      success: "border-success/30 hover:border-success/60",
      danger: "border-destructive/30 hover:border-destructive/60",
      warning: "border-warning/30 hover:border-warning/60",
    };

    const glowClasses = {
      default: glow ? "shadow-[0_0_20px_hsl(180_100%_50%/0.3)]" : "",
      success: glow ? "shadow-[0_0_20px_hsl(145_80%_45%/0.3)]" : "",
      danger: glow ? "shadow-[0_0_20px_hsl(0_84%_60%/0.3)]" : "",
      warning: glow ? "shadow-[0_0_20px_hsl(45_100%_50%/0.3)]" : "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card p-6 gradient-card transition-all duration-300",
          variantClasses[variant],
          glowClasses[variant],
          animate && "animate-pulse-glow",
          "hover-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
NeonCard.displayName = "NeonCard";

const NeonCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  )
);
NeonCardHeader.displayName = "NeonCardHeader";

const NeonCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-display text-lg font-semibold tracking-wide text-foreground", className)}
      {...props}
    />
  )
);
NeonCardTitle.displayName = "NeonCardTitle";

const NeonCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />
);
NeonCardContent.displayName = "NeonCardContent";

export { NeonCard, NeonCardHeader, NeonCardTitle, NeonCardContent };
