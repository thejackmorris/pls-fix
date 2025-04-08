'use client';

import { Discussion, Comment } from '@/generated/prisma';

interface DiscussionPanelProps {
  discussions: Discussion[];
  currentPosition: number;
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

interface DiscussionWithComments extends Discussion {
  comments?: CommentWithReplies[];
}

export default function DiscussionPanel({ discussions, currentPosition }: DiscussionPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-white rounded-lg shadow p-4 space-y-4"
          >
            {/* Discussion snippet */}
            <div className="text-sm bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-500 mb-2">Highlighted text:</p>
              <p className="text-gray-800">{discussion.snippet}</p>
            </div>

            {/* Comments section - will be populated once we implement the API */}
            <div className="space-y-4">
              <p className="text-sm text-gray-500">No comments yet</p>
            </div>

            {/* Add comment form */}
            <div className="mt-4 pt-4 border-t">
              <textarea
                placeholder="Add to the discussion..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 