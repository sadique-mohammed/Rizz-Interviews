import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getInterviewState, getTranscriptWindow, appendChatMessages, updateActiveQuestionState } from '@/lib/interview-redis';
import { generateInterviewChat } from '@/lib/ai/interview-chat';
import type { ChatRequest } from '@/lib/ai/types';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  isHintRequest: z.boolean().default(false),
});

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
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { message, isHintRequest } = validation.data;

    // 1. Fetch Redis state
    const state = await getInterviewState(sessionId);
    if (!state) {
      return NextResponse.json({ error: 'Interview session not found or expired' }, { status: 404 });
    }

    // Authorization check
    if (state.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // State check
    if (state.status !== 'in_progress') {
      return NextResponse.json({ error: 'Interview is no longer active' }, { status: 400 });
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
