import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { subjectId, startIndex, endIndex } = await request.json();

    // First, ensure we have a user
    let user = await prisma.user.findFirst();
    if (!user) {
      // Create a default user if none exists
      user = await prisma.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
        },
      });
    }

    // Verify the subject exists and check permissions
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        permissions: {
          where: { userId: user.id }
        }
      }
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to create discussions
    const userPermission = subject.permissions[0];
    if (subject.isPrivate && subject.userId !== user.id && 
        (!userPermission || (userPermission.role !== 'EDITOR' && userPermission.role !== 'COMMENTER'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const discussion = await prisma.discussion.create({
      data: {
        startIndex,
        endIndex,
        subjectId,
        userId: user.id,
      },
      include: {
        comments: true,
      },
    });

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    // First, ensure we have a user
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check subject permissions
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        permissions: {
          where: { userId: user.id }
        }
      }
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view discussions
    const userPermission = subject.permissions[0];
    if (subject.isPrivate && subject.userId !== user.id && !userPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const discussions = await prisma.discussion.findMany({
      where: {
        subjectId,
      },
      include: {
        comments: true,
      },
    });

    return NextResponse.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
} 