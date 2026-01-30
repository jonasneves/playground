import type { BreadcrumbPart } from './types';

interface BreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ currentPath, onNavigate }: BreadcrumbProps) {
  const parts: BreadcrumbPart[] = [{ name: 'root', path: '' }];

  if (currentPath) {
    const pathParts = currentPath.split('/').filter(Boolean);
    let pathSoFar = '';

    for (const part of pathParts) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
      parts.push({ name: part, path: pathSoFar });
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-white rounded-lg border border-neutral-200 text-sm">
      {parts.map((part, index) => (
        <span key={part.path} className="flex items-center gap-2">
          {index > 0 && <span className="text-neutral-400">/</span>}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(part.path);
            }}
            className="text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            {part.name}
          </a>
        </span>
      ))}
    </div>
  );
}
