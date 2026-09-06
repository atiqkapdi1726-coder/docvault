import { firestoreService } from '../firebase/firestore';
import type { Workspace } from '../types';

export const workspaceService = {
  getWorkspaces: async (userId: string) => {
    const allWorkspaces = await firestoreService.getDocs('workspaces');
    return (allWorkspaces as Workspace[]).filter((ws) =>
      ws.members?.some((m) => m.uid === userId)
    );
  },

  getWorkspace: async (workspaceId: string) => {
    return firestoreService.getDoc('workspaces', workspaceId) as Promise<Workspace | null>;
  },

  createWorkspace: async (data: Omit<Workspace, 'id'>) => {
    return firestoreService.addDoc('workspaces', data);
  },

  updateWorkspace: async (workspaceId: string, data: Partial<Workspace>) => {
    await firestoreService.updateDoc('workspaces', workspaceId, data);
  },

  deleteWorkspace: async (workspaceId: string) => {
    await firestoreService.deleteDoc('workspaces', workspaceId);
  },

  addMember: async (
    workspaceId: string,
    member: Workspace['members'][0]
  ) => {
    const workspace = await firestoreService.getDoc('workspaces', workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    const ws = workspace as Workspace;
    const members = ws.members || [];
    if (members.some((m) => m.uid === member.uid)) return;
    members.push(member);
    await firestoreService.updateDoc('workspaces', workspaceId, { members });
  },

  removeMember: async (workspaceId: string, uid: string) => {
    const workspace = await firestoreService.getDoc('workspaces', workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    const ws = workspace as Workspace;
    const members = (ws.members || []).filter((m) => m.uid !== uid);
    await firestoreService.updateDoc('workspaces', workspaceId, { members });
  },

  updateMemberRole: async (workspaceId: string, uid: string, role: string) => {
    const workspace = await firestoreService.getDoc('workspaces', workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    const ws = workspace as Workspace;
    const members = (ws.members || []).map((m) =>
      m.uid === uid ? { ...m, role } : m
    );
    await firestoreService.updateDoc('workspaces', workspaceId, { members });
  },
};

export default workspaceService;
