'use client';

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type: ToastType = 'info') {
  useToastStore.getState().addToast(message, type);
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-green-500/50' },
  error: { icon: AlertCircle, classes: 'border-red-500/50' },
  info: { icon: Info, classes: 'border-blue-500/50' },
};

function ToastCard({ item }: { item: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const config = toastConfig[item.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(item.id), 3500);
    return () => clearTimeout(timer);
  }, [item.id, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`card p-4 shadow-lg ${config.classes} flex items-center gap-3 min-w-[280px] max-w-md`}
    >
      <Icon
        size={20}
        className={
          item.type === 'success'
            ? 'text-green-500'
            : item.type === 'error'
            ? 'text-red-500'
            : 'text-blue-500'
        }
      />
      <p className="flex-1 text-sm font-medium">{item.message}</p>
      <button
        onClick={() => removeToast(item.id)}
        className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
