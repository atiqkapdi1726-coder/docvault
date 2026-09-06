import { describe, it, expect } from 'vitest';
import { folderService } from '@/lib/services/folder';

describe('folderService', () => {
  it('exports expected methods', () => {
    expect(typeof folderService.getFolders).toBe('function');
    expect(typeof folderService.getFolder).toBe('function');
    expect(typeof folderService.createFolder).toBe('function');
    expect(typeof folderService.updateFolder).toBe('function');
    expect(typeof folderService.deleteFolder).toBe('function');
    expect(typeof folderService.moveFolder).toBe('function');
    expect(typeof folderService.getAllFoldersRecursive).toBe('function');
    expect(typeof folderService.subscribeToFolders).toBe('function');
  });

  it('has 8 service methods', () => {
    const methods = Object.keys(folderService).filter(k => typeof (folderService as any)[k] === 'function');
    expect(methods.length).toBe(8);
  });
});
