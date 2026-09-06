import { describe, it, expect, vi } from 'vitest';

describe('API Routes', () => {
  it('audit route POST is a function', async () => {
    const { POST } = await import('@/app/api/audit/route');
    expect(typeof POST).toBe('function');
  });

  it('email route POST is a function', async () => {
    const { POST } = await import('@/app/api/email/route');
    expect(typeof POST).toBe('function');
  });

  it('ai route POST is a function', async () => {
    const { POST } = await import('@/app/api/ai/route');
    expect(typeof POST).toBe('function');
  });

  it('share route POST is a function', async () => {
    const { POST } = await import('@/app/api/share/route');
    expect(typeof POST).toBe('function');
  });

  it('share route GET is a function', async () => {
    const { GET } = await import('@/app/api/share/route');
    expect(typeof GET).toBe('function');
  });
});
