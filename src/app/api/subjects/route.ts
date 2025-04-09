import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, content, url } = await request.json();

    const subject = await prisma.subject.create({
      data: {
        title,
        content,
        url,
        userId: '1', // TODO: Replace with actual user ID from auth
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        discussions: {
          include: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
} 