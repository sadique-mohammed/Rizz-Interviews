import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { interviews, questions, answerAttempts } from '@/db/schema';
import type {
  SessionStatus,
  SessionTiming,
  ActiveSessionRecord,
  InterviewSessionRecord,
} from '@/types/interviewSession';
import { getExpectedQuestionsCount } from '@/lib/scoring';

export function isSessionExpired(session: SessionTiming, now: Date = new Date()): boolean {
  const totalDurationMs = session.duration * 60 * 1000;
  if (totalDurationMs <= 0) return true;
  
  // 60-second grace period for network latency and final auto-submits
  const GRACE_PERIOD_MS = 60 * 1000;
  return (now.getTime() - new Date(session.startedAt).getTime()) >= (totalDurationMs + GRACE_PERIOD_MS);
}



export async function calculateAndFinalizeInterview(
  sessionId: string,
  now: Date,
): Promise<SessionStatus> {
  const [interview] = await db
    .select({ duration: interviews.duration, difficulty: interviews.difficulty })
    .from(interviews)
    .where(eq(interviews.id, sessionId))
    .limit(1);

  if (!interview) return 'abandoned';

  const sessionQuestions = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.interviewId, sessionId));

  let status: SessionStatus = 'abandoned';
  let totalScore: number | null = null;

  if (sessionQuestions.length > 0) {
    let attempts = await db
      .select({
        questionId: answerAttempts.questionId,
        score: answerAttempts.score,
        explanation: answerAttempts.explanation,
      })
      .from(answerAttempts)
      .innerJoin(questions, eq(answerAttempts.questionId, questions.id))
      .where(eq(questions.interviewId, sessionId));

    // Filter out 0-effort auto-submissions
    attempts = attempts.filter(
      (a) => !(a.score === 0 && a.explanation === 'Auto-submitted when time expired.')
    );

    if (attempts.length > 0) {
      status = 'completed';

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

      const expectedQuestions = getExpectedQuestionsCount(interview.duration, interview.difficulty);
      const denominatorQuestions = Math.max(expectedQuestions, bestScores.size);
      
      const maxPossible = denominatorQuestions * 10;
      totalScore = Math.round((sum / maxPossible) * 100);
    }
  }

  if (status === 'abandoned') {
    totalScore = 0;
  }

  await db
    .update(interviews)
    .set({
      status,
      endedAt: now,
      totalScore,
    })
    .where(eq(interviews.id, sessionId));

  return status;
}

export async function reconcileUserActiveSession(userId: string): Promise<ActiveSessionRecord | null> {
  const sessions = await db
    .select({
      id: interviews.id,
      domain: interviews.domain,
      difficulty: interviews.difficulty,
      duration: interviews.duration,
      startedAt: interviews.startedAt,
      status: interviews.status,
    })
    .from(interviews)
    .where(and(eq(interviews.userId, userId), eq(interviews.status, 'in_progress')))
    .orderBy(desc(interviews.startedAt));

  if (sessions.length === 0) return null;

  const now = new Date();
  let activeSession: ActiveSessionRecord | null = null;

  for (const session of sessions) {
    if (isSessionExpired(session, now)) {
      await calculateAndFinalizeInterview(session.id, now);
      continue;
    }

    if (!activeSession) {
      activeSession = session;
    }
  }

  return activeSession;
}

export async function getInterviewSessionForAccess(
  userId: string,
  sessionId: string,
): Promise<InterviewSessionRecord | null> {
  const [session] = await db
    .select({
      id: interviews.id,
      domain: interviews.domain,
      difficulty: interviews.difficulty,
      duration: interviews.duration,
      startedAt: interviews.startedAt,
      status: interviews.status,
    })
    .from(interviews)
    .where(and(eq(interviews.id, sessionId), eq(interviews.userId, userId)))
    .limit(1);

  if (!session) return null;

  if (session.status === 'in_progress' && isSessionExpired(session)) {
    const finalStatus = await calculateAndFinalizeInterview(session.id, new Date());
    return {
      ...session,
      status: finalStatus,
    };
  }

  return session;
}
