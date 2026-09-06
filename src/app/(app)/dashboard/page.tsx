'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { useActivity } from '@/lib/hooks';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  FileText, FolderOpen, Users, HardDrive, TrendingUp,
  Upload, Clock, Star, Activity as ActivityIcon,
} from 'lucide-react';
import { documentService } from '@/lib/services/document';
import { folderService } from '@/lib/services/folder';

export default function DashboardPage() {
  const { user, currentWorkspace } = useAppStore();
  const [stats, setStats] = useState({
    docCount: 0,
    folderCount: 0,
    memberCount: 0,
    totalSize: 0,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const { activities } = useActivity();

  useEffect(() => {
    if (!currentWorkspace) return;
    const loadStats = async () => {
      try {
        const docs = await documentService.getDocuments(currentWorkspace.id);
        const folders = await folderService.getFolders(currentWorkspace.id);
        setStats({
          docCount: docs.length,
          folderCount: folders.length,
          memberCount: currentWorkspace.members?.length || 0,
          totalSize: docs.reduce((sum: number, d: any) => sum + (d.fileSize || 0), 0),
        });
        setRecentDocs(docs.slice(0, 5));
      } catch {}
    };
    loadStats();
  }, [currentWorkspace]);

  const statCards = [
    { label: 'Documents', value: stats.docCount, icon: FileText, color: 'from-rose-500 to-pink-500' },
    { label: 'Folders', value: stats.folderCount, icon: FolderOpen, color: 'from-violet-500 to-purple-500' },
    { label: 'Team Members', value: stats.memberCount, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Storage Used', value: formatFileSize(stats.totalSize), icon: HardDrive, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Here&apos;s what&apos;s happening in your workspace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="p-5 border-b border-[rgb(var(--border))]">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock size={18} className="text-[rgb(var(--primary))]" />
                Recent Documents
              </h2>
            </div>
            <div className="divide-y divide-[rgb(var(--border))]">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <div key={doc.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[rgb(var(--muted))]/50 transition-colors">
                    <FileText size={18} className="text-[rgb(var(--primary))]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatFileSize(doc.fileSize)} · {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-[rgb(var(--muted-foreground))]">
                  No documents yet. Upload your first file!
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="p-5 border-b border-[rgb(var(--border))]">
              <h2 className="font-semibold flex items-center gap-2">
                <ActivityIcon size={18} className="text-[rgb(var(--primary))]" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-[rgb(var(--border))]">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {activity.userName?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{' '}
                        {activity.details}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-[rgb(var(--muted-foreground))]">
                  No activity yet
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
