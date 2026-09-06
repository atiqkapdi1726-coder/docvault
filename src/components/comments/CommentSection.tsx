'use client';

import { useEffect, useState } from 'react';
import { commentService } from '@/lib/services/comment';
import { useAppStore } from '@/lib/stores/appStore';
import { formatRelativeTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import type { Comment } from '@/lib/types';

interface CommentSectionProps {
  documentId: string;
}

export function CommentSection({ documentId }: CommentSectionProps) {
  const { user } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = commentService.subscribeToComments(documentId, (data) => {
      setComments(data as Comment[]);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [documentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await commentService.addComment({
      documentId,
      userId: user.uid,
      userName: user.displayName,
      userPhotoURL: user.photoURL || null,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: null,
    });
    setNewComment('');
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    await commentService.updateComment(commentId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId: string) => {
    await commentService.deleteComment(commentId);
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-[rgb(var(--border))]">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare size={18} /> Comments ({comments.length})
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[rgb(var(--muted))]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-[rgb(var(--muted))] rounded" />
                  <div className="h-4 w-full bg-[rgb(var(--muted))] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {comment.userName?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.userName}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">(edited)</span>
                  )}
                  {comment.userId === user?.uid && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                        className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menuOpenId === comment.id && (
                        <div className="absolute right-0 top-6 w-32 card p-1 shadow-lg z-10">
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))]"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(comment.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {editingId === comment.id ? (
                  <div className="mt-1 flex gap-2">
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input-field flex-1 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEdit(comment.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button onClick={() => handleEdit(comment.id)} className="btn-primary text-sm px-3">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost text-sm">Cancel</button>
                  </div>
                ) : (
                  <p className="text-sm mt-0.5">{comment.content}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[rgb(var(--border))]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="input-field flex-1"
          />
          <button type="submit" disabled={!newComment.trim()} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
