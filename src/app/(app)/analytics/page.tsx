'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { useActivity } from '@/lib/hooks';
import { formatFileSize, getMimeTypeCategory } from '@/lib/utils';
import { motion } from 'framer-motion';
import { documentService } from '@/lib/services/document';
import type { Document } from '@/lib/types';
import {
  BarChart3, FileText, HardDrive, TrendingUp,
  Activity as ActivityIcon, Image, Film, Music, File,
  FileSpreadsheet, Presentation, Archive, FileType,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { currentWorkspace } = useAppStore();
  const { activities } = useActivity();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) return;
    const load = async () => {
      try {
        const docs = await documentService.getDocuments(currentWorkspace.id);
        setDocuments(docs as Document[]);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [currentWorkspace]);

  const stats = useMemo(() => {
    const totalSize = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
    const filesByType: Record<string, { count: number; size: number }> = {};
    documents.forEach((d) => {
      const cat = getMimeTypeCategory(d.mimeType);
      if (!filesByType[cat]) filesByType[cat] = { count: 0, size: 0 };
      filesByType[cat].count += 1;
      filesByType[cat].size += d.fileSize || 0;
    });

    const monthlyUploads: Record<string, number> = {};
    documents.forEach((d) => {
      const date = new Date(d.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyUploads[key] = (monthlyUploads[key] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyUploads).sort().slice(-6);
    const uploadsOverTime = sortedMonths.map((m) => ({
      month: m,
      label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' }),
      count: monthlyUploads[m],
    }));

    const actionCounts: Record<string, number> = {};
    activities.forEach((a) => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });

    return { totalSize, filesByType, uploadsOverTime, actionCounts };
  }, [documents, activities]);

  const maxUploads = Math.max(...stats.uploadsOverTime.map((u) => u.count), 1);

  const typeIcons: Record<string, typeof FileText> = {
    image: Image,
    video: Film,
    audio: Music,
    pdf: FileType,
    document: FileText,
    spreadsheet: FileSpreadsheet,
    presentation: Presentation,
    archive: Archive,
    text: File,
    other: File,
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Storage usage and activity insights for your workspace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Files', value: documents.length, icon: FileText, color: 'from-rose-500 to-pink-500' },
            { label: 'Total Size', value: formatFileSize(stats.totalSize), icon: HardDrive, color: 'from-violet-500 to-purple-500' },
            { label: 'File Types', value: Object.keys(stats.filesByType).length, icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
            { label: 'Activities', value: activities.length, icon: ActivityIcon, color: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
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
                  <p className="text-2xl font-bold mt-1">{loading ? '—' : stat.value}</p>
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
                <TrendingUp size={18} className="text-[rgb(var(--primary))]" />
                Uploads Over Time
              </h2>
            </div>
            <div className="p-5">
              {stats.uploadsOverTime.length > 0 ? (
                <div className="flex items-end gap-3 h-48">
                  {stats.uploadsOverTime.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                        {item.count}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.count / maxUploads) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 to-pink-400 min-h-[4px]"
                      />
                      <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-[rgb(var(--muted-foreground))]">
                  No upload data yet
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
                <HardDrive size={18} className="text-[rgb(var(--primary))]" />
                Storage by Type
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {Object.keys(stats.filesByType).length > 0 ? (
                Object.entries(stats.filesByType)
                  .sort((a, b) => b[1].size - a[1].size)
                  .map(([type, data]) => {
                    const Icon = typeIcons[type] || File;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 capitalize font-medium">
                            <Icon size={14} className="text-[rgb(var(--primary))]" />
                            {type}
                          </span>
                          <span className="text-[rgb(var(--muted-foreground))]">
                            {data.count} file{data.count !== 1 ? 's' : ''} · {formatFileSize(data.size)}
                          </span>
                        </div>
                        <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.size / (stats.totalSize || 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-[rgb(var(--muted-foreground))]">
                  No files to analyze
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="p-5 border-b border-[rgb(var(--border))]">
            <h2 className="font-semibold flex items-center gap-2">
              <ActivityIcon size={18} className="text-[rgb(var(--primary))]" />
              Recent Activity Breakdown
            </h2>
          </div>
          <div className="p-5">
            {Object.keys(stats.actionCounts).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(stats.actionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([action, count]) => (
                    <div key={action} className="text-center p-4 rounded-xl bg-[rgb(var(--muted))]/50">
                      <p className="text-2xl font-bold text-[rgb(var(--primary))]">{count}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] capitalize mt-1">
                        {action.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[rgb(var(--muted-foreground))]">
                No activity recorded yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
