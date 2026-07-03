import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { questions } from '@/db/schema';
import {
  getInterviewState,
  markQuestionAnswered,
  appendChatMessages,
} from '@/lib/interview-redis';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    const body = await req.json();
    const { attemptId } = body;

    // 1. Fetch Redis state
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

    const currentSlot = state.questionSlots[state.currentQuestionIndex];
    if (!currentSlot || !currentSlot.sessionQuestionId) {
      return NextResponse.json({ error: 'No active question to advance from' }, { status: 400 });
    }

    const nextIndex = state.currentQuestionIndex + 1;
    const hasNext = nextIndex < state.questionSlots.length;

    // 2. Advance the question in Redis
    await markQuestionAnswered(sessionId, {
      sessionQuestionId: currentSlot.sessionQuestionId,
      questionBankId: currentSlot.questionBankId,
      position: currentSlot.position,
      attemptId: attemptId ?? '',
      score: null,
      submittedAt: new Date().toISOString(),
    });

    // 3. If there's a next question, make sure it has a Postgres session row
    if (hasNext) {
      const nextSlot = state.questionSlots[nextIndex];
      if (nextSlot && !nextSlot.sessionQuestionId) {
        // Create the session question row in Postgres
        const [sessionQuestion] = await db
          .insert(questions)
          .values({
            interviewId: sessionId,
            questionBankId: nextSlot.questionBankId,
            position: nextSlot.position,
          })
          .returning({ id: questions.id });

        // Update the Redis state with the new sessionQuestionId
        const updatedState = await getInterviewState(sessionId);
        if (updatedState) {
          const slot = updatedState.questionSlots[nextIndex];
          if (slot) {
            slot.sessionQuestionId = sessionQuestion.id;
            // Re-save (markQuestionAnswered already saved, but we need to patch the ID)
            const { updateInterviewState } = await import('@/lib/interview-redis');
            await updateInterviewState(sessionId, updatedState);
          }
        }
      }

      // 4. Append a transition message to chat
      await appendChatMessages(sessionId, [{
        id: crypto.randomUUID(),
        role: 'system' as const,
        text: `Great work on that question! Let's move on to the next one.`,
        timestamp: new Date().toISOString(),
        kind: 'transition' as const,
      }]);
    }

    return NextResponse.json({
      success: true,
      hasNext,
    });

  } catch (error) {
    console.error('Next question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
