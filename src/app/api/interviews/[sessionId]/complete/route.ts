import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questions, answerAttempts } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCompletionRatio, getFinalizedStatus } from '@/lib/interview-session';
import { deleteInterviewState } from '@/lib/interview-redis';

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

    let finalTotalScore: number | null = null;

    if (nextStatus === 'completed') {
      // Find all questions for this session
      const sessionQuestions = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.interviewId, sessionId));

      if (sessionQuestions.length > 0) {
        // Find all attempts for these questions
        const attempts = await db
          .select({
            questionId: answerAttempts.questionId,
            score: answerAttempts.score,
          })
          .from(answerAttempts)
          .innerJoin(questions, eq(answerAttempts.questionId, questions.id))
          .where(eq(questions.interviewId, sessionId));

        // Get the best score for each question in case of multiple attempts
        const bestScores = new Map<string, number>();
        for (const a of attempts) {
          const currentBest = bestScores.get(a.questionId) ?? 0;
          const score = a.score ?? 0;
          if (score > currentBest) {
            bestScores.set(a.questionId, score);
          }
        }

        let sum = 0;
        for (const score of bestScores.values()) {
          sum += score;
        }

        // Calculate average percentage (each question is out of 10)
        const maxPossibleScore = sessionQuestions.length * 10;
        finalTotalScore = Math.round((sum / maxPossibleScore) * 100);
      } else {
        finalTotalScore = 0;
      }
    }

    await db
      .update(interviews)
      .set({
        status: nextStatus,
        endedAt: now,
        totalScore: finalTotalScore,
      })
      .where(eq(interviews.id, sessionId));

    // Clear Redis active session
    await deleteInterviewState(sessionId, userId);

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
