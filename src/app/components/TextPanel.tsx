'use client';

import { forwardRef, useState, useEffect, RefObject } from 'react';
import { Discussion, AccessRole } from '@/generated/prisma';

interface TextPanelProps {
  content: string;
  discussions: Discussion[];
  onScroll: () => void;
  onCreateDiscussion: (startIndex: number, endIndex: number, selectedText: string) => void;
  isLoading: boolean;
  userRole?: AccessRole;
  isOwner: boolean;
}

const TextPanel = forwardRef<HTMLDivElement, TextPanelProps>(({
  content,
  discussions,
  onScroll,
  onCreateDiscussion,
  isLoading,
  userRole,
  isOwner
}, ref) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const canCreateDiscussion = isOwner || userRole === 'EDITOR' || userRole === 'COMMENTER';

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !canCreateDiscussion) {
      setShowCreateButton(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const element = (ref as RefObject<HTMLDivElement>).current;
    if (!element) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;

    const selectedContent = selection.toString().trim();
    if (selectedContent) {
      setSelectedText(selectedContent);
      setSelectionStart(start);
      setSelectionEnd(end);

      // Position the create button near the selection
      const rect = range.getBoundingClientRect();
      setButtonPosition({
        x: rect.left + (rect.width / 2),
        y: rect.bottom + window.scrollY + 10
      });
      setShowCreateButton(true);
    }
  };

  const handleCreateDiscussion = () => {
    if (selectedText && canCreateDiscussion) {
      onCreateDiscussion(selectionStart, selectionEnd, selectedText);
      setSelectedText('');
      setShowCreateButton(false);
    }
  };

  useEffect(() => {
    const element = (ref as RefObject<HTMLDivElement>).current;
    if (!element) return;

    element.addEventListener('mouseup', handleSelection);

    return () => {
      element.removeEventListener('mouseup', handleSelection);
    };
  }, [canCreateDiscussion]);

  return (
    <div className="relative h-full overflow-y-auto bg-white" ref={ref} onScroll={onScroll}>
      {isLoading && (
        <div className="sticky top-4 left-4 z-50 p-2 bg-blue-50 text-blue-700 rounded-lg shadow-md">
          Loading...
        </div>
      )}
      
      {!canCreateDiscussion && (
        <div className="sticky top-4 left-4 z-50 p-2 bg-yellow-50 text-yellow-700 rounded-lg shadow-md">
          View Only
        </div>
      )}
      
      <div className="prose prose-lg max-w-none p-6">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-800 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {discussions.map(discussion => (
        <div
          key={discussion.id}
          className="absolute left-0 right-0"
          style={{
            top: `${discussion.startIndex}px`,
            height: `${discussion.endIndex - discussion.startIndex}px`,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '3px solid rgb(59, 130, 246)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {showCreateButton && canCreateDiscussion && (
        <button
          className="absolute z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
          onClick={handleCreateDiscussion}
        >
          Start Discussion
        </button>
      )}
    </div>
  );
});

TextPanel.displayName = 'TextPanel';

export default TextPanel; 