import { createGitHubAPIHook } from '@/framework';
import { useAuthStore, useCacheStore } from '@/stores';

// Create the useGitHubAPI hook with your store instances
export const useGitHubAPI = createGitHubAPIHook(
  useAuthStore.getState(),
  useCacheStore.getState()
);
