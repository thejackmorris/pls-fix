'use client';

import { useEffect, useState } from 'react';
import { Subject, Discussion, AccessRole } from '@/generated/prisma';
import Reader from '@/app/components/Reader';

interface ReaderPageProps {
  params: {
    id: string;
  };
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<AccessRole>('VIEWER');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, get the default user
        const userResponse = await fetch('/api/users/default');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }
        const defaultUser = await userResponse.json();

        // Fetch subject
        const subjectResponse = await fetch(`/api/subjects/${params.id}`);
        if (!subjectResponse.ok) {
          const errorData = await subjectResponse.json();
          throw new Error(errorData.error || 'Failed to fetch subject');
        }
        const subjectData = await subjectResponse.json();
        setSubject(subjectData);

        // Fetch discussions
        const discussionsResponse = await fetch(`/api/discussions?subjectId=${params.id}`);
        if (!discussionsResponse.ok) {
          const errorData = await discussionsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch discussions');
        }
        const discussionsData = await discussionsResponse.json();
        setDiscussions(discussionsData);

        // Determine user role and ownership
        const userPermission = subjectData.permissions.find(
          (p: any) => p.userId === defaultUser.id
        );

        if (subjectData.userId === defaultUser.id) {
          setUserRole('OWNER');
          setIsOwner(true);
        } else if (userPermission) {
          setUserRole(userPermission.role);
          setIsOwner(false);
        } else {
          setUserRole('VIEWER');
          setIsOwner(false);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Subject not found'}</p>
          <a 
            href="/dashboard" 
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <Reader
      subject={subject}
      discussions={discussions}
      onDiscussionsChange={setDiscussions}
      userRole={userRole}
      isOwner={isOwner}
    />
  );
} 