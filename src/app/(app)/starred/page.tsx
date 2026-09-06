'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { documentService } from '@/lib/services/document';
import type { Document } from '@/lib/types';
import { Star, FileText } from 'lucide-react';

export default function StarredPage() {
  const { currentWorkspace, user } = useAppStore();
  const [starredDocs, setStarredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) return;
    const load = async () => {
      try {
        const docs = await documentService.getDocuments(currentWorkspace.id);
        setStarredDocs((docs as Document[]).filter((d) => d.isStarred === true));
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [currentWorkspace]);

  const handleToggleStar = async (doc: Document) => {
    try {
      await documentService.updateDocument(doc.id, { isStarred: false } as Partial<Document>);
      setStarredDocs((prev) => prev.filter((d) => d.id !== doc.id));
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
            <Star size={24} className="text-amber-500 fill-amber-500" />
            Starred
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Your favorite documents for quick access
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgb(var(--muted))]" />
                  <div className="h-4 bg-[rgb(var(--muted))] rounded w-2/3" />
                  <div className="h-3 bg-[rgb(var(--muted))] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : starredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-4">
              <Star size={28} className="text-white fill-white" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No starred documents</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Star documents to quickly find them later. Click the star icon on any document to add it here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {starredDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5 group hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <button
                      onClick={() => handleToggleStar(doc)}
                      className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
                      title="Unstar"
                    >
                      <Star size={18} className="text-amber-500 fill-amber-500" />
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold truncate mb-1">{doc.name}</h3>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {formatFileSize(doc.fileSize)} · Updated {formatRelativeTime(doc.updatedAt)}
                  </p>
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
