'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { workspaceService } from '@/lib/services/workspace';
import { useWorkspace } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Plus, Users, Settings, Trash2, Crown, Shield, Edit3, Eye,
  UserPlus, Copy, Check,
} from 'lucide-react';
import type { Workspace, WorkspaceMember, UserRole } from '@/lib/types';

export default function WorkspacesPage() {
  const { user } = useAppStore();
  const { workspaces, loadWorkspaces } = useWorkspace();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('editor');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    await workspaceService.createWorkspace({
      name: newName.trim(),
      type: 'team',
      ownerId: user.uid,
      members: [
        {
          uid: user.uid,
          role: 'admin',
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewName('');
    setShowNew(false);
    loadWorkspaces();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedWs || !user) return;
    await workspaceService.addMember(selectedWs.id, {
      uid: `pending_${inviteEmail}`,
      role: inviteRole,
      displayName: inviteEmail.split('@')[0],
      email: inviteEmail,
      photoURL: null,
      joinedAt: new Date().toISOString(),
    });
    setInviteEmail('');
    loadWorkspaces();
  };

  const handleRemoveMember = async (wsId: string, uid: string) => {
    await workspaceService.removeMember(wsId, uid);
    loadWorkspaces();
  };

  const handleRoleChange = async (wsId: string, uid: string, role: UserRole) => {
    await workspaceService.updateMemberRole(wsId, uid, role);
    loadWorkspaces();
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">Manage your team workspaces</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Workspace
          </button>
        </div>

        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workspace name"
                className="input-field flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowNew(false);
                }}
              />
              <button onClick={handleCreate} className="btn-primary">Create</button>
              <button onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((ws, i) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'card p-5 cursor-pointer transition-all hover:shadow-md',
                selectedWs?.id === ws.id && 'ring-2 ring-[rgb(var(--primary))]'
              )}
              onClick={() => setSelectedWs(ws)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {ws.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{ws.name}</h3>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {ws.type === 'personal' ? 'Personal' : 'Team'} · {ws.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2 mt-3">
                {(ws.members || []).slice(0, 5).map((member, j) => (
                  <div
                    key={member.uid}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 border-2 border-[rgb(var(--card))] flex items-center justify-center text-white text-xs font-medium"
                    title={member.displayName}
                  >
                    {member.displayName?.[0] || '?'}
                  </div>
                ))}
                {(ws.members || []).length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-[rgb(var(--muted))] border-2 border-[rgb(var(--card))] flex items-center justify-center text-xs font-medium">
                    +{(ws.members || []).length - 5}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {selectedWs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedWs.name} Members</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWs.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email"
                className="input-field flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="input-field w-32"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button onClick={handleInvite} className="btn-primary flex items-center gap-1">
                <UserPlus size={16} /> Invite
              </button>
            </div>

            <div className="divide-y divide-[rgb(var(--border))]">
              {(selectedWs.members || []).map((member) => (
                <div key={member.uid} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                    {member.displayName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{member.displayName}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{member.email}</p>
                  </div>
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(selectedWs.id, member.uid, e.target.value as UserRole)}
                    className="input-field w-28 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {member.uid !== user?.uid && (
                    <button
                      onClick={() => handleRemoveMember(selectedWs.id, member.uid)}
                      className="p-2 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
