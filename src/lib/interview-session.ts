import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { interviews } from '@/db/schema';

export const MINIMUM_COMPLETION_THRESHOLD = 0.3;

type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

interface SessionTiming {
  startedAt: Date | string;
  duration: number;
}

interface ActiveSessionRecord extends SessionTiming {
  id: string;
  domain: string;
  difficulty: string;
  status: string | null;
}

interface InterviewSessionRecord extends SessionTiming {
  id: string;
  domain: string;
  difficulty: string;
  status: string | null;
}

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

  await db
    .update(interviews)
    .set({
      status,
      endedAt: now,
      totalScore: status === 'completed' ? 0 : null,
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
