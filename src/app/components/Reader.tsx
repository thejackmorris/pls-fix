'use client';

import { useState, useRef, useEffect } from 'react';
import { Subject, Discussion, AccessRole } from '@/generated/prisma';
import TextPanel from './TextPanel';
import DiscussionPanel from './DiscussionPanel';

interface ReaderProps {
  subject: Subject;
  discussions: Discussion[];
  onDiscussionsChange: (discussions: Discussion[]) => void;
  userRole?: AccessRole;
  isOwner: boolean;
}

export default function Reader({ 
  subject, 
  discussions: initialDiscussions, 
  onDiscussionsChange,
  userRole,
  isOwner 
}: ReaderProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [activeDiscussions, setActiveDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);

  // Load discussions when subject changes
  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        const response = await fetch(`/api/discussions?subjectId=${subject.id}`);
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        setDiscussions(data);
        onDiscussionsChange(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load discussions');
      }
    };

    loadDiscussions();
  }, [subject.id, onDiscussionsChange]);

  // Update active discussions based on scroll position
  const handleScroll = () => {
    if (!textPanelRef.current) return;
    
    const { scrollTop, clientHeight } = textPanelRef.current;
    const viewportStart = scrollTop;
    const viewportEnd = scrollTop + clientHeight;
    
    const visible = discussions.filter(discussion => {
      const discussionPosition = discussion.startIndex;
      return discussionPosition >= viewportStart && discussionPosition <= viewportEnd;
    });
    
    setActiveDiscussions(visible);
    setCurrentPosition(scrollTop);
  };

  // Handle text selection to create new discussion
  const handleCreateDiscussion = async (startIndex: number, endIndex: number, selectedText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          startIndex,
          endIndex,
          snippet: selectedText,
        }),
      });

      if (!response.ok) throw new Error('Failed to create discussion');

      const newDiscussion = await response.json();
      setDiscussions(prev => [...prev, newDiscussion]);
      onDiscussionsChange([...discussions, newDiscussion]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new comment
  const handleCommentAdd = async (discussionId: string, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussionId,
          content,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      // Refresh discussions to get the new comment
      const discussionsResponse = await fetch(`/api/discussions?subjectId=${subject.id}`);
      if (!discussionsResponse.ok) throw new Error('Failed to refresh discussions');
      const updatedDiscussions = await discussionsResponse.json();
      setDiscussions(updatedDiscussions);
      onDiscussionsChange(updatedDiscussions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {error && (
        <div className="absolute top-4 right-4 p-4 bg-red-50 text-red-700 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {/* Text Panel - Takes 60% of the width */}
      <div className="w-3/5 h-full border-r border-gray-200">
        <TextPanel
          ref={textPanelRef}
          content={subject.content}
          comments={discussions}
          onScroll={handleScroll}
          onCreateComment={handleCreateDiscussion}
          isLoading={isLoading}
          userRole={userRole}
          isOwner={isOwner}
        />
      </div>

      {/* Discussion Panel - Takes 40% of the width */}
      <div className="w-2/5 h-full">
        <DiscussionPanel
          discussions={activeDiscussions}
          selectedDiscussion={selectedDiscussion}
          onSelectDiscussion={setSelectedDiscussion}
          onCreateDiscussion={() => {}}
          onScroll={handleScroll}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 