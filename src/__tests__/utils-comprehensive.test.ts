import { describe, it, expect, vi } from 'vitest';
import {
  formatFileSize,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getFileExtension,
  getMimeTypeCategory,
  truncate,
  debounce,
  getWorkspaceRoleLabel,
  canEdit,
  canDelete,
  canManageMembers,
} from '@/lib/utils';

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('formats complex sizes', () => {
    expect(formatFileSize(2621440)).toBe('2.5 MB');
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
  });
});

describe('formatDateTime', () => {
  it('formats a valid datetime string', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
  });
});

describe('formatRelativeTime', () => {
  it('returns a relative time string', () => {
    const result = formatRelativeTime(new Date(Date.now() - 60000).toISOString());
    expect(result).toContain('ago');
  });
});

describe('getFileExtension', () => {
  it('extracts extension from filename', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf');
  });

  it('extracts extension from path', () => {
    expect(getFileExtension('path/to/file.docx')).toBe('docx');
  });

  it('handles no extension', () => {
    expect(getFileExtension('filename')).toBe('');
  });

  it('handles uppercase extensions', () => {
    expect(getFileExtension('FILE.PDF')).toBe('pdf');
  });
});

describe('getMimeTypeCategory', () => {
  it('identifies image types', () => {
    expect(getMimeTypeCategory('image/png')).toBe('image');
    expect(getMimeTypeCategory('image/jpeg')).toBe('image');
  });

  it('identifies pdf type', () => {
    expect(getMimeTypeCategory('application/pdf')).toBe('pdf');
  });

  it('identifies video types', () => {
    expect(getMimeTypeCategory('video/mp4')).toBe('video');
  });

  it('identifies audio types', () => {
    expect(getMimeTypeCategory('audio/mpeg')).toBe('audio');
  });

  it('identifies document types', () => {
    expect(getMimeTypeCategory('application/msword')).toBe('document');
    expect(getMimeTypeCategory('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('document');
  });

  it('identifies spreadsheet types', () => {
    expect(getMimeTypeCategory('application/vnd.ms-excel')).toBe('spreadsheet');
  });

  it('identifies archive types', () => {
    expect(getMimeTypeCategory('application/zip')).toBe('archive');
  });

  it('returns other for unknown types', () => {
    expect(getMimeTypeCategory('application/octet-stream')).toBe('other');
  });
});

describe('truncate', () => {
  it('returns original string if shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('debounce', () => {
  it('creates a debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    expect(typeof debounced).toBe('function');
  });
});

describe('getWorkspaceRoleLabel', () => {
  it('returns correct labels', () => {
    expect(getWorkspaceRoleLabel('admin')).toBe('Admin');
    expect(getWorkspaceRoleLabel('editor')).toBe('Editor');
    expect(getWorkspaceRoleLabel('viewer')).toBe('Viewer');
    expect(getWorkspaceRoleLabel('unknown')).toBe('unknown');
  });
});

describe('canEdit', () => {
  it('allows admin and editor', () => {
    expect(canEdit('admin')).toBe(true);
    expect(canEdit('editor')).toBe(true);
    expect(canEdit('viewer')).toBe(false);
  });
});

describe('canDelete', () => {
  it('allows only admin', () => {
    expect(canDelete('admin')).toBe(true);
    expect(canDelete('editor')).toBe(false);
    expect(canDelete('viewer')).toBe(false);
  });
});

describe('canManageMembers', () => {
  it('allows only admin', () => {
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('editor')).toBe(false);
    expect(canManageMembers('viewer')).toBe(false);
  });
});
