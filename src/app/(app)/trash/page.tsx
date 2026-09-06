'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { documentService } from '@/lib/services/document';
import type { Document } from '@/lib/types';
import { Trash2, RotateCcw, FileText, AlertTriangle } from 'lucide-react';

export default function TrashPage() {
  const { currentWorkspace, user } = useAppStore();
  const [trashDocs, setTrashDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    if (!currentWorkspace) return;
    try {
      const allDocs = await documentService.getDocuments(currentWorkspace.id);
      setTrashDocs((allDocs as Document[]).filter((d) => d.isArchived === true));
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, [currentWorkspace]);

  const handleRestore = async (doc: Document) => {
    try {
      await documentService.updateDocument(doc.id, { isArchived: false } as Partial<Document>);
      setTrashDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {}
  };

  const handlePermanentDelete = async (doc: Document) => {
    try {
      await documentService.deleteDocument(doc.id);
      setTrashDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {}
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trash2 size={24} className="text-rose-500" />
            Trash
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Archived documents can be restored or permanently deleted
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
        ) : trashDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Trash is empty</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Archived documents will appear here. You can restore them or delete them permanently.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {trashDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatFileSize(doc.fileSize)} · Archived {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(doc)}
                        className="btn-primary px-3 py-2 text-sm flex items-center gap-1.5"
                        title="Restore"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(doc)}
                        className="px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                        title="Delete permanently"
                      >
                        <AlertTriangle size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
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
