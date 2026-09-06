import { firestoreService } from '../firebase/firestore';
import type { Comment } from '../types';
import { DocumentData } from 'firebase/firestore';

export const commentService = {
  getComments: async (documentId: string) => {
    return firestoreService.getDocs('comments', {
      conditions: [['documentId', '==', documentId]],
      orderByField: 'createdAt',
      orderByDirection: 'asc',
    }) as Promise<Comment[]>;
  },

  addComment: async (data: Omit<Comment, 'id' | 'replies'>) => {
    return firestoreService.addDoc('comments', data as unknown as DocumentData);
  },

  updateComment: async (commentId: string, content: string) => {
    await firestoreService.updateDoc('comments', commentId, {
      content,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteComment: async (commentId: string) => {
    await firestoreService.deleteDoc('comments', commentId);
  },

  subscribeToComments: (
    documentId: string,
    callback: (comments: Comment[]) => void
  ) => {
    return firestoreService.subscribe(
      'comments',
      {
        conditions: [['documentId', '==', documentId]],
        orderByField: 'createdAt',
        orderByDirection: 'asc',
      },
      (data) => callback(data as unknown as Comment[])
    );
  },
};

export default commentService;
