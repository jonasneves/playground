import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Repository {
  owner: string;
  name: string;
}

interface RepositoryState {
  repository: Repository | null;
  setRepository: (repo: Repository) => void;
  clearRepository: () => void;
}

export function createRepositoryStore(storageKey = 'repository-storage') {
  return create<RepositoryState>()(
    persist(
      (set) => ({
        repository: null,
        setRepository: (repo) => set({ repository: repo }),
        clearRepository: () => set({ repository: null })
      }),
      {
        name: storageKey
      }
    )
  );
}
