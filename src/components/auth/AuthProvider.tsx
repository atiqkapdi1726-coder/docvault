'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { authService } from '@/lib/firebase/auth';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      await authService.getRedirectResultUser();
      unsubscribe = authService.onAuthChange((u) => {
        setUserState(u);
        setUser(u);
        setLoading(false);
      });
    };
    setup();

    return () => unsubscribe();
  }, [setUser]);

  const signIn = async () => {
    setLoading(true);
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOutUser();
    setUserState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser: null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
