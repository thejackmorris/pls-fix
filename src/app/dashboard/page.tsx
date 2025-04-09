'use client';

import { useState, useEffect } from 'react';
import { Subject } from '@/generated/prisma';
import Link from 'next/link';

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectContent, setNewSubjectContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSubjectTitle,
          content: newSubjectContent,
          isPrivate,
        }),
      });

      if (!response.ok) throw new Error('Failed to create subject');

      const newSubject = await response.json();
      setSubjects(prev => [...prev, newSubject]);
      setNewSubjectTitle('');
      setNewSubjectContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Collection</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Create New Subject Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Subject</h2>
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={newSubjectContent}
              onChange={(e) => setNewSubjectContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Make this subject private
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Subject'}
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Subjects</h2>
        {isLoading ? (
          <p>Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500">No subjects yet. Create one above!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/reader/${subject.id}`}
                className="block p-4 border rounded-lg hover:border-indigo-500 transition-colors"
              >
                <h3 className="font-semibold mb-2">{subject.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{subject.content}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${subject.isPrivate ? 'bg-red-400' : 'bg-green-400'}`}></span>
                  {subject.isPrivate ? 'Private' : 'Public'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 