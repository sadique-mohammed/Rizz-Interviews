/**
 * Shared style utilities — single source of truth for badge/status classes.
 * Used by: interview canvas, history list, history detail, dashboard cards.
 */

/** Tailwind classes for difficulty badge (border + bg + text) */
export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'medium':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    case 'hard':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}

/** Timer text color class based on remaining seconds */
export function timerColor(seconds: number): string {
  if (seconds <= 60) return 'text-red-500 font-bold';
  if (seconds <= 300) return 'text-amber-500 font-bold';
  return 'text-gray-700 font-semibold';
}

/** Timer progress bar background class based on remaining seconds */
export function progressColor(seconds: number): string {
  if (seconds <= 60) return 'bg-red-500';
  if (seconds <= 300) return 'bg-amber-500';
  return 'bg-brand';
}

/** Tailwind classes for status badge (border + bg + text) */
export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'border-green-200 bg-green-50 text-green-700 hover:bg-green-50';
    case 'abandoned':
      return 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50';
    case 'in_progress':
    default:
      return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50';
  }
}

/** Formatted text for status label */
export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Completed';
    case 'abandoned':
      return 'Abandoned';
    case 'in_progress':
    default:
      return 'In Progress';
  }
}
