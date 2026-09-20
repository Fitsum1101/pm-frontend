import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Safely merge Tailwind class strings (dedupes conflicting utilities).
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
