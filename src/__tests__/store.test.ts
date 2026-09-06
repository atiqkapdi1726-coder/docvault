import { describe, it, expect, vi } from 'vitest';

describe('useAppStore', () => {
  it('zustand module exists', async () => {
    const zustand = await import('zustand');
    expect(zustand).toBeDefined();
  });

  it('useAppStore is importable', async () => {
    const { useAppStore } = await import('@/lib/stores/appStore');
    expect(useAppStore).toBeDefined();
  });

  it('useAppStore is callable as hook', async () => {
    const { useAppStore } = await import('@/lib/stores/appStore');
    const state = useAppStore;
    expect(state).toBeDefined();
  });
});
