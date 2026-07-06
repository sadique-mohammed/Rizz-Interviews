import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getInterviewState, getTranscriptWindow, appendChatMessages, updateActiveQuestionState } from '@/lib/interview-redis';
import { generateInterviewChat } from '@/lib/ai/interview-chat';
import type { ChatRequest } from '@/lib/ai/types';
import { getInterviewSessionForAccess } from '@/lib/interview-session';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  isHintRequest: z.boolean().default(false),
});

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
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { message, isHintRequest } = validation.data;

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
    if (!currentSlot) {
      return NextResponse.json({ error: 'No active question found' }, { status: 400 });
    }

    // 2. Prepare ChatRequest
    const transcriptWindow = getTranscriptWindow(state, 15);
    
    const chatReq: ChatRequest = {
      sessionId,
      userMessage: message,
      isHintRequest,
      questionContext: {
        title: currentSlot.title,
        description: currentSlot.description,
        examples: currentSlot.examples,
        constraints: currentSlot.constraints,
        domain: currentSlot.domain,
        difficulty: currentSlot.difficulty,
        hints: currentSlot.hints,
      },
      hintState: {
        hintIndex: state.activeQuestionState.hintIndex,
        hintsUsed: state.activeQuestionState.hintsUsed,
        totalHints: currentSlot.hints.length,
      },
      transcriptWindow,
    };

    // 3. Call AI
    const aiResponse = await generateInterviewChat(chatReq);

    // 4. Update Redis State
    // Append messages
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      text: message,
      timestamp: new Date().toISOString(),
      questionPosition: currentSlot.position,
      kind: (isHintRequest ? 'hint' : 'message') as any,
    };
    
    const aiMsg = {
      id: crypto.randomUUID(),
      role: 'ai' as const,
      text: aiResponse.reply,
      timestamp: new Date().toISOString(),
      questionPosition: currentSlot.position,
      kind: (isHintRequest ? 'hint' : 'message') as any,
    };

    await appendChatMessages(sessionId, [userMsg, aiMsg]);

    // Update hints if dispensed
    if (aiResponse.newHintIndex !== undefined) {
      await updateActiveQuestionState(sessionId, {
        hintIndex: aiResponse.newHintIndex,
        hintsUsed: state.activeQuestionState.hintsUsed + 1,
      });
    }

    // 5. Return response
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
