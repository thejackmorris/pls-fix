import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { discussionId, content, parentId } = await request.json();

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        parentId,
        userId: '1', // TODO: Replace with actual user ID from auth
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discussionId = searchParams.get('discussionId');

    if (!discussionId) {
      return NextResponse.json(
        { error: 'Discussion ID is required' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        discussionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
} 