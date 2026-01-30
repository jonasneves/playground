import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Trash2, LogOut, Settings } from 'lucide-react';
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

  if (!user) return null;

  return (
    <div ref={menuRef} className="fixed top-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full px-4 py-2 hover:bg-white transition-all duration-200 shadow-sm"
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          loading="lazy"
          className="w-8 h-8 rounded-full ring-2 ring-white"
        />
        <span className="text-sm font-medium text-neutral-900">{user.name || user.login}</span>
      </button>

      <div className={`absolute top-14 right-0 bg-white border border-neutral-200 rounded-2xl shadow-xl min-w-[200px] overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
        <button
          onClick={() => window.location.reload()}
          aria-label="Refresh page"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
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
