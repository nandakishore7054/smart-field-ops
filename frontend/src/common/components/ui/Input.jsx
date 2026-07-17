import React from 'react';
import { cn } from './utils';

export const Input = React.forwardRef(({
  className,
  error,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
          {rightIcon}
        </div>
      )}
      {error && typeof error === 'string' && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
