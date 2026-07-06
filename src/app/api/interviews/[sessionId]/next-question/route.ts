import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { questions } from '@/db/schema';
import {
  getInterviewState,
  updateInterviewState,
  applyMarkQuestionAnswered,
  applyPromoteNextQuestion,
  applyChatMessages,
} from '@/lib/interview-redis';
import { getInterviewSessionForAccess } from '@/lib/interview-session';
import { resolveNextBuffer, fetchAdaptiveBuffers } from '@/lib/question-bank';
import { generateTransition } from '@/lib/ai/interview-chat';

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
    applyMarkQuestionAnswered(state, {
      sessionQuestionId: currentSlot.sessionQuestionId,
      questionBankId: currentSlot.questionBankId,
      position: currentSlot.position,
      attemptId: attemptId ?? '',
      score: null,
      submittedAt: new Date().toISOString(),
      nextAction: chosenNextAction,
    });

    // 4. Determine buffer to pop (fallback cascade)
    const resolved = resolveNextBuffer(chosenNextAction, state.pendingBuffers);

    // Total exhaustion -> force end
    if (!resolved) {
      await updateInterviewState(sessionId, state);
      return NextResponse.json({ success: true, hasNext: false });
    }

    const { key: bufferKeyToPromote, buffer: bufferToPop } = resolved;

    // 4.5 Check if remaining time is sufficient for the next question's difficulty
    const remainingMs = new Date(state.expiresAt).getTime() - Date.now();
    const remainingMins = remainingMs / (1000 * 60);

    let minRequiredMins = 2; // easy and medium
    if (bufferToPop.difficulty === 'hard') minRequiredMins = 5;

    if (remainingMins < minRequiredMins) {
      await updateInterviewState(sessionId, state);
      return NextResponse.json({ success: true, hasNext: false, reason: 'time_limit' });
    }

    const nextPosition = state.questionSlots.length;
    
    // 5. Refill buffers synchronously if under cap, and generate dynamic AI transition in parallel
    let newBuffers = state.pendingBuffers;
    let dynamicTransition = '';
    
    // We can fetch adaptive buffers and generate transition concurrently
    const [fetchedBuffers, transitionText] = await Promise.all([
      (nextPosition + 1 < state.maxQuestions) 
        ? fetchAdaptiveBuffers(state.domain, bufferToPop.difficultyScore, state.seenQuestionBankIds)
        : Promise.resolve({}),
      generateTransition(bufferToPop.title)
    ]);
    
    newBuffers = fetchedBuffers;
    dynamicTransition = transitionText;

    // 6. Insert Postgres row for new question (Stateful operation happens after AI calls)
    const [sessionQuestion] = await db
      .insert(questions)
      .values({
        interviewId: sessionId,
        questionBankId: bufferToPop.questionBankId,
        position: nextPosition,
      })
      .returning({ id: questions.id });

    // 7. Late-stage Redis Commit (Promote buffer)
    const promoteSuccess = applyPromoteNextQuestion(state, bufferKeyToPromote, sessionQuestion.id, newBuffers);

    if (!promoteSuccess) {
       return NextResponse.json({ error: 'Failed to promote question' }, { status: 500 });
    }

    // 8. Append a transition message to chat
    applyChatMessages(state, [
      {
        id: crypto.randomUUID(),
        role: 'ai' as const,
        text: dynamicTransition,
        timestamp: new Date().toISOString(),
        questionPosition: nextPosition,
        kind: 'message' as const,
      }
    ]);

    await updateInterviewState(sessionId, state);

    return NextResponse.json({
      success: true,
      hasNext: true,
    });

  } catch (error) {
    console.error('Next question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
