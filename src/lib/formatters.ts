/**
 * Shared formatting utilities — single source of truth.
 * Used by: interview canvas, history list, history detail, results page.
 */

/** Format seconds as MM:SS (e.g., 1500 → "25:00") */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Format a date string as a full readable date (e.g., "Monday, February 22, 2026") */
export function formatDateFull(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format a date string as relative time (e.g., "Yesterday", "3 days ago", "Feb 22") */
export function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}