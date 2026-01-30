import { useEffect } from 'react';
import { useMarkdownWorker } from '@/hooks/useMarkdownWorker';
import { useDebounce } from '@/hooks/useDebounce';

interface PreviewProps {
  content: string;
  isMarkdown: boolean;
}

export function Preview({ content, isMarkdown }: PreviewProps) {
  const { html, parse, isReady, error } = useMarkdownWorker();
  const debouncedContent = useDebounce(content, 300); // 300ms debounce

  useEffect(() => {
    if (isMarkdown && isReady && debouncedContent) {
      parse(debouncedContent);
    }
  }, [debouncedContent, isMarkdown, isReady, parse]);

  if (!isMarkdown) {
    return (
      <div className="preview">
        <h3>Preview</h3>
        <div className="preview-content">
          <div className="empty-state">
            Preview available for markdown files only
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview">
        <h3>Preview</h3>
        <div className="preview-content">
          <div className="empty-state" style={{ color: '#ef4444' }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="preview">
        <h3>Preview</h3>
        <div className="preview-content">
          <div className="empty-state">
            Preview will appear here for markdown files
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <h3>Preview</h3>
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
