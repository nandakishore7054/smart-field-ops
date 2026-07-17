import React from 'react';
import { cn } from './utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-secondary", className)}
      {...props}
    />
  );
};
