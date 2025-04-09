import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { subjectId, startIndex, endIndex, snippet } = await request.json();

    const discussion = await prisma.discussion.create({
      data: {
        startIndex,
        endIndex,
        snippet,
        subjectId,
        userId: '1', // TODO: Replace with actual user ID from auth
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