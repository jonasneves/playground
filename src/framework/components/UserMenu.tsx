import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, LogOut } from 'lucide-react';
import type { User } from '../types';

interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
  onClearCache: () => void;
}

export function UserMenu({ user, onLogout, onClearCache }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      onClearCache();
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
        <button onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
