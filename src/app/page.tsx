'use client';

import { useState } from 'react';
import Reader from './components/Reader';
import { Subject, Discussion } from '@/generated/prisma';

export default function Home() {
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newSubjectText, setNewSubjectText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Subject',
          content: newSubjectText,
          url: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subject');
      }

      const subject = await response.json();
      setCurrentSubject(subject);
      setDiscussions([]);
      setNewSubjectText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4">
      {!currentSubject ? (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Create New Subject</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your text here
              </label>
              <textarea
                id="content"
                rows={10}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newSubjectText}
                onChange={(e) => setNewSubjectText(e.target.value)}
                placeholder="Paste or type the text you want to discuss..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newSubjectText.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Subject'}
            </button>
          </form>
        </div>
      ) : (
        <div className="h-[calc(100vh-2rem)]">
          <Reader 
            subject={currentSubject} 
            discussions={discussions}
            onDiscussionsChange={setDiscussions}
          />
        </div>
      )}
    </main>
  );
}
