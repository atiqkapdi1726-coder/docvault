'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/stores/appStore';
import { documentService } from '@/lib/services/document';
import { storageService } from '@/lib/firebase/storage';
import { commentService } from '@/lib/services/comment';
import { formatFileSize, formatRelativeTime, formatDate, getFileExtension, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  FileText, Download, Share2, Trash2, Tag, Clock, Eye,
  MessageSquare, Plus, Send, Link2, Copy, Check, Lock,
  History, X, Calendar, FileImage, RotateCcw, Sparkles, Bot, User as UserIcon, Loader2, Upload, ScrollText, Pencil,
} from 'lucide-react';
import type { Document, Comment, SharedLink, DocumentVersion } from '@/lib/types';
import { CommentSection } from '@/components/comments/CommentSection';
import { toast } from '@/components/ui/Toaster';

function EditDescription({ doc, onSaved }: { doc: Document; onSaved: (d: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(doc.description || '');
  const [saving, setSaving] = useState(false);

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-field flex-1 text-sm min-h-[70px] resize-y"
          placeholder="Add a description for this document…"
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => {
              setSaving(true);
              try {
                await documentService.updateDescription(doc.id, value.trim());
                onSaved(value.trim());
                setEditing(false);
                toast('Description saved', 'success');
              } catch {
                toast('Failed to save description', 'error');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
          </button>
          <button onClick={() => { setValue(doc.description || ''); setEditing(false); }} className="btn-ghost text-xs">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <p className={cn('text-sm', !doc.description && 'text-[rgb(var(--muted-foreground))] italic')}>
        {doc.description || 'No description yet — add one to help search and AI.'}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0"
      >
        <Pencil size={12} /> {doc.description ? 'Edit' : 'Add'}
      </button>
    </div>
  );
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { user } = useAppStore();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTagEdit, setShowTagEdit] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);

  // AI chat state
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const versionsRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll any opened panel into view (panels sit below the tall preview)
  useEffect(() => {
    if (showAIChat) setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [showAIChat]);
  useEffect(() => {
    if (showShare) setTimeout(() => shareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [showShare]);
  useEffect(() => {
    if (showVersions) setTimeout(() => versionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [showVersions]);
  useEffect(() => {
    if (showTagEdit) setTimeout(() => tagsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [showTagEdit]);

  const toggleAIChat = () => {
    setShowAIChat((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return next;
    });
  };

  const askAI = async (question: string) => {
    if (!question.trim() || !doc || chatLoading) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          question,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      const answer =
        data?.answer ||
        (data?.error?.includes('not configured')
          ? 'AI features are temporarily unavailable. Please contact support if this persists.'
          : 'Sorry, I could not answer that right now.');
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const regenerateAnalysis = async () => {
    if (!doc || aiBusy) return;
    setAiBusy(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (data?.success) {
        // Client (signed-in) saves the AI results to Firestore
        await documentService.updateDocument(doc.id, {
          aiSummary: data.aiSummary,
          aiTags: data.aiTags,
          description: data.description,
        } as any);
        setDoc({
          ...doc,
          aiSummary: data.aiSummary,
          aiTags: data.aiTags,
          description: data.description,
        });
        toast('AI analysis complete', 'success');
      } else {
        toast(data?.error || 'AI analysis failed', 'error');
      }
    } catch {
      toast('AI analysis failed', 'error');
    } finally {
      setAiBusy(false);
    }
  };

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

  // Load Base64 file data for inline preview + working download
  useEffect(() => {
    if (!doc?.fileUrl) return;
    let cancelled = false;
    setPreviewLoading(true);
    storageService.downloadFile(doc.fileUrl).then((data) => {
      if (!cancelled) setFileData(data);
    }).catch(() => {}).finally(() => {
      if (!cancelled) setPreviewLoading(false);
    });
    return () => { cancelled = true; };
  }, [doc?.fileUrl]);

  const isPreviewable =
    fileData &&
    (doc?.mimeType?.startsWith('image/') ||
     doc?.mimeType === 'application/pdf' ||
     doc?.mimeType?.startsWith('text/') ||
     doc?.mimeType === 'application/json');

  const isTextPreview =
    fileData && doc?.mimeType?.startsWith('text/') || doc?.mimeType === 'application/json';

  const handleCreateShareLink = async () => {
    if (!doc || !user) return;
    const expiryDate = shareExpiry
      ? new Date(Date.now() + parseInt(shareExpiry) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { token } = await documentService.createShareLink({
      documentId: doc.id,
      workspaceId: doc.workspaceId,
      createdBy: user.uid,
      expiresAt: expiryDate,
      password: sharePassword || null,
      maxAccess: null,
    });

    const link = `${window.location.origin}/shared/${token}`;
    setShareLink(link);
    toast('Share link created', 'success');
    const links = await documentService.getSharedLinksForDocument(doc.id);
    setSharedLinks(links as SharedLink[]);
  };

  const handleDownload = async () => {
    if (!doc) return;
    try {
      await documentService.downloadDocument(doc);
      toast('Download started', 'success');
    } catch {
      toast('Download failed', 'error');
    }
  };

  const handleArchive = async () => {
    if (!doc) return;
    try {
      await documentService.archiveDocument(doc.id);
      toast('Document moved to Trash', 'info');
      router.push('/documents');
    } catch {
      toast('Failed to archive document', 'error');
    }
  };

  // ---------- OCR ----------
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrCopied, setOcrCopied] = useState(false);

  const runOCR = async () => {
    if (!doc || ocrLoading) return;
    setOcrLoading(true);
    setOcrText(null);
    try {
      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (data?.success) {
        setOcrText(data.text);
        if (data.text === '[No text detected]') {
          toast('No text found in this file', 'info');
        } else {
          toast('Text extracted', 'success');
        }
      } else {
        toast(data?.error || 'OCR failed', 'error');
      }
    } catch {
      toast('OCR failed', 'error');
    } finally {
      setOcrLoading(false);
    }
  };

  // ---------- New version upload ----------
  const [versionNote, setVersionNote] = useState('');
  const [uploadingVersion, setUploadingVersion] = useState(false);

  const handleVersionUpload = async (file: File) => {
    if (!doc || !user || uploadingVersion) return;
    setUploadingVersion(true);
    try {
      const stored = await storageService.uploadFile(file, `workspaces/${doc.workspaceId}/documents`);

      // AI-polish the changelog note (optional, falls back to plain note)
      let changelog = versionNote.trim() || 'New version uploaded';
      try {
        const res = await fetch('/api/ai/changelog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentName: doc.name, changelog: versionNote }),
        });
        const data = await res.json();
        if (data?.changelog) changelog = data.changelog;
      } catch {}

      const newVersion: DocumentVersion = {
        version: (doc.version || 1) + 1,
        fileUrl: stored.fileUrl,
        fileSize: stored.fileSize,
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString(),
        changelog,
      };
      const versions = [...(doc.versions || []), newVersion];
      await documentService.updateDocument(doc.id, {
        versions,
        version: newVersion.version,
        fileUrl: stored.fileUrl,
        fileSize: stored.fileSize,
        mimeType: stored.contentType,
      } as any);
      setDoc({
        ...doc,
        versions,
        version: newVersion.version,
        fileUrl: stored.fileUrl,
        fileSize: stored.fileSize,
        mimeType: stored.contentType,
      });
      setVersionNote('');
      toast(`Uploaded v${newVersion.version} — changelog: ${changelog}`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Version upload failed', 'error');
    } finally {
      setUploadingVersion(false);
    }
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">{getFileExtension(doc.name).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold truncate">{doc.name}</h1>
                    <button
                      onClick={() => {
                        const newName = window.prompt('Rename document', doc.name);
                        if (newName && newName.trim() && newName !== doc.name) {
                          documentService.renameDocument(doc.id, newName.trim()).then(() => {
                            setDoc({ ...doc, name: newName.trim() });
                            toast('Document renamed', 'success');
                          }).catch(() => toast('Rename failed', 'error'));
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                      title="Rename"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
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
              <button
                onClick={toggleAIChat}
                className="btn-primary flex items-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Sparkles size={16} /> {showAIChat ? 'Hide AI Chat' : 'Ask AI'}
              </button>
              <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm">
                <Download size={16} /> Download
              </button>
              <button onClick={() => setShowShare(!showShare)} className="btn-secondary flex items-center gap-2 text-sm">
                <Share2 size={16} /> Share
              </button>
              <button onClick={() => setShowVersions(!showVersions)} className="btn-secondary flex items-center gap-2 text-sm">
                <History size={16} /> Versions
              </button>
              <button onClick={() => setShowTagEdit(!showTagEdit)} className="btn-secondary flex items-center gap-2 text-sm">
                <Tag size={16} /> Tags
              </button>
              <button onClick={handleArchive} className="btn-secondary flex items-center gap-2 text-sm text-red-600">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </motion.div>

        {/* Editable description */}
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] mb-2">
            <FileText size={14} /> Description
          </div>
          <EditDescription doc={doc} onSaved={(d) => setDoc({ ...doc, description: d })} />
        </div>

        {/* Inline file preview */}
        {previewLoading ? (
          <div className="card p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]" />
          </div>
        ) : isPreviewable ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
            <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                {doc.mimeType?.startsWith('image/') ? <FileImage size={18} className="text-[rgb(var(--primary))]" /> : <FileText size={18} className="text-[rgb(var(--primary))]" />}
                Preview
              </h3>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                {doc.mimeType}
              </span>
            </div>
            <div className="p-4">
              {doc.mimeType?.startsWith('image/') && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileData!} alt={doc.name} className="max-w-full max-h-[600px] mx-auto rounded-lg" />
              )}
              {doc.mimeType === 'application/pdf' && (
                <iframe src={fileData!} title={doc.name} className="w-full h-[600px] rounded-lg border-0" />
              )}
              {isTextPreview && (
                <pre className="text-sm whitespace-pre-wrap max-h-[600px] overflow-auto bg-[rgb(var(--muted))] rounded-lg p-4">
                  {decodeURIComponent(escape(window.atob(fileData!.split(',')[1] || '')))}
                </pre>
              )}
            </div>
          </motion.div>
        ) : doc.fileUrl ? (
          <div className="card p-8 text-center">
            <FileText size={40} className="mx-auto text-[rgb(var(--muted-foreground))] mb-3 opacity-50" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No inline preview available for this file type
            </p>
            <button onClick={handleDownload} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <Download size={16} /> Download to view
            </button>
          </div>
        ) : null}

        {showShare && (
          <motion.div ref={shareRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4 scroll-mt-20">
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
          <motion.div ref={versionsRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Version History</h3>
              <button onClick={() => setShowVersions(false)}><X size={18} /></button>
            </div>

            {/* Upload new version */}
            <div className="p-4 border border-dashed border-[rgb(var(--border))] rounded-xl space-y-3">
              <p className="text-sm font-medium">Upload new version (v{(doc.version || 1) + 1})</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="What changed? (optional — AI will polish it)"
                  className="input-field flex-1"
                />
                <label className={cn('btn-primary text-sm cursor-pointer flex items-center gap-1.5', uploadingVersion && 'opacity-50 pointer-events-none')}>
                  {uploadingVersion ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploadingVersion ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploadingVersion}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleVersionUpload(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
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
                  <button
                    onClick={async () => {
                      try {
                        const dataUrl = await storageService.downloadFile(v.fileUrl);
                        if (!dataUrl) throw new Error();
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = doc.name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } catch {
                        toast('Download failed', 'error');
                      }
                    }}
                    className="btn-ghost text-sm"
                    title={`Download v${v.version}`}
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
              {(!doc.versions || doc.versions.length === 0) && (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">No version history</p>
              )}
            </div>
          </motion.div>
        )}

        {showTagEdit && (
          <motion.div ref={tagsRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4 scroll-mt-20">
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

        {/* Ask AI chat panel */}
        {showAIChat && (
          <motion.div ref={chatRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden scroll-mt-20">
            <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles size={18} /> Ask AI about this document
              </h3>
              <button onClick={() => setShowAIChat(false)} className="hover:opacity-80">
                <X size={18} />
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot size={36} className="mx-auto text-blue-500 mb-3 opacity-60" />
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                    Ask anything about this document — its content, key points, dates, numbers…
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Summarize this document', 'What are the key points?', 'What dates or deadlines are mentioned?'].map((s) => (
                      <button
                        key={s}
                        onClick={() => askAI(s)}
                        className="px-3 py-1.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[rgb(var(--primary))] text-white'
                        : 'bg-[rgb(var(--muted))]'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center flex-shrink-0">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-[rgb(var(--muted))] rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">Thinking…</span>
                  </div>
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); askAI(chatInput); }}
              className="p-4 border-t border-[rgb(var(--border))] flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about this document…"
                className="input-field flex-1"
                disabled={chatLoading}
              />
              <button type="submit" disabled={!chatInput.trim() || chatLoading} className="btn-primary px-4">
                {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </motion.div>
        )}

        {/* AI Summary card (with regenerate) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Summary</p>
              </div>
              {doc.aiSummary ? (
                <p className="text-sm">{doc.aiSummary}</p>
              ) : (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  No AI summary yet. Generate one to unlock smart search and insights.
                </p>
              )}
              {doc.aiTags && doc.aiTags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {doc.aiTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={regenerateAnalysis}
                disabled={aiBusy}
                className="btn-secondary text-xs flex items-center gap-1.5"
                title="Generate or refresh AI summary"
              >
                {aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {aiBusy ? 'Analyzing…' : doc.aiSummary ? 'Re-analyze' : 'Analyze'}
              </button>
              {(doc.mimeType?.startsWith('image/') || doc.mimeType === 'application/pdf') && (
                <button
                  onClick={runOCR}
                  disabled={ocrLoading}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                  title="Extract all text from this image/PDF using AI"
                >
                  {ocrLoading ? <Loader2 size={14} className="animate-spin" /> : <ScrollText size={14} />}
                  {ocrLoading ? 'Reading…' : 'Extract Text'}
                </button>
              )}
            </div>
          </div>

          {/* OCR result panel */}
          {ocrText && ocrText !== '[No text detected]' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <ScrollText size={14} /> Extracted Text
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ocrText);
                      setOcrCopied(true);
                      setTimeout(() => setOcrCopied(false), 2000);
                    }}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    {ocrCopied ? <Check size={12} /> : <Copy size={12} />} {ocrCopied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={() => setOcrText(null)} className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap max-h-64 overflow-auto bg-[rgb(var(--muted))] rounded-lg p-4">{ocrText}</pre>
            </motion.div>
          )}
        </motion.div>

        <CommentSection documentId={doc.id} />
      </div>
    </AppLayout>
  );
}
