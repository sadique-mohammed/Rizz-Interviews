import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getInterviewState, updateActiveQuestionState } from '@/lib/interview-redis';
import { getInterviewSessionForAccess } from '@/lib/interview-session';

const draftSchema = z.object({
  code: z.string(),
  language: z.string(),
  explanation: z.string(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthenticated');
    }

    const { sessionId } = await params;

    const body = await req.json();
    const validation = draftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code, language, explanation } = validation.data;

    // Enforce DB existence, ownership, and strict expiry
    const dbSession = await getInterviewSessionForAccess(userId, sessionId);
    if (!dbSession || dbSession.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview session is no longer active or expired' }, { status: 403 });
    }

    // Verify state in Redis (now guaranteed to be legally in_progress by DB)
    const state = await getInterviewState(sessionId);
    if (!state || state.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session not found or not active' }, { status: 400 });
    }

    // Update draft fields in Redis
    await updateActiveQuestionState(sessionId, {
      draftCode: code,
      draftLanguage: language,
      draftExplanation: explanation,
      lastDraftSavedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
