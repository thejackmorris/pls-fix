'use client';

import { Discussion } from '@/generated/prisma';
import { useState } from 'react';

interface DiscussionPanelProps {
  discussions: Discussion[];
  selectedDiscussion: Discussion | null;
  onSelectDiscussion: (discussion: Discussion) => void;
  onCreateDiscussion: () => void;
  onScroll: () => void;
  isLoading: boolean;
}

export default function DiscussionPanel({
  discussions,
  selectedDiscussion,
  onSelectDiscussion,
  onCreateDiscussion,
  onScroll,
  isLoading
}: DiscussionPanelProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDiscussion = () => {
    setIsCreating(true);
    onCreateDiscussion();
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50" onScroll={onScroll}>
      {isLoading && (
        <div className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-700 rounded-lg">
          Loading...
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Discussions</h2>
        <button
          onClick={handleCreateDiscussion}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'New Discussion'}
        </button>
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            onClick={() => onSelectDiscussion(discussion)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedDiscussion?.id === discussion.id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-white hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-800">
                Discussion at position {discussion.startIndex}
              </h3>
              <span className="text-sm text-gray-500">
                {new Date(discussion.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-gray-600 line-clamp-2">
              {discussion.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 