import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateToken(): string {
  return uuidv4().replace(/-/g, '') + Date.now().toString(36);
}

export function formatDate(dateString: unknown): string {
  try {
    return format(parseISO(toISODate(dateString)), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function formatDateTime(dateString: unknown): string {
  try {
    return format(parseISO(toISODate(dateString)), 'MMM d, yyyy h:mm a');
  } catch {
    return '';
  }
}

export function toISODate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return new Date((value as { seconds: number }).seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

export function formatRelativeTime(dateString: unknown): string {
  try {
    return formatDistanceToNow(parseISO(toISODate(dateString)), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatFileSize(bytes: number | undefined | null): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function getMimeTypeCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('text/')) return 'text';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive';
  return 'other';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getWorkspaceRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Admin';
    case 'editor': return 'Editor';
    case 'viewer': return 'Viewer';
    default: return role;
  }
}

export function canEdit(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

export function canDelete(role: string): boolean {
  return role === 'admin';
}

export function canManageMembers(role: string): boolean {
  return role === 'admin';
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
