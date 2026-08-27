import type { ProjectStatus, TaskStatus, Priority } from '../types';

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, opts);
}

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  if (date < today) return 'Overdue';
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const projectStatusMeta: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  'not-started': { label: 'Not Started', color: '#8E8E93', bg: 'rgba(142,142,147,0.12)' },
  'in-progress': { label: 'In Progress', color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
  'at-risk': { label: 'At Risk', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
  completed: { label: 'Completed', color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
};

export const taskStatusMeta: Record<TaskStatus, { label: string }> = {
  todo: { label: 'To Do' },
  'in-progress': { label: 'In Progress' },
  review: { label: 'Review' },
  done: { label: 'Done' },
};

export const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#8E8E93' },
  medium: { label: 'Medium', color: '#0A84FF' },
  high: { label: 'High', color: '#FF453A' },
};

export function isOverdue(iso: string, status?: string): boolean {
  if (!iso) return false;
  if (status === 'done' || status === 'completed') return false;
  return new Date(iso).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function projectProgress(taskStatuses: TaskStatus[]): number {
  if (taskStatuses.length === 0) return 0;
  const done = taskStatuses.filter((s) => s === 'done').length;
  return Math.round((done / taskStatuses.length) * 100);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
