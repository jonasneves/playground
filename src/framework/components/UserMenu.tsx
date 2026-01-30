import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Trash2, LogOut, Settings } from 'lucide-react';
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
    navigate('/gallery');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div ref={menuRef} className="fixed top-3 right-3 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        className="group flex items-center gap-0 group-hover:gap-3 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full p-1 group-hover:pl-1.5 group-hover:pr-6 hover:bg-white transition-all duration-200 shadow-sm overflow-hidden"
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          loading="lazy"
          className="w-10 h-10 rounded-full ring-2 ring-white flex-shrink-0"
        />
        <span className="text-xs font-medium text-neutral-600 whitespace-nowrap w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-200">{user.name?.split(' ')[0] || user.login}</span>
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

        <button
          onClick={handleSettings}
          aria-label="Open settings"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
        >
          <Settings size={16} /> Settings
        </button>

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

        <button
          onClick={onLogout}
          aria-label="Log out"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
