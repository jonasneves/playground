import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-xl text-neutral-600 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          aria-label="Return to home page"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors"
        >
          <Home size={20} />
          Back to home
        </button>
      </div>
    </div>
  );
}
