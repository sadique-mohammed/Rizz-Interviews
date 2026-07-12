/**
 * Shared style utilities — single source of truth for badge/status classes.
 * Used by: interview canvas, history list, history detail, dashboard cards.
 */

export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'medium':
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    case 'hard':
      return 'border border-destructive/20 bg-destructive/10 text-destructive';
    default:
      return 'surface-muted text-gray-700';
  }
}

export function timerColor(seconds: number): string {
  if (seconds <= 60) return 'text-destructive font-bold';
  if (seconds <= 300) return 'text-brand-secondary font-bold';
  return 'text-gray-700 font-semibold';
}

export function progressColor(seconds: number): string {
  if (seconds <= 60) return 'bg-destructive';
  if (seconds <= 300) return 'bg-brand-secondary';
  return 'bg-brand';
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'badge-brand-soft';
    case 'abandoned':
      return 'surface-muted text-gray-500';
    case 'in_progress':
    default:
      return 'surface-accent text-brand-dark';
  }
}

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
