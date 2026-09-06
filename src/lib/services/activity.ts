import { firestoreService } from '../firebase/firestore';
import type { Activity } from '../types';
import { DocumentData } from 'firebase/firestore';

export const activityService = {
  logActivity: async (data: Omit<Activity, 'id'>) => {
    return firestoreService.addDoc('activities', data as unknown as DocumentData);
  },

  getActivities: async (workspaceId: string, activityLimit = 50) => {
    return firestoreService.getDocs('activities', {
      conditions: [['workspaceId', '==', workspaceId]],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
      limitCount: activityLimit,
    }) as Promise<Activity[]>;
  },

  getDocumentActivities: async (documentId: string) => {
    return firestoreService.getDocs('activities', {
      conditions: [['documentId', '==', documentId]],
      orderByField: 'createdAt',
      orderByDirection: 'desc',
      limitCount: 50,
    }) as Promise<Activity[]>;
  },

  subscribeToActivities: (
    workspaceId: string,
    callback: (activities: Activity[]) => void
  ) => {
    return firestoreService.subscribe(
      'activities',
      {
        conditions: [['workspaceId', '==', workspaceId]],
        orderByField: 'createdAt',
        orderByDirection: 'desc',
      },
      (data) => callback(data as unknown as Activity[])
    );
  },
};

export default activityService;
