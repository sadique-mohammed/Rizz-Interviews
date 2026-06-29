import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCompletionRatio, getFinalizedStatus } from '@/lib/interview-session';

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;

    // Verify the session belongs to the user and is in_progress
    const [session] = await db
      .select({
        id: interviews.id,
        status: interviews.status,
        startedAt: interviews.startedAt,
        duration: interviews.duration,
      })
      .from(interviews)
      .where(and(eq(interviews.id, sessionId), eq(interviews.userId, userId)))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Session is not in progress' },
        { status: 409 },
      );
    }

    const now = new Date();
    const completionRatio = getCompletionRatio(session, now);
    const nextStatus = getFinalizedStatus(session, now);

    await db
      .update(interviews)
      .set({
        status: nextStatus,
        endedAt: now,
        totalScore: nextStatus === 'completed' ? 0 : null,
      })
      .where(eq(interviews.id, sessionId));

    return NextResponse.json(
      {
        success: true,
        status: nextStatus,
        completionRatio,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Complete interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
