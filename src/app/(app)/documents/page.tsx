'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { useFolders, useDocuments } from '@/lib/hooks';
import { formatFileSize, formatRelativeTime, cn, getFileExtension } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentGridSkeleton } from '@/components/skeletons/Skeletons';
import {
  FileText, Folder, Upload, Plus, Grid, List, MoreVertical,
  Star, Trash2, Download, Share2, Eye, ChevronRight, Home,
  ArrowUpRight, Tag, Clock,
} from 'lucide-react';
import { folderService } from '@/lib/services/folder';
import { documentService } from '@/lib/services/document';
import Link from 'next/link';
import { UploadZone } from '@/components/documents/UploadZone';
import { toast } from '@/components/ui/Toaster';

export default function DocumentsPage() {
  const { currentWorkspace, user } = useAppStore();
  const { folders, currentFolder, setCurrentFolder, loadFolders, loadAllFolders } = useFolders();
  const { documents, loadDocuments, uploadFile } = useDocuments(currentFolder?.id || null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  useEffect(() => {
    if (currentWorkspace) {
      setLoading(true);
      Promise.all([loadFolders(null), loadDocuments()]).finally(() => setLoading(false));
    }
  }, [currentWorkspace, loadFolders, loadDocuments]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentWorkspace || !user) return;
    await folderService.createFolder({
      name: newFolderName.trim(),
      parentId: currentFolder?.id || null,
      workspaceId: currentWorkspace.id,
      path: currentFolder ? [...currentFolder.path, currentFolder.id] : [],
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewFolderName('');
    setShowNewFolder(false);
    loadFolders(currentFolder?.id || null);
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await documentService.archiveDocument(docId);
      toast('Document moved to Trash', 'info');
    } catch {
      toast('Failed to move document to Trash', 'error');
    }
    setContextMenu(null);
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Root', folder: null as any }];
    if (currentFolder) {
      const current = folders.find((f) => f.id === currentFolder.id);
      if (current) {
        crumbs.push({ label: current.name, folder: current });
      }
    }
    return crumbs;
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <div className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))] mt-1">
              {getBreadcrumbs().map((crumb, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <ChevronRight size={12} className="mx-1" />}
                  <button
                    onClick={() => setCurrentFolder(crumb.folder)}
                    className="hover:text-[rgb(var(--primary))] transition-colors"
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <button
              onClick={() => setShowNewFolder(true)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Folder size={16} />
              <span className="hidden sm:inline">New Folder</span>
            </button>
            <div className="flex border border-[rgb(var(--border))] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2', viewMode === 'grid' ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]' : 'hover:bg-[rgb(var(--muted))]')}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2', viewMode === 'list' ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]' : 'hover:bg-[rgb(var(--muted))]')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <UploadZone
                onUpload={uploadFile}
                folderId={currentFolder?.id || null}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showNewFolder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2">
              <Folder size={18} className="text-[rgb(var(--primary))]" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="input-field flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setShowNewFolder(false);
                }}
              />
              <button onClick={handleCreateFolder} className="btn-primary text-sm">Create</button>
              <button onClick={() => setShowNewFolder(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <DocumentGridSkeleton />
        ) : (
          <>
            {folders.filter((f) => currentFolder ? f.parentId === currentFolder.id : !f.parentId).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Folders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {folders
                    .filter((f) => currentFolder ? f.parentId === currentFolder.id : !f.parentId)
                    .map((folder) => (
                      <motion.div
                        key={folder.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => {
                            setCurrentFolder(folder);
                            loadFolders(folder.id);
                          }}
                          className="w-full card p-4 flex items-center gap-3 hover:border-[rgb(var(--primary))]/50 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <Folder size={20} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{folder.name}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {formatRelativeTime(folder.updatedAt)}
                            </p>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Documents</h3>
              {documents.length === 0 ? (
                <div className="card p-12 text-center">
                  <FileText size={48} className="mx-auto text-[rgb(var(--muted-foreground))] mb-4" />
                  <p className="text-[rgb(var(--muted-foreground))]">No documents in this folder</p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="btn-primary mt-4"
                  >
                    Upload your first document
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card group hover:border-[rgb(var(--primary))]/50 transition-all relative"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {getFileExtension(doc.name).toUpperCase()}
                            </span>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => setContextMenu(contextMenu === doc.id ? null : doc.id)}
                              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--muted))] transition-all"
                            >
                              <MoreVertical size={16} />
                            </button>
                            <AnimatePresence>
                              {contextMenu === doc.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-8 w-40 card p-1 shadow-lg z-10"
                                >
                                  <Link
                                    href={`/documents/${doc.id}`}
                                    onClick={() => setContextMenu(null)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))]"
                                  >
                                    <Eye size={14} /> View
                                  </Link>
                                  {doc.fileUrl && (
                                    <button
                                      onClick={async () => {
                                        setContextMenu(null);
                                        try {
                                          await documentService.downloadDocument(doc);
                                        } catch {
                                          toast('Download failed', 'error');
                                        }
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))]"
                                    >
                                      <Download size={14} /> Download
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/documents/${doc.id}`);
                                      setContextMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))]"
                                  >
                                    <Share2 size={14} /> Share
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await documentService.updateDocument(doc.id, { isStarred: !(doc as any).isStarred } as any);
                                      loadDocuments();
                                      setContextMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))]"
                                  >
                                    <Star size={14} /> {(doc as any).isStarred ? 'Unstar' : 'Star'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDoc(doc.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <p className="font-medium text-sm truncate mb-1">{doc.name}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {formatFileSize(doc.fileSize)} · v{doc.version}
                        </p>
                        {doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card divide-y divide-[rgb(var(--border))]">
                  {documents.map((doc) => (
                    <div key={doc.id} className="px-4 py-3 flex items-center gap-4 hover:bg-[rgb(var(--muted))]/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {getFileExtension(doc.name).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {formatFileSize(doc.fileSize)} · v{doc.version} · {formatRelativeTime(doc.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {doc.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
