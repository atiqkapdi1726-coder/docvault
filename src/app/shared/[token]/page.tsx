'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentService } from '@/lib/services/document';
import { formatFileSize, formatDate, getFileExtension } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, Clock, AlertCircle } from 'lucide-react';
import type { Document, SharedLink } from '@/lib/types';

export default function SharedDocumentPage() {
  const params = useParams();
  const token = params.token as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [shareLink, setShareLink] = useState<SharedLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadLink = async () => {
      try {
        const link = await documentService.getShareLink(token);
        if (!link) {
          setError('This link is invalid or has been revoked');
          setLoading(false);
          return;
        }
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          setError('This link has expired');
          setLoading(false);
          return;
        }
        if (link.maxAccess && link.accessCount >= link.maxAccess) {
          setError('This link has reached its maximum number of views');
          setLoading(false);
          return;
        }
        setShareLink(link);
        if (!link.password) {
          setAuthenticated(true);
          const doc = await documentService.getDocument(link.documentId);
          setDocument(doc as Document);
          await documentService.incrementAccessCount(link.id);
        } else {
          setShowPassword(true);
        }
      } catch {
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    if (token) loadLink();
  }, [token]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shareLink?.password === password) {
      try {
        setAuthenticated(true);
        setShowPassword(false);
        const doc = await documentService.getDocument(shareLink.documentId);
        setDocument(doc as Document);
        await documentService.incrementAccessCount(shareLink.id);
      } catch {
        setError('Failed to load document');
        setAuthenticated(false);
      }
    } else {
      setError('Incorrect password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]" />
      </div>
    );
  }

  if (error && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center max-w-md w-full"
        >
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Unavailable</h1>
          <p className="text-[rgb(var(--muted-foreground))]">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (showPassword && shareLink?.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Lock size={40} className="mx-auto text-[rgb(var(--primary))] mb-3" />
            <h1 className="text-xl font-bold">Password Protected</h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Enter the password to view this document</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-field"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">Access Document</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-12"
      >
        <div className="card p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-blue-600">
                {document ? getFileExtension(document.name).toUpperCase() : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{document?.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                <span>{document ? formatFileSize(document.fileSize) : ''}</span>
                {document?.createdAt && <span>Uploaded {formatDate(document.createdAt)}</span>}
              </div>
            </div>
            {document?.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <Download size={16} /> Download
              </a>
            )}
          </div>

          {document?.description && (
            <div className="p-4 bg-[rgb(var(--muted))] rounded-lg mb-4">
              <p className="text-sm">{document.description}</p>
            </div>
          )}

          {document?.tags && document.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {document.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {document?.aiSummary && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">AI Summary</p>
              <p className="text-sm">{document.aiSummary}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-[rgb(var(--muted-foreground))]">
          <p>Shared via DocVault</p>
          {shareLink?.expiresAt && (
            <p className="flex items-center justify-center gap-1 mt-1">
              <Clock size={12} /> Expires {formatDate(shareLink.expiresAt)}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
