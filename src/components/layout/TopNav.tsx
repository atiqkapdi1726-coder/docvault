'use client';

import { useAuthContext } from '@/components/auth/AuthProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Menu, X, Search, Bell, Moon, Sun, Settings, LogOut, BellOff,
  Command,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { CommandPalette } from '@/components/commands/CommandPalette';
import { activityService } from '@/lib/services/activity';
import type { Activity } from '@/lib/types';

export function TopNav() {
  const { user, signOut } = useAuthContext();
  const { darkMode, toggleDarkMode } = useTheme();
  const { sidebarOpen, setSidebarOpen, commandPaletteOpen, setCommandPaletteOpen, currentWorkspace } = useAppStore();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Activity[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;
    let unsub: (() => void) | undefined;
    try {
      const result = activityService.subscribeToActivities(
        currentWorkspace.id,
        (data) => setNotifications((data as unknown as Activity[]).slice(0, 10))
      );
      if (typeof result === 'function') unsub = result;
    } catch {
      activityService.getActivities(currentWorkspace.id, 10).then((data) => {
        setNotifications(data as unknown as Activity[]);
      }).catch(() => {});
    }
    return () => {
      try { if (unsub) unsub(); } catch {}
    };
  }, [currentWorkspace?.id]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    router.replace('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DV</span>
              </div>
              <span className="font-semibold text-lg">DocVault</span>
            </div>
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]/80 transition-colors text-sm w-72"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search documents...</span>
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-[rgb(var(--card))] border border-[rgb(var(--border))]">
              <Command size={10} className="inline" /> K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--primary))] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-80 card shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[rgb(var(--border))] flex items-center justify-between">
                      <p className="font-semibold text-sm">Notifications</p>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {notifications.length} recent
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <BellOff size={28} className="mx-auto text-[rgb(var(--muted-foreground))] mb-2 opacity-50" />
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">
                            No notifications yet
                          </p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                            Workspace activity will appear here
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 flex items-start gap-3 hover:bg-[rgb(var(--muted))]/50 transition-colors border-b border-[rgb(var(--border))] last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {n.userName?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{n.userName}</span>{' '}
                                {n.details}
                              </p>
                              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                                {formatRelativeTime(n.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => { setNotifOpen(false); router.push('/activity'); }}
                      className="w-full px-4 py-3 text-sm text-[rgb(var(--primary))] hover:bg-[rgb(var(--muted))]/50 transition-colors border-t border-[rgb(var(--border))]"
                    >
                      View all activity
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
              >
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user ? getInitials(user.displayName || user.email) : '?'}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-56 card p-2 shadow-lg z-50"
                  >
                    <div className="px-3 py-2 border-b border-[rgb(var(--border))]">
                      <p className="font-medium text-sm">{user?.displayName}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { router.push('/settings'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))] text-red-600 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
