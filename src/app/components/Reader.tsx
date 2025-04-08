'use client';

import { useState, useRef, useEffect } from 'react';
import { Subject, Discussion } from '@/generated/prisma';
import TextPanel from './TextPanel';
import DiscussionPanel from './DiscussionPanel';

interface ReaderProps {
  subject: Subject;
  discussions: Discussion[];
}

export default function Reader({ subject, discussions }: ReaderProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [activeDiscussions, setActiveDiscussions] = useState<Discussion[]>([]);
  const textPanelRef = useRef<HTMLDivElement>(null);

  // Update active discussions based on scroll position
  const handleScroll = () => {
    if (!textPanelRef.current) return;
    
    const { scrollTop, clientHeight } = textPanelRef.current;
    const viewportStart = scrollTop;
    const viewportEnd = scrollTop + clientHeight;
    
    // Calculate which discussions are in view
    const visible = discussions.filter(discussion => {
      const discussionPosition = discussion.startIndex; // This is simplified, you might want to use pixel positions
      return discussionPosition >= viewportStart && discussionPosition <= viewportEnd;
    });
    
    setActiveDiscussions(visible);
    setCurrentPosition(scrollTop);
  };

  return (
    <div className="flex h-screen">
      {/* Text Panel - Takes 60% of the width */}
      <div className="w-3/5 h-full border-r border-gray-200">
        <TextPanel
          ref={textPanelRef}
          content={subject.content}
          discussions={discussions}
          onScroll={handleScroll}
        />
      </div>

      {/* Discussion Panel - Takes 40% of the width */}
      <div className="w-2/5 h-full">
        <DiscussionPanel
          discussions={activeDiscussions}
          currentPosition={currentPosition}
        />
      </div>
    </div>
  );
} 