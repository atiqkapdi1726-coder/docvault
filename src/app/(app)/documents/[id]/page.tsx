'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/stores/appStore';
import { documentService } from '@/lib/services/document';
import { commentService } from '@/lib/services/comment';
import { formatFileSize, formatRelativeTime, formatDate, getFileExtension, generateToken, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  FileText, Download, Share2, Trash2, Tag, Clock, Eye,
  MessageSquare, Plus, Send, Link2, Copy, Check, Lock,
  History, X, Calendar,
} from 'lucide-react';
import type { Document, Comment, SharedLink } from '@/lib/types';
import { CommentSection } from '@/components/comments/CommentSection';

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;
  const { user } = useAppStore();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTagEdit, setShowTagEdit] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const data = await documentService.getDocument(docId);
        setDoc(data as Document);
      } catch {} finally {
        setLoading(false);
      }
    };
    if (docId) loadDoc();
  }, [docId]);

  const handleCreateShareLink = async () => {
    if (!doc || !user) return;
    const token = generateToken();
    const expiryDate = shareExpiry
      ? new Date(Date.now() + parseInt(shareExpiry) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await documentService.createShareLink({
      documentId: doc.id,
      createdBy: user.uid,
      expiresAt: expiryDate,
      password: sharePassword || null,
      maxAccess: null,
    });

    const link = `${window.location.origin}/shared/${token}`;
    setShareLink(link);
    const links = await documentService.getSharedLinksForDocument(doc.id);
    setSharedLinks(links as SharedLink[]);
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !doc) return;
    const tags = [...doc.tags, newTag.trim()];
    await documentService.updateDocument(doc.id, { tags });
    setDoc({ ...doc, tags });
    setNewTag('');
  };

  const handleRemoveTag = async (tag: string) => {
    if (!doc) return;
    const tags = doc.tags.filter((t) => t !== tag);
    await documentService.updateDocument(doc.id, { tags });
    setDoc({ ...doc, tags });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]" />
        </div>
      </AppLayout>
    );
  }

  if (!doc) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <FileText size={48} className="mx-auto text-[rgb(var(--muted-foreground))] mb-4" />
          <p className="text-[rgb(var(--muted-foreground))]">Document not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-rose-600">{getFileExtension(doc.name).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold truncate">{doc.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted-foreground))]">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>v{doc.version}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatRelativeTime(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm">
                <Download size={16} /> Download
              </a>
              <button onClick={() => setShowShare(!showShare)} className="btn-secondary flex items-center gap-2 text-sm">
                <Share2 size={16} /> Share
              </button>
              <button onClick={() => setShowVersions(!showVersions)} className="btn-secondary flex items-center gap-2 text-sm">
                <History size={16} /> Versions
              </button>
              <button onClick={() => setShowTagEdit(!showTagEdit)} className="btn-secondary flex items-center gap-2 text-sm">
                <Tag size={16} /> Tags
              </button>
            </div>
          </div>
        </motion.div>

        {showShare && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Share Document</h3>
              <button onClick={() => setShowShare(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Expiry (days)</label>
                <input type="number" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} placeholder="No expiry" className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Password (optional)</label>
                <input type="text" value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} placeholder="Leave empty for no password" className="input-field mt-1" />
              </div>
            </div>
            <button onClick={handleCreateShareLink} className="btn-primary flex items-center gap-2 text-sm">
              <Link2 size={16} /> Generate Share Link
            </button>
            {shareLink && (
              <div className="flex items-center gap-2 p-3 bg-[rgb(var(--muted))] rounded-lg">
                <input readOnly value={shareLink} className="flex-1 bg-transparent text-sm outline-none" />
                <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[rgb(var(--primary))]">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {showVersions && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Version History</h3>
              <button onClick={() => setShowVersions(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {(doc.versions || []).slice().reverse().map((v) => (
                <div key={v.version} className="flex items-center gap-3 p-3 bg-[rgb(var(--muted))] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center text-sm font-bold text-[rgb(var(--primary))]">
                    v{v.version}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{v.changelog || 'No changelog'}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {formatFileSize(v.fileSize)} · {formatRelativeTime(v.uploadedAt)}
                    </p>
                  </div>
                  <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                    <Download size={14} />
                  </a>
                </div>
              ))}
              {(!doc.versions || doc.versions.length === 0) && (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">No version history</p>
              )}
            </div>
          </motion.div>
        )}

        {showTagEdit && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tags</h3>
              <button onClick={() => setShowTagEdit(false)}><X size={18} /></button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" className="input-field flex-1" onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }} />
              <button onClick={handleAddTag} className="btn-primary text-sm"><Plus size={16} /></button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {doc.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {doc.aiSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-200 dark:border-rose-800">
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">AI Summary</p>
            <p className="text-sm">{doc.aiSummary}</p>
            {doc.aiTags && doc.aiTags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {doc.aiTags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <CommentSection documentId={doc.id} />
      </div>
    </AppLayout>
  );
}
