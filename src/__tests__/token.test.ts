import { describe, it, expect, vi } from 'vitest';

describe('generateToken', () => {
  it('generates tokens using Math.random fallback', async () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, writable: true, configurable: true });

    const { generateToken: genToken } = await import('@/lib/utils');
    const token = genToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    Object.defineProperty(globalThis, 'crypto', { value: original, writable: true, configurable: true });
  });

  it('generateToken is a function', async () => {
    const { generateToken: genToken } = await import('@/lib/utils');
    expect(typeof genToken).toBe('function');
  });
});
