'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '@/lib/firebase/auth';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { FileText, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuthContext();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError('');
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-2xl">DV</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to DocVault</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-2 text-sm">
              Secure cloud document management for teams and individuals
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-[rgb(var(--border))] bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--primary))]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.91c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.29-4.74 3.29-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            {signingIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}

          <div className="mt-8 pt-6 border-t border-[rgb(var(--border))] space-y-3">
            <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
              <Lock size={14} className="flex-shrink-0" />
              <span>End-to-end secure Google authentication</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
              <Shield size={14} className="flex-shrink-0" />
              <span>Your documents stay private to your account</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
              <FileText size={14} className="flex-shrink-0" />
              <span>Free plan: 800KB per file, unlimited documents</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[rgb(var(--muted-foreground))] mt-6">
          DocVault — Document Management SaaS
        </p>
      </motion.div>
    </div>
  );
}
