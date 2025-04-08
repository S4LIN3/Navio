import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

/**
 * Format a date for display
 * @param date The date to format
 * @param includeTime Whether to include the time in the format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined, includeTime: boolean = false): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return includeTime
      ? `Today, ${format(dateObj, 'h:mm a')}`
      : 'Today';
  }
  
  if (isTomorrow(dateObj)) {
    return includeTime
      ? `Tomorrow, ${format(dateObj, 'h:mm a')}`
      : 'Tomorrow';
  }
  
  return includeTime
    ? format(dateObj, 'MMM d, yyyy, h:mm a')
    : format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a date as a relative time (e.g., "3 days ago")
 * @param date The date to format
 * @returns Formatted relative date string
 */
export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Get the day of week for a date
 * @param date The date
 * @returns The day of week (e.g., "Mon", "Tue")
 */
export function getDayOfWeek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEE');
}

/**
 * Check if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export function isPastDate(date: Date | string | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}
