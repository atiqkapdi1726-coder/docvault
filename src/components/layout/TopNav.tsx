'use client';

import { useAuthContext } from '@/components/auth/AuthProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAppStore } from '@/lib/stores/appStore';
import { cn } from '@/lib/utils';
import {
  Menu, X, Search, Bell, Moon, Sun, LogOut, Settings, User,
  Command,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { CommandPalette } from '@/components/commands/CommandPalette';

export function TopNav() {
  const { user } = useAuthContext();
  const { darkMode, toggleDarkMode } = useTheme();
  const { sidebarOpen, setSidebarOpen, commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
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

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--primary))] rounded-full" />
              </button>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--destructive))] transition-colors"
                    >
                      <LogOut size={16} /> Sign out
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
