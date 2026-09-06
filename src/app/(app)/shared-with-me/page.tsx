'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { formatFileSize, formatRelativeTime, getInitials } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { documentService } from '@/lib/services/document';
import { workspaceService } from '@/lib/services/workspace';
import type { Document, Workspace } from '@/lib/types';
import { Users, FileText, Clock, Share2 } from 'lucide-react';

interface SharedDoc {
  document: Document;
  sharedBy: string;
  sharedByName: string;
  workspaceName: string;
}

export default function SharedWithMePage() {
  const { currentWorkspace, user, workspaces } = useAppStore();
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const allWorkspaces = await workspaceService.getWorkspaces(user.uid);
        const otherWorkspaces = (allWorkspaces as Workspace[]).filter(
          (ws) => ws.id !== currentWorkspace?.id && ws.ownerId !== user.uid
        );

        const results: SharedDoc[] = [];
        for (const ws of otherWorkspaces) {
          const docs = await documentService.getDocuments(ws.id);
          for (const doc of docs as Document[]) {
            const ownerMember = ws.members?.find((m) => m.uid === ws.ownerId);
            results.push({
              document: doc,
              sharedBy: ws.ownerId,
              sharedByName: ownerMember?.displayName || 'Unknown',
              workspaceName: ws.name,
            });
          }
        }
        setSharedDocs(results);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [user, currentWorkspace]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 size={24} className="text-blue-500" />
            Shared with Me
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Documents shared by other workspace members
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgb(var(--muted))]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[rgb(var(--muted))] rounded w-1/3" />
                    <div className="h-3 bg-[rgb(var(--muted))] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sharedDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Nothing shared yet</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              When other workspace members share documents with you, they will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sharedDocs.map((item, i) => (
                <motion.div
                  key={item.document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.document.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white text-[8px] font-medium flex-shrink-0">
                          {getInitials(item.sharedByName)}
                        </div>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          Shared by <span className="font-medium text-[rgb(var(--foreground))]">{item.sharedByName}</span>
                          {' · '}{item.workspaceName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatFileSize(item.document.fileSize)}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1 justify-end mt-0.5">
                        <Clock size={10} />
                        {formatRelativeTime(item.document.updatedAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
