import { lazy, Suspense, useEffect } from 'react';
import { createHashRouter, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/framework';
import { useAnalyticsStore, useAuthStore, useCacheStore, useRepositoryStore } from '@/stores';
import { NotFound } from '@/components/NotFound';
import { UserMenu } from '@/framework/components/UserMenu';
import { AppConfig } from '@/config/app';
import App from './App';

const ChatApp = lazy(() => import('./apps/chat/ChatApp'));
const CMSApp = lazy(() => import('./apps/cms/CMSApp'));
const Dashboard = lazy(() => import('./apps/dashboard/Dashboard'));
const FileBrowser = lazy(() => import('./apps/file-browser/FileBrowser'));
const TodoApp = lazy(() => import('./apps/todo/TodoApp'));
const SettingsApp = lazy(() => import('./apps/settings/SettingsApp'));
const MedicalViz = lazy(() => import('./apps/medical-viz/MedicalViz'));
const ModelExplorer = lazy(() => import('./apps/ml-models/ModelExplorer'));

function AppLoader() {
  return (
    <div className="loading">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <p>Loading app...</p>
      </div>
    </div>
  );
}

function AppWrapper({ appName, children }: { appName: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const logError = useAnalyticsStore((state) => state.logError);
  const { user, logout } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { repository } = useRepositoryStore();

  const currentRepo = repository || AppConfig.repository;

  const handleClearCache = () => {
    clearCache(currentRepo.owner, currentRepo.name);
  };

  // ESC key to go back to gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Don't interfere if user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        navigate('/gallery', { replace: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      <UserMenu user={user} onLogout={logout} onClearCache={handleClearCache} />
      <ErrorBoundary appName={appName} onError={logError}>
        <Suspense fallback={<AppLoader />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/gallery" replace />
  },
  {
    path: '/gallery',
    element: <App />
  },
  {
    path: '/apps/chat',
    element: (
      <AppWrapper appName="chat">
        <ChatApp />
      </AppWrapper>
    )
  },
  {
    path: '/apps/cms',
    element: (
      <AppWrapper appName="cms">
        <CMSApp />
      </AppWrapper>
    )
  },
  {
    path: '/apps/dashboard',
    element: (
      <AppWrapper appName="dashboard">
        <Dashboard />
      </AppWrapper>
    )
  },
  {
    path: '/apps/file-browser',
    element: (
      <AppWrapper appName="file-browser">
        <FileBrowser />
      </AppWrapper>
    )
  },
  {
    path: '/apps/todo',
    element: (
      <AppWrapper appName="todo">
        <TodoApp />
      </AppWrapper>
    )
  },
  {
    path: '/settings',
    element: (
      <AppWrapper appName="settings">
        <SettingsApp />
      </AppWrapper>
    )
  },
  {
    path: '/apps/medical-viz',
    element: (
      <AppWrapper appName="medical-viz">
        <MedicalViz />
      </AppWrapper>
    )
  },
  {
    path: '/apps/ml-models',
    element: (
      <AppWrapper appName="ml-models">
        <ModelExplorer />
      </AppWrapper>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
