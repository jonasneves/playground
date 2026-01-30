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
    <div className="breadcrumb">
      {parts.map((part, index) => (
        <span key={part.path}>
          {index > 0 && <span className="separator"> / </span>}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(part.path);
            }}
          >
            {part.name}
          </a>
        </span>
      ))}
    </div>
  );
}
