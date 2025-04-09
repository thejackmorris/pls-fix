'use client';

import { forwardRef, useState, useEffect, RefObject } from 'react';
import { Discussion } from '@/generated/prisma';

interface TextPanelProps {
  content: string;
  discussions: Discussion[];
  onScroll: () => void;
  onCreateDiscussion: (startIndex: number, endIndex: number, selectedText: string) => void;
  isLoading: boolean;
}

const TextPanel = forwardRef<HTMLDivElement, TextPanelProps>(({
  content,
  discussions,
  onScroll,
  onCreateDiscussion,
  isLoading
}, ref) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const element = (ref as RefObject<HTMLDivElement>).current;
    if (!element) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;

    setSelectedText(selection.toString());
    setSelectionStart(start);
    setSelectionEnd(end);
  };

  const handleMouseUp = () => {
    if (selectedText) {
      onCreateDiscussion(selectionStart, selectionEnd, selectedText);
      setSelectedText('');
    }
  };

  useEffect(() => {
    const element = (ref as RefObject<HTMLDivElement>).current;
    if (!element) return;

    element.addEventListener('mouseup', handleSelection);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mouseup', handleSelection);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedText, selectionStart, selectionEnd]);

  return (
    <div className="h-full overflow-y-auto p-6 bg-white" ref={ref} onScroll={onScroll}>
      {isLoading && (
        <div className="absolute top-4 left-4 p-2 bg-blue-50 text-blue-700 rounded-lg">
          Loading...
        </div>
      )}
      <div className="prose max-w-none">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
      {discussions.map(discussion => (
        <div
          key={discussion.id}
          className="absolute"
          style={{
            top: `${discussion.startIndex}px`,
            left: '0',
            width: '100%',
            height: `${discussion.endIndex - discussion.startIndex}px`,
            backgroundColor: 'rgba(255, 255, 0, 0.2)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
});

TextPanel.displayName = 'TextPanel';

export default TextPanel; 