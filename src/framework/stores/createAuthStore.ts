import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export function createAuthStore(storageKey = 'auth-storage') {
  return create<AuthState>()(
    persist(
      (set) => ({
        token: null,
        user: null,
        isAuthenticated: false,
        setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
        logout: () => {
          set({ token: null, user: null, isAuthenticated: false });
          localStorage.clear();
          window.location.href = '/';
        }
      }),
      {
        name: storageKey
      }
    )
  );
}
