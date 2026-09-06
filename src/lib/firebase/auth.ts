'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './config';
import { firestoreService } from './firestore';
import type { User } from '../types';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        const userData = await firestoreService.getDoc('users', firebaseUser.uid);
        if (userData) {
          setUser(userData as unknown as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setError(null);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });

        await firestoreService.addDoc('users', {
          uid: result.user.uid,
          email,
          displayName,
          photoURL: null,
          createdAt: new Date().toISOString(),
        });

        return result.user;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed');
        throw err;
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const existingUser = await firestoreService.getDoc('users', result.user.uid);

      if (!existingUser) {
        await firestoreService.addDoc('users', {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
        });

        const personalWorkspace = await firestoreService.addDoc('workspaces', {
          name: 'Personal',
          type: 'personal',
          ownerId: result.user.uid,
          members: [
            {
              uid: result.user.uid,
              role: 'admin',
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
              joinedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await firestoreService.addDoc('folders', {
          name: 'Root',
          parentId: null,
          workspaceId: personalWorkspace,
          path: [],
          createdBy: result.user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return result.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    }
  }, []);

  return {
    user,
    firebaseUser,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
  };
}
