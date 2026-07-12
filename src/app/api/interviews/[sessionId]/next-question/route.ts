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
  { params }: { params: Promise<{ sessionId: string }> },
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

    const dbSession = await getInterviewSessionForAccess(userId, sessionId);
    if (!dbSession || dbSession.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Interview session is no longer active or expired' },
        { status: 403 },
      );
    }

    const state = await getInterviewState(sessionId);
    if (!state || state.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview state is not active' }, { status: 400 });
    }

    const currentSlot = state.questionSlots[state.currentQuestionIndex];
    if (!currentSlot || !currentSlot.sessionQuestionId) {
      return NextResponse.json({ error: 'No active question to advance from' }, { status: 400 });
    }

    const chosenNextAction = state.activeQuestionState.chosenNextAction;

    if (chosenNextAction === 'end_interview') {
      return NextResponse.json({ success: true, hasNext: false });
    }

    applyMarkQuestionAnswered(state, {
      sessionQuestionId: currentSlot.sessionQuestionId,
      questionBankId: currentSlot.questionBankId,
      position: currentSlot.position,
      attemptId: attemptId ?? '',
      score: null,
      submittedAt: new Date().toISOString(),
      nextAction: chosenNextAction,
    });

    const resolved = resolveNextBuffer(chosenNextAction, state.pendingBuffers);

    if (!resolved) {
      await updateInterviewState(sessionId, state);
      return NextResponse.json({ success: true, hasNext: false });
    }

    const { key: bufferKeyToPromote, buffer: bufferToPop } = resolved;

    const remainingMs = new Date(state.expiresAt).getTime() - Date.now();
    const remainingMins = remainingMs / (1000 * 60);

    let minRequiredMins = 2; // easy and medium
    if (bufferToPop.difficulty === 'hard') minRequiredMins = 5;

    if (remainingMins < minRequiredMins) {
      await updateInterviewState(sessionId, state);
      return NextResponse.json({ success: true, hasNext: false, reason: 'time_limit' });
    }

    const nextPosition = state.questionSlots.length;

    let newBuffers = state.pendingBuffers;
    let dynamicTransition = '';

    const [fetchedBuffers, transitionText] = await Promise.all([
      nextPosition + 1 < state.maxQuestions
        ? fetchAdaptiveBuffers(state.domain, bufferToPop.difficultyScore, state.seenQuestionBankIds)
        : Promise.resolve({}),
      generateTransition(bufferToPop.title),
    ]);

    newBuffers = fetchedBuffers;
    dynamicTransition = transitionText;

    const [sessionQuestion] = await db
      .insert(questions)
      .values({
        interviewId: sessionId,
        questionBankId: bufferToPop.questionBankId,
        position: nextPosition,
      })
      .returning({ id: questions.id });

    const promoteSuccess = applyPromoteNextQuestion(
      state,
      bufferKeyToPromote,
      sessionQuestion.id,
      newBuffers,
    );

    if (!promoteSuccess) {
      return NextResponse.json({ error: 'Failed to promote question' }, { status: 500 });
    }

    applyChatMessages(state, [
      {
        id: crypto.randomUUID(),
        role: 'ai' as const,
        text: dynamicTransition,
        timestamp: new Date().toISOString(),
        questionPosition: nextPosition,
        kind: 'message' as const,
      },
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
