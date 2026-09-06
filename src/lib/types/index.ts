export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  photoURL: string | null;
  joinedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  workspaceId: string;
  path: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface Document {
  id: string;
  name: string;
  folderId: string | null;
  workspaceId: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl: string | null;
  description: string;
  tags: string[];
  version: number;
  versions: DocumentVersion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata: DocumentMetadata;
  aiSummary: string | null;
  aiTags: string[];
  isArchived?: boolean;
  isStarred?: boolean;
  storageType?: 'firestore' | 'external';
}

export interface DocumentVersion {
  version: number;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changelog: string;
}

export interface DocumentMetadata {
  author: string;
  category: string;
  language: string;
  pageCount?: number;
  wordCount?: number;
}

export interface SharedLink {
  id: string;
  documentId: string;
  workspaceId: string;
  token: string;
  createdBy: string;
  expiresAt: string | null;
  password: string | null;
  accessCount: number;
  maxAccess: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  replies: Comment[];
  isEdited?: boolean;
}

export interface Activity {
  id: string;
  workspaceId: string;
  documentId: string | null;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  action: ActivityAction;
  details: string;
  createdAt: string;
}

export type ActivityAction =
  | 'upload'
  | 'edit'
  | 'delete'
  | 'share'
  | 'comment'
  | 'download'
  | 'move'
  | 'rename'
  | 'version_update'
  | 'tag_add'
  | 'tag_remove';

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  action: string;
  resourceType: 'document' | 'folder' | 'workspace' | 'user' | 'share';
  resourceId: string;
  resourceName: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  fileUrl?: string;
}

export interface SearchResult {
  type: 'document' | 'folder';
  id: string;
  name: string;
  snippet: string;
  workspaceId: string;
  folderId: string | null;
  updatedAt: string;
  relevanceScore: number;
}

export interface StorageAnalytics {
  totalSize: number;
  documentCount: number;
  folderCount: number;
  storageByType: Record<string, number>;
  recentActivity: Activity[];
  monthlyUsage: { month: string; size: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}
