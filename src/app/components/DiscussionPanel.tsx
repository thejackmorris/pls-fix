'use client';

import { useState } from 'react';
import { Discussion } from '@/generated/prisma';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  discussionId: string;
}

interface DiscussionPanelProps {
  discussions: Discussion[];
  currentPosition: number;
  onCommentAdd: (discussionId: string, content: string) => void;
}

export default function DiscussionPanel({ 
  discussions, 
  currentPosition,
  onCommentAdd 
}: DiscussionPanelProps) {
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [discussionComments, setDiscussionComments] = useState<{ [key: string]: Comment[] }>({});

  const handleCommentSubmit = (discussionId: string) => {
    const content = newComments[discussionId];
    if (!content?.trim()) return;

    // Create a new comment
    const newComment: Comment = {
      id: Date.now().toString(),
      content: content.trim(),
      createdAt: new Date(),
      discussionId
    };

    // Add to local state
    setDiscussionComments(prev => ({
      ...prev,
      [discussionId]: [...(prev[discussionId] || []), newComment]
    }));

    // Call the parent handler
    onCommentAdd(discussionId, content);

    // Clear the input
    setNewComments(prev => ({
      ...prev,
      [discussionId]: ''
    }));
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center text-gray-700 mt-8">
            <p>No discussions yet.</p>
            <p className="text-sm mt-2">Select some text to start a discussion!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white rounded-lg shadow p-4 space-y-4"
            >
              {/* Discussion snippet */}
              <div className="text-sm bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700 mb-2">Highlighted text:</p>
                <p className="text-gray-900">{discussion.snippet}</p>
              </div>

              {/* Comments section */}
              <div className="space-y-4">
                {discussionComments[discussion.id]?.length ? (
                  discussionComments[discussion.id].map(comment => (
                    <div key={comment.id} className="text-gray-800 border-l-2 border-gray-200 pl-3">
                      <p className="text-sm text-gray-600">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">No comments yet</p>
                )}
              </div>

              {/* Add comment form */}
              <div className="mt-4 pt-4 border-t">
                <textarea
                  placeholder="Add to the discussion..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500"
                  rows={3}
                  value={newComments[discussion.id] || ''}
                  onChange={(e) => setNewComments(prev => ({
                    ...prev,
                    [discussion.id]: e.target.value
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleCommentSubmit(discussion.id);
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Press ⌘/Ctrl + Enter to submit</span>
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => handleCommentSubmit(discussion.id)}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 