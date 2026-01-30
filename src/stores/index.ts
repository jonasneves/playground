import { createAuthStore, createCacheStore, createAnalyticsStore, createRepositoryStore } from '@/framework';
import { AppConfig } from '@/config/app';

export const useAuthStore = createAuthStore('auth-storage');

export const useCacheStore = createCacheStore(AppConfig.api.cacheTimeout);

export const useAnalyticsStore = createAnalyticsStore('analytics-storage', {
  enabled: AppConfig.features.analytics,
  maxEvents: 100
});

export const useRepositoryStore = createRepositoryStore('repository-storage');
