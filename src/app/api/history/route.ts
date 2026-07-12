import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews } from '@/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';

export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthenticated');
    }

    const userInterviews = await db
      .select({
        id: interviews.id,
        domain: interviews.domain,
        difficulty: interviews.difficulty,
        duration: interviews.duration,
        startedAt: interviews.startedAt,
        totalScore: interviews.totalScore,
        status: interviews.status,
      })
      .from(interviews)
      .where(and(eq(interviews.userId, userId), ne(interviews.status, 'abandoned')))
      .orderBy(desc(interviews.startedAt));

    return NextResponse.json(userInterviews);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
