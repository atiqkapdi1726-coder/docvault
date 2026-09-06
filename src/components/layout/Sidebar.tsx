'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/stores/appStore';
import { useWorkspace } from '@/lib/hooks';
import { cn, formatFileSize } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { documentService } from '@/lib/services/document';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, FolderOpen, Users, Search,
  Activity, Shield, Settings, ChevronDown, Plus, Star,
  BarChart3, Trash2, Share2, HardDrive,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/starred', label: 'Starred', icon: Star },
  { href: '/shared-with-me', label: 'Shared With Me', icon: Share2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/workspaces', label: 'Workspaces', icon: Users },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/audit', label: 'Audit Log', icon: Shield },
  { href: '/trash', label: 'Trash', icon: Trash2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const storageLimit = 10 * 1024 * 1024 * 1024;

  useEffect(() => {
    if (!currentWorkspace) return;
    documentService.getDocuments(currentWorkspace.id).then((docs) => {
      const total = docs.reduce((sum: number, d: any) => sum + (d.fileSize || 0), 0);
      setStorageUsed(total);
    }).catch(() => {});
  }, [currentWorkspace?.id]);

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed inset-y-0 left-0 z-30 w-[280px] border-r border-[rgb(var(--border))]',
              'bg-[rgb(var(--sidebar-bg))] flex flex-col',
              'lg:relative lg:translate-x-0',
              !sidebarOpen && 'lg:hidden'
            )}
          >
            <div className="p-4 border-b border-[rgb(var(--border))]">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">DV</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">DocVault</h1>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Document Management</p>
                </div>
              </Link>
            </div>

            <div className="p-3">
              <div className="relative">
                <button
                  onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {currentWorkspace?.name?.[0] || 'W'}
                    </div>
                    <span className="truncate">{currentWorkspace?.name || 'Select workspace'}</span>
                  </div>
                  <ChevronDown size={14} className={cn('transition-transform', wsDropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {wsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-1 card p-1 shadow-lg z-50"
                    >
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => {
                            setCurrentWorkspace(ws);
                            setWsDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                            currentWorkspace?.id === ws.id
                              ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                              : 'hover:bg-[rgb(var(--muted))]'
                          )}
                        >
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs">
                            {ws.name[0]}
                          </div>
                          <span className="truncate">{ws.name}</span>
                          <span className="ml-auto text-xs text-[rgb(var(--muted-foreground))]">{ws.type}</span>
                        </button>
                      ))}
                      <Link
                        href="/workspaces"
                        onClick={() => setWsDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--primary))]"
                      >
                        <Plus size={14} /> Manage workspaces
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn('sidebar-item', isActive && 'active')}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[rgb(var(--border))]">
              <div className="card p-3 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-sm font-medium">Storage Used</span>
                </div>
                <div className="w-full h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  {formatFileSize(storageUsed)} of {formatFileSize(storageLimit)} used
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
