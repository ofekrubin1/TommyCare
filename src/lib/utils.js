import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const byTimeDesc = (key = 'time') => (a, b) => (b[key] || '').localeCompare(a[key] || '');
export const byTimeAsc = (key = 'time') => (a, b) => (a[key] || '').localeCompare(b[key] || '');

export const num = (n, digits = 1) => (n || 0).toLocaleString('he-IL', { maximumFractionDigits: digits });
