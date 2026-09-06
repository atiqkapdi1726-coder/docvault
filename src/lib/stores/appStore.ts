import { create } from 'zustand';
import type { User, Workspace, Document, Folder, UploadProgress, Notification } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;

  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;

  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder | null) => void;

  folders: Folder[];
  setFolders: (folders: Folder[]) => void;

  documents: Document[];
  setDocuments: (documents: Document[]) => void;

  uploadProgress: UploadProgress[];
  addUploadProgress: (progress: UploadProgress) => void;
  updateUploadProgress: (id: string, progress: Partial<UploadProgress>) => void;
  removeUploadProgress: (id: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;

  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  selectedDocuments: string[];
  setSelectedDocuments: (ids: string[]) => void;
  toggleDocumentSelection: (id: string) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentWorkspace: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  workspaces: [],
  setWorkspaces: (workspaces) => set({ workspaces }),

  currentFolder: null,
  setCurrentFolder: (folder) => set({ currentFolder: folder }),

  folders: [],
  setFolders: (folders) => set({ folders }),

  documents: [],
  setDocuments: (documents) => set({ documents }),

  uploadProgress: [],
  addUploadProgress: (progress) =>
    set((state) => ({ uploadProgress: [...state.uploadProgress, progress] })),
  updateUploadProgress: (id, progress) =>
    set((state) => ({
      uploadProgress: state.uploadProgress.map((p) =>
        p.id === id ? { ...p, ...progress } : p
      ),
    })),
  removeUploadProgress: (id) =>
    set((state) => ({
      uploadProgress: state.uploadProgress.filter((p) => p.id !== id),
    })),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  selectedDocuments: [],
  setSelectedDocuments: (ids) => set({ selectedDocuments: ids }),
  toggleDocumentSelection: (id) =>
    set((state) => ({
      selectedDocuments: state.selectedDocuments.includes(id)
        ? state.selectedDocuments.filter((i) => i !== id)
        : [...state.selectedDocuments, id],
    })),
  clearSelection: () => set({ selectedDocuments: [] }),
}));

export default useAppStore;
