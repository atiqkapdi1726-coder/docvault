'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { auditService } from '@/lib/services/audit';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import type { AuditLog } from '@/lib/types';

export default function AuditPage() {
  const { currentWorkspace } = useAppStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentWorkspace) return;
    const loadLogs = async () => {
      const data = await auditService.getLogs(currentWorkspace.id);
      setLogs(data as AuditLog[]);
    };
    loadLogs();
  }, [currentWorkspace]);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter((log) => log.resourceType === filter);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield size={24} /> Audit Log
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">Track all actions in your workspace</p>
          </div>
          <div className="flex gap-2">
            {['all', 'document', 'folder', 'workspace', 'user', 'share'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                  filter === type
                    ? 'bg-[rgb(var(--primary))] text-white'
                    : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-[rgb(var(--muted-foreground))]">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgb(var(--muted))]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Resource</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border))]">
                  {filteredLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[rgb(var(--muted))]/50"
                    >
                      <td className="px-4 py-3 text-sm text-[rgb(var(--muted-foreground))] whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{log.userName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{log.resourceType}: {log.resourceName}</td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--muted-foreground))]">{log.details}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
