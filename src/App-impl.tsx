import { useNavigate } from 'react-router-dom';
import { OAuth, AppShell } from '@/framework';
import { useAuthStore, useCacheStore, useAnalyticsStore } from '@/stores';
import { useGitHubAPI } from '@/hooks';
import { AppConfig } from '@/config/app';
import './styles/global.css';

function App() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { track } = useAnalyticsStore();

  return (
    <OAuth
      oauthServiceUrl={AppConfig.oauth.serviceUrl}
      onAuthChange={(token, user) => {
        if (token && user) setAuth(token, user);
      }}
      isAuthenticated={isAuthenticated}
    >
      <AppShell
        config={AppConfig}
        user={user}
        token={token}
        useGitHubAPI={useGitHubAPI}
        onLogout={logout}
        onClearCache={() => clearCache(AppConfig.repository.owner, AppConfig.repository.name)}
        onTrack={track}
        onNavigate={(route) => navigate(route)}
      />
    </OAuth>
  );
}

export default App;
