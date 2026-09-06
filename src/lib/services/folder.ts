import { firestoreService } from '../firebase/firestore';
import type { Folder } from '../types';

export const folderService = {
  getFolders: async (workspaceId: string, parentId?: string | null) => {
    const conditions: [string, string, unknown][] = [['workspaceId', '==', workspaceId]];
    if (parentId !== undefined) {
      conditions.push(['parentId', '==', parentId]);
    }
    return firestoreService.getDocs('folders', {
      conditions,
      orderByField: 'name',
      orderByDirection: 'asc',
    }) as Promise<Folder[]>;
  },

  subscribeToFolders: (
    workspaceId: string,
    callback: (folders: Folder[]) => void
  ) => {
    return firestoreService.subscribe(
      'folders',
      {
        conditions: [['workspaceId', '==', workspaceId]],
        orderByField: 'name',
        orderByDirection: 'asc',
      },
      (data) => callback(data as Folder[])
    );
  },

  getFolder: async (folderId: string) => {
    return firestoreService.getDoc('folders', folderId) as Promise<Folder | null>;
  },

  createFolder: async (data: Omit<Folder, 'id'>) => {
    return firestoreService.addDoc('folders', data);
  },

  updateFolder: async (folderId: string, data: Partial<Folder>) => {
    await firestoreService.updateDoc('folders', folderId, data);
  },

  deleteFolder: async (folderId: string) => {
    await firestoreService.deleteDoc('folders', folderId);
  },

  moveFolder: async (folderId: string, newParentId: string | null, newPath: string[]) => {
    await firestoreService.updateDoc('folders', folderId, {
      parentId: newParentId,
      path: newPath,
    });
  },

  getAllFoldersRecursive: async (workspaceId: string): Promise<Folder[]> => {
    const allFolders = await firestoreService.getDocs('folders', {
      conditions: [['workspaceId', '==', workspaceId]],
    });
    return allFolders as Folder[];
  },
};

export default folderService;
