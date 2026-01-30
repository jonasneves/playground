import { useState } from 'react';
import { GitBranch, Package, Check } from 'lucide-react';
import type { Repository } from '../stores/createRepositoryStore';

interface RepositorySelectorProps {
  onSelect: (repo: Repository) => void;
  currentRepository?: Repository | null;
  userLogin?: string;
}

export function RepositorySelector({ onSelect, currentRepository, userLogin }: RepositorySelectorProps) {
  const [owner, setOwner] = useState(currentRepository?.owner || userLogin || '');
  const [name, setName] = useState(currentRepository?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner.trim() && name.trim()) {
      onSelect({ owner: owner.trim(), name: name.trim() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl mx-auto flex items-center justify-center">
            <GitBranch className="text-brand-600" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Select Repository</h2>
          <p className="text-neutral-600">
            Choose the GitHub repository to use with your apps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Package size={16} />
              Owner
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder={userLogin || 'username'}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <GitBranch size={16} />
              Repository Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="repository-name"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Confirm Selection
          </button>
        </form>

        <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
          <p className="text-neutral-600">
            <strong>Example:</strong> For github.com/facebook/react
          </p>
          <p className="text-neutral-500 text-xs">
            Owner: <code className="bg-white px-2 py-0.5 rounded">facebook</code>
          </p>
          <p className="text-neutral-500 text-xs">
            Repository: <code className="bg-white px-2 py-0.5 rounded">react</code>
          </p>
        </div>
      </div>
    </div>
  );
}
