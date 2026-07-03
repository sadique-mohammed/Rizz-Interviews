import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { interviews, questions, answerAttempts } from '@/db/schema';

export const MINIMUM_COMPLETION_THRESHOLD = 0.3;

import type {
  SessionStatus,
  SessionTiming,
  ActiveSessionRecord,
  InterviewSessionRecord,
} from '@/types/interviewSession';

export function getCompletionRatio(session: SessionTiming, now: Date = new Date()): number {
  const totalDurationMs = session.duration * 60 * 1000;
  if (totalDurationMs <= 0) return 0;
  return (now.getTime() - new Date(session.startedAt).getTime()) / totalDurationMs;
}

export function isSessionExpired(session: SessionTiming, now: Date = new Date()): boolean {
  return getCompletionRatio(session, now) >= 1;
}

export function getFinalizedStatus(session: SessionTiming, now: Date = new Date()): SessionStatus {
  return getCompletionRatio(session, now) < MINIMUM_COMPLETION_THRESHOLD
    ? 'abandoned'
    : 'completed';
}

async function finalizeSessionRecord(
  session: Pick<ActiveSessionRecord, 'id' | 'startedAt' | 'duration'>,
  now: Date,
): Promise<SessionStatus> {
  const status = getFinalizedStatus(session, now);

  let totalScore: number | null = null;

  if (status === 'completed') {
    // Compute real score from answer_attempts — same logic as complete/route.ts
    const sessionQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.interviewId, session.id));

    if (sessionQuestions.length > 0) {
      const attempts = await db
        .select({
          questionId: answerAttempts.questionId,
          score: answerAttempts.score,
        })
        .from(answerAttempts)
        .innerJoin(questions, eq(answerAttempts.questionId, questions.id))
        .where(eq(questions.interviewId, session.id));

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

      const maxPossible = sessionQuestions.length * 10;
      totalScore = Math.round((sum / maxPossible) * 100);
    } else {
      totalScore = 0;
    }
  }

  await db
    .update(interviews)
    .set({
      status,
      endedAt: now,
      totalScore,
    })
    .where(eq(interviews.id, session.id));

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
      await finalizeSessionRecord(session, now);
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
    const finalStatus = await finalizeSessionRecord(session, new Date());
    return {
      ...session,
      status: finalStatus,
    };
  }

  return session;
}
