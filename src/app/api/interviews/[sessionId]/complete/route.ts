import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { deleteInterviewState } from '@/lib/interview-redis';
import { calculateAndFinalizeInterview } from '@/lib/interview-session';

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthenticated');
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
      return NextResponse.json({ error: 'Session is not in progress' }, { status: 409 });
    }

    const now = new Date();

    // Check answerAttempts for completion status and update DB
    const nextStatus = await calculateAndFinalizeInterview(sessionId, now);

    // Clear Redis active session
    await deleteInterviewState(sessionId, userId);

    return NextResponse.json(
      {
        success: true,
        status: nextStatus,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Complete interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
