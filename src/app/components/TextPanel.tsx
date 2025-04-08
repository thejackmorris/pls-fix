'use client';

import { forwardRef } from 'react';
import { Discussion } from '@/generated/prisma';

interface TextPanelProps {
  content: string;
  discussions: Discussion[];
  onScroll: () => void;
}

const TextPanel = forwardRef<HTMLDivElement, TextPanelProps>(
  ({ content, discussions, onScroll }, ref) => {
    // Function to render content with highlighted discussions
    const renderContent = () => {
      let lastIndex = 0;
      const result = [];
      
      // Sort discussions by startIndex to process them in order
      const sortedDiscussions = [...discussions].sort((a, b) => a.startIndex - b.startIndex);
      
      for (const discussion of sortedDiscussions) {
        // Add text before the discussion
        if (discussion.startIndex > lastIndex) {
          result.push(
            <span key={`text-${lastIndex}`}>
              {content.slice(lastIndex, discussion.startIndex)}
            </span>
          );
        }
        
        // Add highlighted discussion text
        result.push(
          <span
            key={`highlight-${discussion.id}`}
            className="bg-yellow-100 cursor-pointer hover:bg-yellow-200 transition-colors"
            title="Click to view discussion"
          >
            {content.slice(discussion.startIndex, discussion.endIndex)}
          </span>
        );
        
        lastIndex = discussion.endIndex;
      }
      
      // Add remaining text
      if (lastIndex < content.length) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex)}
          </span>
        );
      }
      
      return result;
    };

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto p-8"
        onScroll={onScroll}
      >
        <div className="max-w-prose mx-auto">
          <div className="whitespace-pre-wrap text-lg leading-relaxed">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }
);

TextPanel.displayName = 'TextPanel';

export default TextPanel; 