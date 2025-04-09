import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get or create the default user
    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        email: 'default@example.com',
        name: 'Default User',
      },
    });

    return NextResponse.json(defaultUser);
  } catch (error) {
    console.error('Error getting default user:', error);
    return NextResponse.json(
      { error: 'Failed to get default user' },
      { status: 500 }
    );
  }
} 