import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines tailwind classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
