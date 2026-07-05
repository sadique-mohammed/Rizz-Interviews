import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, interviews } from '@/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { reconcileUserActiveSession } from '@/lib/interview-session';

export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthenticated');
    }

    // 1. Get only needed user fields (name, email for greeting)
    const dbUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Get the explicit active session for the user
    const activeSession = await reconcileUserActiveSession(userId);

    // 3. Get only needed interview fields for RecentHistoryCard (3 most recent), excluding abandoned
    const recentInterviews = await db
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
      .orderBy(desc(interviews.startedAt))
      .limit(5);

    return NextResponse.json(
      {
        user: dbUsers[0],
        activeSession: activeSession || null,
        interviews: recentInterviews,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
