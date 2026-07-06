/**
 * Zustand store for Firebase Auth state.
 *
 * Initialized in main.tsx via onAuthStateChanged listener.
 * Components read `user` and `idToken`; never call Firebase directly.
 */
import { create } from 'zustand';
import type { User } from '@/lib/firebase';
import { signOut } from '@/lib/firebase';

interface AuthState {
  /** Firebase User object, null if not logged in. */
  user: User | null;
  /** Firebase ID token to attach as Authorization: Bearer header. */
  idToken: string | null;
  /** True while the initial auth state is being resolved. */
  loading: boolean;

  setUser: (user: User | null, token: string | null) => void;
  setLoading: (loading: boolean) => void;
  handleSignOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  loading: true,

  setUser: (user, idToken) => set({ user, idToken, loading: false }),
  setLoading: (loading) => set({ loading }),

  handleSignOut: async () => {
    await signOut();
    window.location.reload();
  },
}));

/** Convenience: returns true if user is authenticated. */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().user !== null;
}

/** Get the current ID token synchronously (may be null). */
export function getIdToken(): string | null {
  return useAuthStore.getState().idToken;
}
