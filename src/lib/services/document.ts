import { firestoreService } from '../firebase/firestore';
import { storageService } from '../firebase/storage';
import type { Document, Folder, DocumentVersion, SharedLink } from '../types';
import { generateToken } from '../utils';

export const documentService = {
  getDocuments: async (workspaceId: string, folderId?: string) => {
    const conditions: [string, string, unknown][] = [
      ['workspaceId', '==', workspaceId],
      ['isArchived', '==', false],
    ];
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

  getAllDocuments: async (workspaceId: string) => {
    const all = await firestoreService.getDocs('documents', {
      conditions: [['workspaceId', '==', workspaceId]],
    });
    return (all as Document[]).filter((d) => d.isArchived !== true);
  },

  getArchivedDocuments: async (workspaceId: string) => {
    const all = await firestoreService.getDocs('documents', {
      conditions: [['workspaceId', '==', workspaceId]],
    });
    return (all as Document[]).filter((d) => d.isArchived === true);
  },

  // Real-time subscription to all workspace documents (archived filtered client-side)
  subscribeToDocuments: (
    workspaceId: string,
    callback: (docs: Document[]) => void
  ) => {
    return firestoreService.subscribe(
      'documents',
      {
        conditions: [['workspaceId', '==', workspaceId]],
        orderByField: 'updatedAt',
        orderByDirection: 'desc',
      },
      (data) => callback((data as Document[]).filter((d) => d.isArchived !== true))
    );
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

  // Soft delete — moves document to Trash (recoverable)
  archiveDocument: async (docId: string) => {
    await firestoreService.updateDoc('documents', docId, { isArchived: true });
  },

  restoreDocument: async (docId: string) => {
    await firestoreService.updateDoc('documents', docId, { isArchived: false });
  },

  // Permanent delete — removes document record AND stored file blob
  deleteDocument: async (docId: string) => {
    const doc = (await firestoreService.getDoc('documents', docId)) as
      | (Document & { fileUrl?: string })
      | null;
    if (doc?.fileUrl) {
      try {
        await storageService.deleteFile(doc.fileUrl);
      } catch {}
    }
    await firestoreService.deleteDoc('documents', docId);
  },

  // Downloads the Base64-stored file and triggers a browser download
  downloadDocument: async (doc: Pick<Document, 'name' | 'fileUrl'>) => {
    if (!doc.fileUrl) throw new Error('No file attached to this document');
    const dataUrl = await storageService.downloadFile(doc.fileUrl);
    if (!dataUrl) throw new Error('File data not found');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
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

  // Move document to a folder (null = root)
  moveDocument: async (docId: string, folderId: string | null) => {
    await firestoreService.updateDoc('documents', docId, { folderId });
  },

  renameDocument: async (docId: string, name: string) => {
    await firestoreService.updateDoc('documents', docId, { name });
  },

  updateDescription: async (docId: string, description: string) => {
    await firestoreService.updateDoc('documents', docId, { description });
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

  createShareLink: async (
    data: Omit<SharedLink, 'id' | 'token' | 'accessCount' | 'isActive' | 'createdAt'>
  ): Promise<{ id: string; token: string }> => {
    const token = generateToken();
    const id = await firestoreService.addDoc('sharedLinks', {
      ...data,
      token,
      accessCount: 0,
      isActive: true,
    });
    return { id, token };
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
