import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from './utils';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        
        {(trend || trendValue) && (
          <div className="mt-4 flex items-center text-sm">
            {trend === 'up' && (
              <span className="flex items-center text-success font-medium">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {trendValue}
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center text-destructive font-medium">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                {trendValue}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="flex items-center text-muted-foreground font-medium">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
                {trendValue}
              </span>
            )}
            <span className="ml-2 text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
