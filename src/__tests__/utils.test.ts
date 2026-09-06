import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'active', false && 'hidden');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('hidden');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('deduplicates tailwind classes', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('merges conflicting tailwind classes properly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null)).toBe('foo');
  });

  it('handles array inputs', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handles object inputs', () => {
    const result = cn({ active: true, hidden: false });
    expect(result).toBe('active');
  });
});
