import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/framework';
import { useAnalyticsStore } from '@/stores';

const ChatApp = lazy(() => import('./apps/chat/ChatApp'));
const CMSApp = lazy(() => import('./apps/cms/CMSApp'));
const Dashboard = lazy(() => import('./apps/dashboard/Dashboard'));
const FileBrowser = lazy(() => import('./apps/file-browser/FileBrowser'));

function AppLoader() {
  return (
    <div className="loading">
      <div style={{ textAlign: 'center' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          borderTopColor: 'white',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
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
  }
]);
