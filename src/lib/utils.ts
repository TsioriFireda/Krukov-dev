import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAriary(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 Ar';
  return new Intl.NumberFormat('fr-MG').format(Math.round(amount)) + ' Ar';
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isOlderThanYears(dateStr: string, years: number): boolean {
  if (!dateStr) return false;
  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return false;
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
  return targetDate < cutoffDate;
}

export function getArchiveCutoffDate(years: number): string {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return cutoff.toISOString().split('T')[0];
}
