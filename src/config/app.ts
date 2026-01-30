export const AppConfig = {
  version: '1.0.0',

  repository: {
    owner: 'jonasneves',
    name: 'playground'
  },

  getRepository: () => {
    const stored = localStorage.getItem('repository-storage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.state?.repository) {
          return data.state.repository;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return AppConfig.repository;
  },

  branding: {
    title: 'Playground',
    subtitle: 'Launch and experiment with apps',
    theme: {
      primary: '#1e3a5f',
      secondary: '#2c4f7c'
    }
  },

  features: {
    analytics: true,
    errorTracking: true,
    serviceWorker: false,
    caching: true
  },

  api: {
    baseUrl: 'https://api.github.com/repos',
    cacheTimeout: 300000 // 5 minutes
  },

  oauth: {
    serviceUrl: 'https://oauth.neevs.io'
  }
};
