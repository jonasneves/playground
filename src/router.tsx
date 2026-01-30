import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/framework';
import { useAnalyticsStore } from '@/stores';
import { NotFound } from '@/components/NotFound';

const ChatApp = lazy(() => import('./apps/chat/ChatApp'));
const CMSApp = lazy(() => import('./apps/cms/CMSApp'));
const Dashboard = lazy(() => import('./apps/dashboard/Dashboard'));
const FileBrowser = lazy(() => import('./apps/file-browser/FileBrowser'));
const TodoApp = lazy(() => import('./apps/todo/TodoApp'));
const SettingsApp = lazy(() => import('./apps/settings/SettingsApp'));

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
  const logError = useAnalyticsStore((state) => state.logError);

  return (
    <ErrorBoundary appName={appName} onError={logError}>
      <Suspense fallback={<AppLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/gallery" replace />
  },
  {
    path: '/gallery',
    lazy: async () => {
      const App = await import('./App');
      return { Component: App.default };
    }
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
    path: '*',
    element: <NotFound />
  }
]);
