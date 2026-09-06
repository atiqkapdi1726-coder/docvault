import { firestoreService } from '../firebase/firestore';
import type { Document, Folder, DocumentVersion, SharedLink } from '../types';
import { generateToken } from '../utils';

export const documentService = {
  getDocuments: async (workspaceId: string, folderId?: string) => {
    const conditions: [string, string, unknown][] = [['workspaceId', '==', workspaceId]];
    if (folderId) {
      conditions.push(['folderId', '==', folderId]);
    } else {
      conditions.push(['folderId', '==', null]);
    }
    return firestoreService.getDocs('documents', {
      conditions,
      orderByField: 'updatedAt',
      orderByDirection: 'desc',
    }) as Promise<Document[]>;
  },

  getDocument: async (docId: string) => {
    return firestoreService.getDoc('documents', docId) as Promise<Document | null>;
  },

  createDocument: async (data: Omit<Document, 'id'>) => {
    const id = await firestoreService.addDoc('documents', data);
    return id;
  },

  updateDocument: async (docId: string, data: Partial<Document>) => {
    await firestoreService.updateDoc('documents', docId, data);
  },

  deleteDocument: async (docId: string) => {
    await firestoreService.deleteDoc('documents', docId);
  },

  addVersion: async (docId: string, version: DocumentVersion) => {
    const doc = await firestoreService.getDoc('documents', docId);
    if (!doc) throw new Error('Document not found');
    const versions = (doc as Document).versions || [];
    versions.push(version);
    await firestoreService.updateDoc('documents', docId, {
      versions,
      version: version.version,
      fileUrl: version.fileUrl,
      fileSize: version.fileSize,
    });
  },

  searchDocuments: async (workspaceId: string, searchTerm: string) => {
    const allDocs = await firestoreService.getDocs('documents', {
      conditions: [['workspaceId', '==', workspaceId]],
    });
    const lower = searchTerm.toLowerCase();
    return (allDocs as Document[]).filter(
      (doc) =>
        doc.name.toLowerCase().includes(lower) ||
        doc.description.toLowerCase().includes(lower) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
        (doc.aiSummary && doc.aiSummary.toLowerCase().includes(lower))
    );
  },

  getStarredDocs: async (workspaceId: string) => {
    const allDocs = await firestoreService.getDocs('documents', {
      conditions: [['workspaceId', '==', workspaceId]],
    });
    return (allDocs as Document[]).filter((doc: Document & { isStarred?: boolean }) => (doc as Document & { isStarred?: boolean }).isStarred);
  },

  createShareLink: async (data: Omit<SharedLink, 'id' | 'token' | 'accessCount' | 'isActive' | 'createdAt'>) => {
    const id = await firestoreService.addDoc('sharedLinks', {
      ...data,
      token: generateToken(),
      accessCount: 0,
      isActive: true,
    });
    return id;
  },

  getShareLink: async (token: string) => {
    const links = await firestoreService.getDocs('sharedLinks', {
      conditions: [
        ['token', '==', token],
        ['isActive', '==', true],
      ],
    });
    return (links as SharedLink[])[0] || null;
  },

  incrementAccessCount: async (linkId: string) => {
    const link = await firestoreService.getDoc('sharedLinks', linkId);
    if (link) {
      await firestoreService.updateDoc('sharedLinks', linkId, {
        accessCount: ((link as SharedLink).accessCount || 0) + 1,
      });
    }
  },

  revokeShareLink: async (linkId: string) => {
    await firestoreService.updateDoc('sharedLinks', linkId, { isActive: false });
  },

  getSharedLinksForDocument: async (documentId: string) => {
    return firestoreService.getDocs('sharedLinks', {
      conditions: [['documentId', '==', documentId]],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
    }) as Promise<SharedLink[]>;
  },
};

export default documentService;
