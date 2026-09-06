import { describe, it, expect } from 'vitest';
import { documentService } from '@/lib/services/document';

describe('documentService', () => {
  it('exports expected methods', () => {
    expect(typeof documentService.getDocuments).toBe('function');
    expect(typeof documentService.getDocument).toBe('function');
    expect(typeof documentService.createDocument).toBe('function');
    expect(typeof documentService.updateDocument).toBe('function');
    expect(typeof documentService.deleteDocument).toBe('function');
    expect(typeof documentService.addVersion).toBe('function');
    expect(typeof documentService.searchDocuments).toBe('function');
    expect(typeof documentService.getStarredDocs).toBe('function');
    expect(typeof documentService.createShareLink).toBe('function');
    expect(typeof documentService.getShareLink).toBe('function');
    expect(typeof documentService.incrementAccessCount).toBe('function');
    expect(typeof documentService.revokeShareLink).toBe('function');
    expect(typeof documentService.getSharedLinksForDocument).toBe('function');
  });

  it('has 13 service methods', () => {
    const methods = Object.keys(documentService).filter(k => typeof (documentService as any)[k] === 'function');
    expect(methods.length).toBe(13);
  });
});
