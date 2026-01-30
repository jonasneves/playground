import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Trash2, LogOut, Settings, Github, AlertCircle } from 'lucide-react';
import { useUserMenu } from '../contexts/UserMenuContext';
import type { User } from '../types';

interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
  onClearCache: () => void;
}

export function UserMenu({ user, onLogout, onClearCache }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { customItems } = useUserMenu();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleClearCache = () => {
    if (confirm('Clear all cached data? Apps will reload from the repository.')) {
      onClearCache();
      window.location.reload();
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleHome = () => {
    setIsOpen(false);
    // Use href to force full page reload (fixes chat app state issue)
    window.location.href = window.location.href.split('#')[0] + '#/gallery';
  };

  return (
    <div ref={menuRef} className="fixed top-3 right-3 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        className="group relative flex items-center gap-0 hover:gap-2 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full py-1 pl-1 hover:pr-3 hover:bg-white transition-[padding,background-color,gap] duration-300 ease-out shadow-sm"
      >
        {user ? (
          <>
            <img
              src={user.avatar_url}
              alt={user.login}
              loading="lazy"
              className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
            />
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap max-w-0 group-hover:max-w-[120px] overflow-hidden opacity-0 group-hover:opacity-100 transition-[max-width,opacity] duration-300 ease-out">{user.name?.split(' ')[0] || user.login}</span>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Github size={18} className="text-neutral-600" />
            </div>
            <AlertCircle size={14} className="absolute -top-0.5 -right-0.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap max-w-0 group-hover:max-w-[120px] overflow-hidden opacity-0 group-hover:opacity-100 transition-[max-width,opacity] duration-300 ease-out">Not logged in</span>
          </>
        )}
      </button>

      <div className={`absolute top-14 right-0 bg-white border border-neutral-200 rounded-2xl shadow-xl min-w-[200px] overflow-hidden transition-all duration-100 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
        <button
          onClick={handleHome}
          aria-label="Go to app gallery"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Home size={16} /> Gallery
        </button>

        <button
          onClick={() => window.location.reload()}
          aria-label="Refresh page"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
        >
          <RefreshCw size={16} /> Refresh
        </button>

        {user && (
          <button
            onClick={handleSettings}
            aria-label="Open settings"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
          >
            <Settings size={16} /> Settings
          </button>
        )}

        {customItems.length > 0 && (
          <>
            {customItems.map((item) => (
              item.component ? (
                <div key={item.id} className="border-t border-neutral-100">
                  {item.component}
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-t border-neutral-100 ${
                    item.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {item.icon && <item.icon size={16} />}
                  {item.label}
                </button>
              )
            ))}
          </>
        )}

        <button
          onClick={handleClearCache}
          aria-label="Clear cache"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
        >
          <Trash2 size={16} /> Clear Cache
        </button>

        {user && (
          <button
            onClick={onLogout}
            aria-label="Log out"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
          >
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>
    </div>
  );
}
