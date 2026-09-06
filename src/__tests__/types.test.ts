import { describe, it, expect } from 'vitest';
import type {
  User,
  Workspace,
  Document,
  Folder,
  Comment,
  Activity,
  AuditLog,
  SharedLink,
  DocumentVersion,
  DocumentMetadata,
  WorkspaceMember,
  UploadProgress,
  SearchResult,
  StorageAnalytics,
} from '@/lib/types';

describe('Type definitions', () => {
  it('User type has required fields', () => {
    const user: User = {
      uid: '123',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      createdAt: '2024-01-01',
    };
    expect(user.uid).toBe('123');
    expect(user.email).toBe('test@test.com');
  });

  it('Workspace type has required fields', () => {
    const ws: Workspace = {
      id: 'ws1',
      name: 'Test Workspace',
      type: 'team',
      ownerId: 'user1',
      members: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    expect(ws.type).toBe('team');
  });

  it('Document type has required fields', () => {
    const doc: Document = {
      id: 'doc1',
      name: 'test.pdf',
      folderId: null,
      workspaceId: 'ws1',
      fileUrl: 'https://example.com/file',
      fileSize: 1024,
      mimeType: 'application/pdf',
      thumbnailUrl: null,
      description: '',
      tags: [],
      version: 1,
      versions: [],
      createdBy: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      metadata: {
        author: 'Test',
        category: 'general',
        language: 'en',
      },
      aiSummary: null,
      aiTags: [],
    };
    expect(doc.name).toBe('test.pdf');
  });

  it('Folder type has required fields', () => {
    const folder: Folder = {
      id: 'f1',
      name: 'Documents',
      parentId: null,
      workspaceId: 'ws1',
      path: [],
      createdBy: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    expect(folder.name).toBe('Documents');
  });

  it('Comment type has required fields', () => {
    const comment: Comment = {
      id: 'c1',
      documentId: 'doc1',
      userId: 'user1',
      userName: 'Test User',
      userPhotoURL: null,
      content: 'Great document!',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      parentId: null,
      replies: [],
    };
    expect(comment.content).toBe('Great document!');
  });

  it('Activity type has required fields', () => {
    const activity: Activity = {
      id: 'a1',
      workspaceId: 'ws1',
      documentId: 'doc1',
      userId: 'user1',
      userName: 'Test User',
      userPhotoURL: null,
      action: 'upload',
      details: 'Uploaded file.pdf',
      createdAt: '2024-01-01',
    };
    expect(activity.action).toBe('upload');
  });

  it('AuditLog type has required fields', () => {
    const log: AuditLog = {
      id: 'log1',
      workspaceId: 'ws1',
      userId: 'user1',
      userName: 'Test User',
      userPhotoURL: null,
      action: 'document.delete',
      resourceType: 'document',
      resourceId: 'doc1',
      resourceName: 'test.pdf',
      details: 'Deleted document',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01',
    };
    expect(log.action).toBe('document.delete');
  });

  it('SharedLink type has required fields', () => {
    const link: SharedLink = {
      id: 'link1',
      documentId: 'doc1',
      workspaceId: 'ws1',
      token: 'abc123',
      createdBy: 'user1',
      expiresAt: null,
      password: null,
      accessCount: 0,
      maxAccess: null,
      isActive: true,
      createdAt: '2024-01-01',
    };
    expect(link.isActive).toBe(true);
  });

  it('UploadProgress type has required fields', () => {
    const progress: UploadProgress = {
      id: 'up1',
      fileName: 'test.pdf',
      progress: 50,
      status: 'uploading',
    };
    expect(progress.status).toBe('uploading');
  });
});
