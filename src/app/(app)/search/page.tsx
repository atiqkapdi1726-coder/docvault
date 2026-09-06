'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { useDocuments } from '@/lib/hooks';
import { documentService } from '@/lib/services/document';
import { formatFileSize, formatRelativeTime, getFileExtension, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Filter, X, SortAsc, Sparkles, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils';
import Link from 'next/link';
import type { Document } from '@/lib/types';
import { toast } from '@/components/ui/Toaster';

export default function SearchPage() {
  const { currentWorkspace, documents } = useAppStore();
  useDocuments(); // keeps the store's documents fresh (real-time) for AI search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [aiMode, setAiMode] = useState(false);

  const runAiSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || documents.length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace?.id,
          query: searchQuery,
          documents: documents.slice(0, 100).map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            tags: d.tags,
            aiSummary: d.aiSummary,
          })),
        }),
      });
      const data = await res.json();
      if (data?.success) {
        const matched = documents.filter((d) => data.results.includes(d.id));
        setResults(matched);
      } else {
        toast(data?.error || 'AI search failed', 'error');
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = useCallback(
    debounce(async (...args: unknown[]) => {
      const searchQuery = args[0] as string;
      const mode = args[1] as boolean;
      if (!currentWorkspace || !searchQuery.trim()) {
        setResults([]);
        return;
      }
      if (mode) {
        await runAiSearch(searchQuery);
        return;
      }
      setLoading(true);
      try {
        const docs = await documentService.searchDocuments(currentWorkspace.id, searchQuery);
        setResults(docs as Document[]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400),
    [currentWorkspace, documents]
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    performSearch(value, aiMode);
  };

  const toggleAiMode = () => {
    const next = !aiMode;
    setAiMode(next);
    if (query.trim()) performSearch(query, next);
  };

  const filteredResults = results.filter((doc) => {
    if (typeFilter === 'all') return true;
    return doc.mimeType.includes(typeFilter);
  });

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Search Documents</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">Find documents across your workspace</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            {aiMode ? (
              <Sparkles size={20} className="text-blue-500" />
            ) : (
              <Search size={20} className="text-[rgb(var(--muted-foreground))]" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={aiMode ? 'Describe what you are looking for…' : 'Search by name, description, tags...'}
              className="flex-1 bg-transparent outline-none text-lg"
              autoFocus
            />
            {loading && <Loader2 size={18} className="animate-spin text-blue-500" />}
            {query && !loading && (
              <button onClick={() => { setQuery(''); setResults([]); }} className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                <X size={20} />
              </button>
            )}
            <button
              onClick={toggleAiMode}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                aiMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md'
                  : 'border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:border-blue-400 hover:text-blue-600'
              )}
              title="AI semantic search - find by meaning, not exact words"
            >
              <Sparkles size={14} />
              AI Search
            </button>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {['all', 'pdf', 'word', 'image', 'spreadsheet'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'px-3 py-1 text-sm rounded-full transition-colors capitalize',
                  typeFilter === type
                    ? 'bg-[rgb(var(--primary))] text-white'
                    : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]/80'
                )}
              >
                {type}
              </button>
            ))}
          </div>
          {aiMode && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-1.5">
              <Sparkles size={12} />
              AI search finds documents by meaning — e.g. &ldquo;tax paperwork from last year&rdquo; matches invoice and tax files.
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[rgb(var(--muted))]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-[rgb(var(--muted))] rounded" />
                    <div className="h-3 w-32 bg-[rgb(var(--muted))] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            </p>
            {filteredResults.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="card p-4 flex items-center gap-4 hover:border-[rgb(var(--primary))]/50 transition-all block"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">
                      {getFileExtension(doc.name).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] truncate">
                      {doc.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">·</span>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatRelativeTime(doc.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-[rgb(var(--muted-foreground))] mb-4 opacity-50" />
            <p className="text-[rgb(var(--muted-foreground))]">No results found for &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
