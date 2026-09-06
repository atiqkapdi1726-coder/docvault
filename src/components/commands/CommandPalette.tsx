'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, FolderOpen, Hash, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { documentService } from '@/lib/services/document';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const commands = [
  { id: 'upload', label: 'Upload document', icon: FileText, href: '/documents' },
  { id: 'new-folder', label: 'Create new folder', icon: FolderOpen, href: '/documents' },
  { id: 'search', label: 'Search documents', icon: Search, href: '/search' },
  { id: 'dashboard', label: 'Go to Dashboard', icon: Hash, href: '/dashboard' },
  { id: 'workspaces', label: 'Manage workspaces', icon: Hash, href: '/workspaces' },
  { id: 'activity', label: 'View activity', icon: Hash, href: '/activity' },
  { id: 'audit', label: 'View audit log', icon: Hash, href: '/audit' },
  { id: 'settings', label: 'Settings', icon: Hash, href: '/settings' },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentWorkspace } = useAppStore();
  const [results, setResults] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query || !currentWorkspace) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const docs = await documentService.searchDocuments(currentWorkspace.id, query);
        setResults(
          docs.slice(0, 5).map((d) => ({
            id: d.id,
            name: d.name,
            type: 'document',
          }))
        );
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, currentWorkspace]);

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  interface AllItem {
    id: string;
    name: string;
    type: string;
    icon?: any;
    href?: string;
    isResult: boolean;
  }

  const allItems: AllItem[] = [
    ...results.map((r) => ({ ...r, isResult: true } as AllItem)),
    ...filteredCommands.map((c) => ({ id: c.id, name: c.label, type: 'command', icon: c.icon, href: c.href, isResult: false } as AllItem)),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: typeof allItems[0]) => {
    if ('href' in item && item.href) {
      router.push(item.href as string);
    } else if (item.type === 'document') {
      router.push(`/documents/${item.id}`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      handleSelect(allItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-[15vh] max-w-xl mx-auto z-50"
          >
            <div className="card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border))]">
                <Search size={18} className="text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button onClick={onClose} className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {results.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-medium text-[rgb(var(--muted-foreground))]">Documents</p>
                    {results.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item as unknown as AllItem)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          selectedIndex === i
                            ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                            : 'hover:bg-[rgb(var(--muted))]'
                        )}
                      >
                        <FileText size={16} />
                        <span className="flex-1 text-left truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <p className="px-2 py-1 text-xs font-medium text-[rgb(var(--muted-foreground))]">Commands</p>
                  {filteredCommands.map((cmd, i) => {
                    const idx = results.length + i;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect({ id: cmd.id, name: cmd.label, type: 'command', isResult: false })}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          selectedIndex === idx
                            ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                            : 'hover:bg-[rgb(var(--muted))]'
                        )}
                      >
                        <cmd.icon size={16} />
                        <span className="flex-1 text-left">{cmd.label}</span>
                        <ArrowRight size={14} className="text-[rgb(var(--muted-foreground))]" />
                      </button>
                    );
                  })}
                </div>

                {allItems.length === 0 && (
                  <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-8">
                    No results found
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
