'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  getAuth,
} from 'firebase/auth';
import { app } from './config';
import type { User } from '../types';

function getFirebaseAuth() {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

function toAppUser(firebaseUser: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  metadata: { creationTime?: string | null };
}): User {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || firebaseUser.email || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
}

export const authService = {
  signInWithGoogle: async (): Promise<User | null> => {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return toAppUser(result.user);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw error;
    }
  },

  getRedirectResultUser: async (): Promise<User | null> => {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    try {
      const result = await getRedirectResult(auth);
      if (!result?.user) return null;
      return toAppUser(result.user);
    } catch {
      return null;
    }
  },

  signOutUser: async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  },

  onAuthChange: (callback: (user: User | null) => void): (() => void) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? toAppUser(firebaseUser) : null);
    });
  },
};

export default authService;
