import { ArrowRight, AlertCircle } from 'lucide-react';
import type { AppManifest } from '../types';

interface AppCardProps {
  appName: string;
  manifest: AppManifest | null;
  path: string;
  onLaunch: (path: string, name: string) => void;
  version?: string;
}

function checkVersionCompatibility(manifest: AppManifest | null, currentVersion?: string): string | null {
  if (!manifest?.minLauncherVersion || !currentVersion) return null;

  const current = currentVersion.split('.').map(Number);
  const required = manifest.minLauncherVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (current[i] < required[i]) {
      return `Requires launcher v${manifest.minLauncherVersion}`;
    }
    if (current[i] > required[i]) return null;
  }
  return null;
}

export function AppCard({ appName, manifest, path, onLaunch, version }: AppCardProps) {
  if (!manifest) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">{appName}</h3>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  const versionWarning = checkVersionCompatibility(manifest, version);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full">
      <div className={`w-full bg-gradient-to-br from-brand-50 to-neutral-50 flex items-center justify-center ${manifest.thumbnail ? 'h-48' : 'h-32'}`}>
        {manifest.thumbnail ? (
          <img
            src={manifest.thumbnail}
            alt={manifest.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="text-6xl">{manifest.name.charAt(0)}</div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">{manifest.name}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-2">{manifest.description}</p>

        {versionWarning && (
          <div className="flex items-center gap-2 text-amber-600 text-xs mb-4 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertCircle size={14} />
            {versionWarning}
          </div>
        )}

        {manifest.tech && manifest.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {manifest.tech.map(t => (
              <span key={t} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onLaunch(path, manifest.name)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group-hover:gap-3 mt-auto"
        >
          Launch App
          <ArrowRight size={16} className="transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
