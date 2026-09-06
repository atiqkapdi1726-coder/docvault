'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { documentService } from '../services/document';
import { folderService } from '../services/folder';
import { workspaceService } from '../services/workspace';
import { activityService } from '../services/activity';
import { v4 as uuidv4 } from 'uuid';
import type { Document, Folder, Workspace, Activity, UploadProgress } from '../types';
import { storageService } from '../firebase/storage';
import { toast } from '@/components/ui/Toaster';

export function useWorkspace() {
  const { currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces, user } = useAppStore();

  const loadWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      let ws = await workspaceService.getWorkspaces(user.uid);
      if (ws.length === 0) {
        const defaultWs = {
          name: 'My Workspace',
          type: 'personal' as const,
          ownerId: user.uid,
          members: [
            {
              uid: user.uid,
              role: 'admin' as const,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              joinedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const wsId = await workspaceService.createWorkspace(defaultWs);
        ws = [{ id: wsId as string, ...defaultWs }] as Workspace[];
      }
      setWorkspaces(ws as Workspace[]);
      if (ws.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(ws[0] as Workspace);
      }
    } catch (error) {
      console.warn('Failed to load workspaces:', error);
    }
  }, [user, setWorkspaces, setCurrentWorkspace, currentWorkspace]);

  useEffect(() => {
    if (user) loadWorkspaces();
  }, [user, loadWorkspaces]);

  return { workspaces, currentWorkspace, setCurrentWorkspace, loadWorkspaces };
}

export function useFolders() {
  const { currentWorkspace, currentFolder, setCurrentFolder, folders, setFolders } = useAppStore();

  const loadFolders = useCallback(async (parentId?: string | null) => {
    if (!currentWorkspace) return;
    const fs = await folderService.getFolders(
      currentWorkspace.id,
      parentId !== undefined ? parentId : null
    );
    setFolders(fs as Folder[]);
  }, [currentWorkspace, setFolders]);

  const loadAllFolders = useCallback(async () => {
    if (!currentWorkspace) return;
    const fs = await folderService.getAllFoldersRecursive(currentWorkspace.id);
    setFolders(fs as Folder[]);
  }, [currentWorkspace, setFolders]);

  // Real-time folder updates
  useEffect(() => {
    if (!currentWorkspace) return;
    let unsub: (() => void) | undefined;
    try {
      const result = folderService.subscribeToFolders(
        currentWorkspace.id,
        (fs) => setFolders(fs as Folder[])
      );
      if (typeof result === 'function') unsub = result;
    } catch (error) {
      console.warn('Folder subscription failed, falling back to fetch:', error);
      loadFolders(null);
    }
    return () => {
      try { if (unsub) unsub(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id]);

  return {
    folders,
    currentFolder,
    setCurrentFolder,
    loadFolders,
    loadAllFolders,
  };
}

export function useDocuments(folderId?: string | null) {
  const { currentWorkspace, documents, setDocuments, user } = useAppStore();

  const loadDocuments = useCallback(async () => {
    if (!currentWorkspace) return;
    const docs = await documentService.getAllDocuments(currentWorkspace.id);
    setDocuments(docs as Document[]);
  }, [currentWorkspace, setDocuments]);

  // Real-time document updates for the workspace
  useEffect(() => {
    if (!currentWorkspace) return;
    let unsub: (() => void) | undefined;
    try {
      const result = documentService.subscribeToDocuments(
        currentWorkspace.id,
        (docs) => setDocuments(docs as Document[])
      );
      if (typeof result === 'function') unsub = result;
    } catch (error) {
      console.warn('Document subscription failed, falling back to fetch:', error);
      loadDocuments();
    }
    return () => {
      try { if (unsub) unsub(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id]);

  const uploadFile = useCallback(
    async (file: File, targetFolderId?: string | null) => {
      if (!currentWorkspace || !user) return null;

      const uploadId = uuidv4();
      const progressEntry: UploadProgress = {
        id: uploadId,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      };

      useAppStore.getState().addUploadProgress(progressEntry);

      try {
        const result = await storageService.uploadFile(
          file,
          `workspaces/${currentWorkspace.id}/documents`,
          (progress: number) => {
            useAppStore.getState().updateUploadProgress(uploadId, { progress });
          }
        );

        useAppStore.getState().updateUploadProgress(uploadId, {
          status: 'processing',
          progress: 100,
        });

        const docData: Omit<Document, 'id'> = {
          name: file.name,
          folderId: targetFolderId || null,
          workspaceId: currentWorkspace.id,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          mimeType: result.contentType,
          thumbnailUrl: null,
          description: '',
          tags: [],
          version: 1,
          versions: [
            {
              version: 1,
              fileUrl: result.fileUrl,
              fileSize: result.fileSize,
              uploadedBy: user.uid,
              uploadedAt: new Date().toISOString(),
              changelog: 'Initial upload',
            },
          ],
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            author: user.displayName || user.email,
            category: 'general',
            language: 'en',
          },
          aiSummary: null,
          aiTags: [],
        };

        const docId = await documentService.createDocument(docData);

        // Fire-and-forget AI analysis (updates doc when done via real-time sync)
        fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.aiSummary) {
              toast(`${file.name}: AI summary ready`, 'success');
            }
          })
          .catch(() => {});

        await activityService.logActivity({
          workspaceId: currentWorkspace.id,
          documentId: docId as string,
          userId: user.uid,
          userName: user.displayName,
          userPhotoURL: null,
          action: 'upload',
          details: `Uploaded ${file.name}`,
          createdAt: new Date().toISOString(),
        });

        useAppStore.getState().updateUploadProgress(uploadId, {
          status: 'complete',
        });

        setTimeout(() => {
          useAppStore.getState().removeUploadProgress(uploadId);
        }, 3000);

        await loadDocuments();
        return docId;
      } catch (error) {
        useAppStore.getState().updateUploadProgress(uploadId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        });
        return null;
      }
    },
    [currentWorkspace, user, loadDocuments]
  );

  return { documents, loadDocuments, uploadFile };
}

export function useActivity() {
  const { currentWorkspace } = useAppStore();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!currentWorkspace) return;

    let unsub: (() => void) | undefined;

    try {
      const result = activityService.subscribeToActivities(
        currentWorkspace.id,
        (data) => {
          try {
            setActivities(data as unknown as Activity[]);
          } catch {}
        }
      );
      if (typeof result === 'function') {
        unsub = result;
      }
    } catch (error) {
      console.warn('Activity subscription failed, using fallback:', error);
      activityService.getActivities(currentWorkspace.id).then((data) => {
        setActivities(data as Activity[]);
      }).catch(() => {});
    }

    return () => {
      try {
        if (unsub) unsub();
      } catch {}
    };
  }, [currentWorkspace?.id]);

  return { activities };
}
