import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SubjectPermission } from '@/generated/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll use a simple check to determine if the user can access this subject
    // In a real app, you'd want to check the user's session and permissions
    const userEmail = 'default@example.com'; // This would come from your auth system

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
      include: {
        permissions: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if user has access
    const canAccess = !subject.isPrivate || 
                     subject.userId === user.id ||
                     subject.permissions.some((p: SubjectPermission) => p.userId === user.id);

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 