import React from 'react';
import { cn } from './utils';

export const Card = React.forwardRef(({ className, variant = 'default', as: Component = 'div', ...props }, ref) => {
  const variants = {
    default: "bg-surface border-border",
    elevated: "bg-surface border-transparent shadow-card",
    interactive: "bg-surface border-border hover:border-primary/50 hover:shadow-card transition-all cursor-pointer",
  };

  return (
    <Component
      ref={ref}
      className={cn("rounded-xl border text-foreground shadow-sm overflow-hidden", variants[variant], className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
