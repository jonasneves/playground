import { ArrowRight, AlertCircle } from 'lucide-react';
import { AppConfig } from '@/config/app';

interface Manifest {
  name: string;
  description: string;
  thumbnail?: string;
  tech?: string[];
  minLauncherVersion?: string;
}

interface AppCardProps {
  appName: string;
  manifest: Manifest | null;
  path: string;
  onLaunch: (path: string, name: string) => void;
}

function checkVersionCompatibility(manifest: Manifest | null): string | null {
  if (!manifest?.minLauncherVersion) return null;

  const current = AppConfig.version.split('.').map(Number);
  const required = manifest.minLauncherVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (current[i] < required[i]) {
      return `Requires launcher v${manifest.minLauncherVersion}`;
    }
    if (current[i] > required[i]) return null;
  }
  return null;
}

export function AppCard({ appName, manifest, path, onLaunch }: AppCardProps) {
  if (!manifest) {
    return (
      <div className="app-card">
        <div className="app-card-body">
          <h3>{appName}</h3>
          <p style={{ color: '#ccc' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const versionWarning = checkVersionCompatibility(manifest);

  return (
    <div className="app-card">
      {manifest.thumbnail && (
        <img
          src={manifest.thumbnail}
          alt={manifest.name}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="app-card-body">
        <h3>{manifest.name}</h3>
        <p>{manifest.description}</p>

        {versionWarning && (
          <div style={{
            color: '#f59e0b',
            fontSize: '13px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={16} /> {versionWarning}
          </div>
        )}

        {manifest.tech && manifest.tech.length > 0 && (
          <div className="app-meta">
            {manifest.tech.map(t => (
              <span key={t} className="badge">{t}</span>
            ))}
          </div>
        )}

        <button
          onClick={() => onLaunch(path, manifest.name)}
          className="launch-btn"
        >
          Launch App <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
