import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => {
  const React = require('react');
  return {
    default: React.forwardRef(({ children, href, ...props }: any, ref: any) =>
      React.createElement('a', { ...props, ref, href }, children)
    ),
  };
});

vi.mock('@/lib/firebase/config', () => ({
  app: {},
  auth: {},
  db: {},
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn(),
  Timestamp: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  connectStorageEmulator: vi.fn(),
  ref: vi.fn((_storage: any, path: string) => ({ _path: path })),
  uploadBytesResumable: vi.fn(() => ({
    on: vi.fn((_event: string, _error: () => void, complete: () => Promise<void>) => {
      complete();
    }),
    snapshot: { ref: {} },
  })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://firebasestorage.googleapis.com/test-file')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

vi.mock('framer-motion', () => {
  const React = require('react');
  const createMotionComponent = (tag: string) => {
    const Component = ({ children, initial, animate, exit, transition, layout, layoutId, whileHover, whileTap, variants, ...props }: any) => {
      return React.createElement(tag, props, children);
    };
    Component.displayName = `motion.${tag}`;
    return Component;
  };
  return {
    motion: new Proxy({}, { get: (_, tag) => createMotionComponent(tag as string) }),
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (val: any) => ({ set: vi.fn(), get: () => val }),
  };
});

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
