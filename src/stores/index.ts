import { createAuthStore, createCacheStore, createAnalyticsStore } from '@/framework';
import { AppConfig } from '@/config/app';

// Create store instances with your configuration
export const useAuthStore = createAuthStore('auth-storage');

export const useCacheStore = createCacheStore(AppConfig.api.cacheTimeout);

export const useAnalyticsStore = createAnalyticsStore('analytics-storage', {
  enabled: AppConfig.features.analytics,
  maxEvents: 100
});
