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

    const chosenNextAction = state.activeQuestionState.chosenNextAction;

    // 2. Defensive check for early end
    if (chosenNextAction === 'end_interview') {
      return NextResponse.json({ success: true, hasNext: false });
    }

    // 3. Record the answer in history
    await markQuestionAnswered(sessionId, {
      sessionQuestionId: currentSlot.sessionQuestionId,
      questionBankId: currentSlot.questionBankId,
      position: currentSlot.position,
      attemptId: attemptId ?? '',
      score: null,
      submittedAt: new Date().toISOString(),
      nextAction: chosenNextAction,
    });

    // 4. Determine buffer to pop (fallback cascade)
    let bufferKey: 'harder' | 'easier' | 'same_topic' = 'same_topic';
    if (chosenNextAction === 'harder') bufferKey = 'harder';
    if (chosenNextAction === 'easier') bufferKey = 'easier';
    if (chosenNextAction === 'same_topic') bufferKey = 'same_topic';
    // 'follow_up' naturally uses 'same_topic'

    let bufferToPop = state.pendingBuffers[bufferKey];
    if (!bufferToPop) bufferToPop = state.pendingBuffers['same_topic'];
    if (!bufferToPop) bufferToPop = state.pendingBuffers['harder'];
    if (!bufferToPop) bufferToPop = state.pendingBuffers['easier'];

    // Total exhaustion -> force end
    if (!bufferToPop) {
      return NextResponse.json({ success: true, hasNext: false });
    }

    // 5. Insert Postgres row for new question
    const nextPosition = state.questionSlots.length;
    const [sessionQuestion] = await db
      .insert(questions)
      .values({
        interviewId: sessionId,
        questionBankId: bufferToPop.questionBankId,
        position: nextPosition,
      })
      .returning({ id: questions.id });

    // 6. Refill buffers synchronously if under cap
    let newBuffers = state.pendingBuffers;
    if (nextPosition + 1 < state.maxQuestions) {
      const { fetchAdaptiveBuffers } = await import('@/lib/question-bank');
      // current state.seenQuestionBankIds is slightly stale since bufferToPop isn't added?
      // Actually bufferToPop WAS added to seenQuestionBankIds when it was fetched! So seenQuestionBankIds is perfectly accurate.
      newBuffers = await fetchAdaptiveBuffers(state.domain, bufferToPop.difficultyScore, state.seenQuestionBankIds);
    } else {
      // Empty out buffers if we hit the cap so we don't hold them in memory
      newBuffers = {};
    }

    // 7. Late-stage Redis Commit (Promote buffer)
    const { promoteNextQuestion } = await import('@/lib/interview-redis');
    const newState = await promoteNextQuestion(sessionId, bufferKey, sessionQuestion.id, newBuffers);

    if (!newState) {
       return NextResponse.json({ error: 'Failed to promote question' }, { status: 500 });
    }

    // 8. Append a transition message to chat
    await appendChatMessages(sessionId, [{
      id: crypto.randomUUID(),
      role: 'system' as const,
      text: `Great work on that question! Let's move on to the next one.`,
      timestamp: new Date().toISOString(),
      kind: 'transition' as const,
    }]);

    return NextResponse.json({
      success: true,
      hasNext: true,
    });

  } catch (error) {
    console.error('Next question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
