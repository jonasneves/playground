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
      <div className="flex flex-col flex-1 bg-white border-l border-neutral-200 overflow-hidden">
        <h3 className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
          Preview
        </h3>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-center text-neutral-400 py-8">
            Preview available for markdown files only
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 bg-white border-l border-neutral-200 overflow-hidden">
        <h3 className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
          Preview
        </h3>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-center text-red-600 py-8">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col flex-1 bg-white border-l border-neutral-200 overflow-hidden">
        <h3 className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
          Preview
        </h3>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-center text-neutral-400 py-8">
            Preview will appear here for markdown files
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white border-l border-neutral-200 overflow-hidden">
      <h3 className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
        Preview
      </h3>
      <div
        className="flex-1 overflow-y-auto px-6 py-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
