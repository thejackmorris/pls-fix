'use client';

import { forwardRef, useState, RefObject } from 'react';
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

const TextPanel = forwardRef<HTMLDivElement, TextPanelProps>(
  ({ content, discussions, onScroll, onCreateDiscussion, isLoading, userRole, isOwner }, ref) => {
    const [selectedText, setSelectedText] = useState<{
      text: string;
      startIndex: number;
      endIndex: number;
    } | null>(null);

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      const element = (ref as RefObject<HTMLDivElement>).current;
      if (!element) return;
      
      preSelectionRange.selectNodeContents(element);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const startIndex = preSelectionRange.toString().length;
      const endIndex = startIndex + range.toString().length;

      setSelectedText({
        text: range.toString(),
        startIndex,
        endIndex,
      });
    };

    const canCreateDiscussion = isOwner || userRole === 'EDITOR' || userRole === 'COMMENTER';

    return (
      <div className="relative h-full overflow-auto" ref={ref} onScroll={onScroll}>
        <div
          className="p-4 prose max-w-none"
          onMouseUp={handleSelection}
          onTouchEnd={handleSelection}
        >
          {content.split('').map((char, index) => {
            const discussion = discussions.find(
              (d) => d.startIndex !== undefined && d.endIndex !== undefined && 
                    index >= d.startIndex && index < d.endIndex
            );

            return (
              <span
                key={index}
                className={discussion ? 'bg-yellow-100' : ''}
                data-index={index}
              >
                {char}
              </span>
            );
          })}
        </div>

        {selectedText && canCreateDiscussion && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => {
                if (selectedText) {
                  onCreateDiscussion(
                    selectedText.startIndex,
                    selectedText.endIndex,
                    selectedText.text
                  );
                  setSelectedText(null);
                }
              }}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Add Discussion'}
            </button>
          </div>
        )}

        {selectedText && !canCreateDiscussion && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md">
              You don't have permission to add discussions
            </div>
          </div>
        )}
      </div>
    );
  }
);

TextPanel.displayName = 'TextPanel';

export default TextPanel; 