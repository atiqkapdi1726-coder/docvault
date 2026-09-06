import { describe, it, expect } from 'vitest';
import { commentService } from '@/lib/services/comment';

describe('commentService', () => {
  it('exports expected methods', () => {
    expect(typeof commentService.getComments).toBe('function');
    expect(typeof commentService.addComment).toBe('function');
    expect(typeof commentService.updateComment).toBe('function');
    expect(typeof commentService.deleteComment).toBe('function');
    expect(typeof commentService.subscribeToComments).toBe('function');
  });
});
