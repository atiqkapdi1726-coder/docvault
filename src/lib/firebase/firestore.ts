import { db, auth } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  type WhereFilterOp,
} from 'firebase/firestore';

export interface FirestoreQueryOptions {
  conditions?: [string, string, unknown][];
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
  limitCount?: number;
  startAfterDoc?: DocumentSnapshot;
}

export const firestoreService = {
  getDoc: async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },

  getDocs: async (collectionName: string, options?: FirestoreQueryOptions) => {
    const constraints: QueryConstraint[] = [];
    if (options?.conditions) {
      options.conditions.forEach(([field, op, value]) => {
        constraints.push(where(field, op as WhereFilterOp, value));
      });
    }
    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderByDirection || 'desc'));
    }
    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    if (options?.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  addDoc: async (collectionName: string, data: DocumentData) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateDoc: async (collectionName: string, docId: string, data: DocumentData) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  deleteDoc: async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },

  batchUpdate: async (updates: { collection: string; id: string; data: DocumentData }[]) => {
    const batch = writeBatch(db);
    updates.forEach(({ collection: coll, id, data }) => {
      const docRef = doc(db, coll, id);
      batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  subscribe: (
    collectionName: string,
    options: FirestoreQueryOptions,
    callback: (data: DocumentData[]) => void
  ) => {
    const constraints: QueryConstraint[] = [];
    if (options.conditions) {
      options.conditions.forEach(([field, op, value]) => {
        constraints.push(where(field, op as WhereFilterOp, value));
      });
    }
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderByDirection || 'desc'));
    }
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  },

  getCollectionPath: (...segments: string[]) => segments.join('/'),
};

export default firestoreService;
