'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useActivity } from '@/lib/hooks';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Upload, Edit3, Trash2, Share2, Download, MessageSquare,
  Star, ArrowRight, Activity,
} from 'lucide-react';

const actionIcons: Record<string, any> = {
  upload: Upload,
  edit: Edit3,
  delete: Trash2,
  share: Share2,
  download: Download,
  comment: MessageSquare,
  star: Star,
  move: ArrowRight,
};

const actionColors: Record<string, string> = {
  upload: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  edit: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  delete: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  share: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  download: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  comment: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  star: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  move: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
};

export default function ActivityPage() {
  const { activities } = useActivity();

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Feed</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">Recent activity in your workspace</p>
        </div>

        <div className="card">
          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={48} className="mx-auto text-[rgb(var(--muted-foreground))] mb-4 opacity-50" />
              <p className="text-[rgb(var(--muted-foreground))]">No activity yet</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Activity will appear here when you upload, edit, or share documents</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              {activities.map((activity, i) => {
                const Icon = actionIcons[activity.action] || Upload;
                const colorClass = actionColors[activity.action] || 'bg-gray-100 text-gray-600';

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-4 p-4"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{' '}
                        {activity.details}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
