'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import type { User } from '@/lib/types';

const DEFAULT_USER: User = {
  uid: 'local-user',
  displayName: 'DocVault User',
  email: 'user@docvault.app',
  photoURL: null,
  createdAt: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  firebaseUser: null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  firebaseUser: null,
  loading: false,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { setUser } = useAppStore.getState();

  useEffect(() => {
    setMounted(true);
    setUser(DEFAULT_USER);
  }, [setUser]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4">
            <span className="text-white font-bold">DV</span>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(var(--primary))] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: DEFAULT_USER,
        firebaseUser: null,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
