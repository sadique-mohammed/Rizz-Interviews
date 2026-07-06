import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { questions } from '@/db/schema';
import {
  getInterviewState,
  markQuestionAnswered,
  appendChatMessages,
} from '@/lib/interview-redis';
import { getInterviewSessionForAccess } from '@/lib/interview-session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthenticated');
    }

    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    const body = await req.json();
    const { attemptId } = body;

    // 1. Enforce DB existence, ownership, and strict expiry
    const dbSession = await getInterviewSessionForAccess(userId, sessionId);
    if (!dbSession || dbSession.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview session is no longer active or expired' }, { status: 403 });
    }

    // 2. Fetch Redis state (now guaranteed to be legally in_progress by DB)
    const state = await getInterviewState(sessionId);
    if (!state || state.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview state is not active' }, { status: 400 });
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
    const { resolveNextBuffer } = await import('@/lib/question-bank');
    const resolved = resolveNextBuffer(chosenNextAction, state.pendingBuffers);

    // Total exhaustion -> force end
    if (!resolved) {
      return NextResponse.json({ success: true, hasNext: false });
    }

    const { key: bufferKeyToPromote, buffer: bufferToPop } = resolved;

    // 4.5 Check if remaining time is sufficient for the next question's difficulty
    const remainingMs = new Date(state.expiresAt).getTime() - Date.now();
    const remainingMins = remainingMs / (1000 * 60);

    let minRequiredMins = 2; // easy and medium
    if (bufferToPop.difficulty === 'hard') minRequiredMins = 5;

    if (remainingMins < minRequiredMins) {
      return NextResponse.json({ success: true, hasNext: false, reason: 'time_limit' });
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
    const newState = await promoteNextQuestion(sessionId, bufferKeyToPromote, sessionQuestion.id, newBuffers);

    if (!newState) {
       return NextResponse.json({ error: 'Failed to promote question' }, { status: 500 });
    }

    // 8. Generate dynamic AI transition message
    const { generateTransition } = await import('@/lib/ai/interview-chat');
    const dynamicTransition = await generateTransition(bufferToPop.title);

    // 9. Append a transition message to chat
    await appendChatMessages(sessionId, [
      {
        id: crypto.randomUUID(),
        role: 'ai' as const,
        text: dynamicTransition,
        timestamp: new Date().toISOString(),
        questionPosition: nextPosition,
        kind: 'message' as const,
      }
    ]);

    return NextResponse.json({
      success: true,
      hasNext: true,
    });

  } catch (error) {
    console.error('Next question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
