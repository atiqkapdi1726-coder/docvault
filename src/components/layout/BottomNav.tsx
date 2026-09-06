'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Plus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/documents', label: 'Docs', icon: FileText },
  { href: '/documents?upload=true', label: 'Upload', icon: Plus, isAction: true },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/activity', label: 'Feed', icon: Activity },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/documents?upload=true' && pathname.startsWith(item.href + '/'));
          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25"
                >
                  <item.icon size={24} />
                </motion.div>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[56px]',
                isActive
                  ? 'text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--muted-foreground))]'
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[rgb(var(--primary))] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
