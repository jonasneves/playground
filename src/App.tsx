import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OAuth, AppShell, RepositorySelector } from '@/framework';
import { useAuthStore, useCacheStore, useAnalyticsStore, useRepositoryStore } from '@/stores';
import { AppConfig } from '@/config/app';

function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { track } = useAnalyticsStore();
  const { repository, setRepository } = useRepositoryStore();
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !repository) {
      setShowRepoSelector(true);
    }
  }, [isAuthenticated, repository]);

  const currentRepo = repository || AppConfig.repository;

  return (
    <OAuth
      oauthServiceUrl={AppConfig.oauth.serviceUrl}
      onAuthChange={(token, user) => {
        if (token && user) setAuth(token, user);
      }}
      isAuthenticated={isAuthenticated}
    >
      {showRepoSelector && (
        <RepositorySelector
          onSelect={(repo) => {
            setRepository(repo);
            setShowRepoSelector(false);
          }}
          currentRepository={repository}
          userLogin={user?.login}
        />
      )}
      <AppShell
        config={AppConfig}
        user={user}
        onLogout={logout}
        onClearCache={() => clearCache(currentRepo.owner, currentRepo.name)}
        onTrack={track}
        onNavigate={(route) => navigate(route)}
      />
    </OAuth>
  );
}

export default App;
