/**
 * Utility functions for formatting and filtering job posting dates.
 */

export type DateFilterOption = 'all' | 'today' | 'yesterday' | 'past3days' | 'pastweek' | 'pastmonth' | 'custom';

/**
 * Formats a date string or timestamp into a friendly, professional label:
 * - "Today" or "X hours ago"
 * - "Yesterday"
 * - "X days ago" (within 30 days)
 * - Standard short date e.g. "Oct 15, 2026"
 */
export function formatPostedDate(dateStr?: string | null): string {
  if (!dateStr) return 'Recently';

  try {
    const posted = new Date(dateStr);
    if (isNaN(posted.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();

    // Future date protection (clock skew)
    if (diffMs < 0) {
      return 'Just now';
    }

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      if (diffMin <= 1) return 'Just now';
      return `${diffMin}m ago`;
    }

    if (diffHours < 24) {
      // Check if it's strictly calendar yesterday or today
      const isToday = now.toDateString() === posted.toDateString();
      if (isToday) {
        return `${diffHours}h ago`;
      }
      return 'Yesterday';
    }

    if (diffDays === 1) {
      return 'Yesterday';
    }

    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    }

    // Older than a month: format as "MMM D, YYYY"
    return posted.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: posted.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Checks if a given job ISO date string falls into the requested date filter.
 */
export function matchesDateFilter(
  dateStr?: string | null,
  filter?: DateFilterOption,
  customStart?: string,
  customEnd?: string
): boolean {
  if (!filter || filter === 'all') return true;
  if (!dateStr) return false;

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetTime = targetDate.getTime();

  switch (filter) {
    case 'today':
      return targetTime >= startOfToday;

    case 'yesterday': {
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      return targetTime >= startOfYesterday && targetTime < startOfToday;
    }

    case 'past3days': {
      const startOf3DaysAgo = startOfToday - 2 * 24 * 60 * 60 * 1000;
      return targetTime >= startOf3DaysAgo;
    }

    case 'pastweek': {
      const startOf7DaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
      return targetTime >= startOf7DaysAgo;
    }

    case 'pastmonth': {
      const startOf30DaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;
      return targetTime >= startOf30DaysAgo;
    }

    case 'custom': {
      let valid = true;
      if (customStart) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        if (!isNaN(start.getTime())) {
          valid = valid && targetTime >= start.getTime();
        }
      }
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        if (!isNaN(end.getTime())) {
          valid = valid && targetTime <= end.getTime();
        }
      }
      return valid;
    }

    default:
      return true;
  }
}
