'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/stores/appStore';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: ReturnType<typeof useAuth>['firebaseUser'];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/shared'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { setUser } = useAppStore.getState();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUser(auth.user);
  }, [auth.user, setUser]);

  useEffect(() => {
    if (!mounted || auth.loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!auth.user && !isPublicRoute) {
      router.push('/login');
    } else if (auth.user && isPublicRoute && !pathname.startsWith('/shared')) {
      router.push('/dashboard');
    }
  }, [auth.user, auth.loading, pathname, router, mounted]);

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
        user: auth.user,
        firebaseUser: auth.firebaseUser,
        loading: auth.loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
