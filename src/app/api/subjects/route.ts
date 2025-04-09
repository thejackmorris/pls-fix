import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, content, isPrivate = true } = await request.json();

    // Ensure the default user exists
    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        email: 'default@example.com',
        name: 'Default User',
      },
    });

    // Create the subject with the default user as owner and create a discussion
    const subject = await prisma.subject.create({
      data: {
        title,
        content,
        isPrivate,
        userId: defaultUser.id,
        permissions: {
          create: {
            userId: defaultUser.id,
            role: 'OWNER',
          },
        },
        discussion: {
          create: {
            userId: defaultUser.id,
          },
        },
      },
      include: {
        permissions: true,
        discussion: {
          include: {
            comments: true,
          },
        },
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

export async function GET(request: Request) {
  try {
    // For now, we'll use a simple check to determine if the user can access subjects
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

    // Get all subjects where:
    // 1. The user is the owner, OR
    // 2. The subject is public, OR
    // 3. The user has explicit permissions
    const subjects = await prisma.subject.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPrivate: false },
          {
            permissions: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        permissions: true,
        discussion: {
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