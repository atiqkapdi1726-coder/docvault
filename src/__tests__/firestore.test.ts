import { describe, it, expect, vi } from 'vitest';

describe('firestoreService', () => {
  it('firestoreService module exists', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(firestoreService).toBeDefined();
  });

  it('has getDoc method', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(typeof firestoreService.getDoc).toBe('function');
  });

  it('has getDocs method', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(typeof firestoreService.getDocs).toBe('function');
  });

  it('has addDoc method', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(typeof firestoreService.addDoc).toBe('function');
  });

  it('has updateDoc method', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(typeof firestoreService.updateDoc).toBe('function');
  });

  it('has deleteDoc method', async () => {
    const { firestoreService } = await import('@/lib/firebase/firestore');
    expect(typeof firestoreService.deleteDoc).toBe('function');
  });
});
