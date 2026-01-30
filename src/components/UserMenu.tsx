import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCacheStore } from '@/stores/cacheStore';
import { AppConfig } from '@/config/app';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const clearCache = useCacheStore(state => state.clearCache);
  const menuRef = useRef<HTMLDivElement>(null);

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
      clearCache(AppConfig.repository.owner, AppConfig.repository.name);
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div
        className="user-pill"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          className="user-avatar"
        />
        <span style={{ fontWeight: 500, fontSize: '14px' }}>
          {user.name || user.login}
        </span>
      </div>

      <div className={`user-menu ${isOpen ? 'show' : ''}`}>
        <button onClick={() => window.location.reload()}>
          <RefreshCw size={16} /> Refresh
        </button>
        <button onClick={handleClearCache}>
          <Trash2 size={16} /> Clear Cache
        </button>
        <button onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
