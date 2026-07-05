import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getInterviewState, updateActiveQuestionState } from '@/lib/interview-redis';

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

    // Verify session exists and belongs to user
    const state = await getInterviewState(sessionId);
    if (!state) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    if (state.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (state.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview is no longer active' }, { status: 400 });
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
