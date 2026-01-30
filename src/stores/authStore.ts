import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
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
      name: 'auth-storage'
    }
  )
);
