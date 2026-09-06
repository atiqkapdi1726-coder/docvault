import { describe, it, expect } from 'vitest';
import { storageService } from '@/lib/firebase/storage';

describe('storageService', () => {
  it('exports expected methods', () => {
    expect(typeof storageService.uploadFile).toBe('function');
    expect(typeof storageService.deleteFile).toBe('function');
    expect(typeof storageService.getDownloadURL).toBe('function');
  });

  it('has 3 service methods', () => {
    const methods = Object.keys(storageService).filter(k => typeof (storageService as any)[k] === 'function');
    expect(methods.length).toBe(3);
  });
});
