import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, content, url, isPrivate = true } = await request.json();

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

    const subject = await prisma.subject.create({
      data: {
        title,
        content,
        url,
        isPrivate,
        userId: user.id,
        permissions: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        permissions: true
      }
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
    // First, ensure we have a user
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Fetch subjects that are either:
    // 1. Public
    // 2. Owned by the user
    // 3. User has explicit permissions
    const subjects = await prisma.subject.findMany({
      where: {
        OR: [
          { isPrivate: false },
          { userId: user.id },
          {
            permissions: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      },
      include: {
        discussions: {
          include: {
            comments: true,
          },
        },
        permissions: {
          where: {
            userId: user.id
          }
        }
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