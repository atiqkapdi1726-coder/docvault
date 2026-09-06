import { firestoreService } from '../firebase/firestore';
import type { AuditLog } from '../types';
import { DocumentData } from 'firebase/firestore';

export const auditService = {
  log: async (data: Omit<AuditLog, 'id'>) => {
    return firestoreService.addDoc('auditLogs', data as unknown as DocumentData);
  },

  getLogs: async (workspaceId: string, logLimit = 100) => {
    return firestoreService.getDocs('auditLogs', {
      conditions: [['workspaceId', '==', workspaceId]],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
      limitCount: logLimit,
    }) as Promise<AuditLog[]>;
  },

  getLogsByUser: async (workspaceId: string, userId: string) => {
    return firestoreService.getDocs('auditLogs', {
      conditions: [
        ['workspaceId', '==', workspaceId],
        ['userId', '==', userId],
      ],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
      limitCount: 100,
    }) as Promise<AuditLog[]>;
  },

  getLogsByResource: async (resourceType: string, resourceId: string) => {
    return firestoreService.getDocs('auditLogs', {
      conditions: [
        ['resourceType', '==', resourceType],
        ['resourceId', '==', resourceId],
      ],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
      limitCount: 100,
    }) as Promise<AuditLog[]>;
  },

  subscribeToLogs: (
    workspaceId: string,
    callback: (logs: AuditLog[]) => void
  ) => {
    return firestoreService.subscribe(
      'auditLogs',
      {
        conditions: [['workspaceId', '==', workspaceId]],
        orderByField: 'createdAt',
        orderByDirection: 'desc',
      },
      (data) => callback(data as unknown as AuditLog[])
    );
  },
};

export default auditService;
