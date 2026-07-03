import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/db';
import { questionBank, answerAttempts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getInterviewState, appendChatMessages } from '@/lib/interview-redis';
import { evaluateAnswer } from '@/lib/ai/evaluate-answer';
import type { EvaluationRequest } from '@/lib/ai/types';

const answerSchema = z.object({
  code: z.string(),
  language: z.string(),
  explanation: z.string().min(1),
  timeSpentSeconds: z.number().optional(),
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
    const validation = answerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code, language, explanation, timeSpentSeconds } = validation.data;

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
    if (!currentSlot || currentSlot.status !== 'active' || !currentSlot.sessionQuestionId) {
      return NextResponse.json({ error: 'No active question found to answer' }, { status: 400 });
    }

    // 2. Fetch private question details from Postgres
    const bankRow = await db.query.questionBank.findFirst({
      where: eq(questionBank.id, currentSlot.questionBankId),
      columns: {
        optimalSolution: true,
        timeComplexity: true,
        spaceComplexity: true,
        interviewerNotes: true,
        starterCode: true,
      },
    });

    if (!bankRow) {
      return NextResponse.json({ error: 'Question data missing in database' }, { status: 500 });
    }

    const defaultCode = (bankRow.starterCode as Record<string, string>)?.[language] || '';
    const userMessages = state.chatMessages.filter(m => m.role === 'user');
    const hasInteracted = userMessages.length > 0;
    
    let isZeroEffortTimeout = false;
    let finalExplanation = explanation;

    if (explanation === 'Auto-submitted when time expired.') {
      if (!hasInteracted && code.trim() === defaultCode.trim()) {
        isZeroEffortTimeout = true;
      } else {
        explanation = 'Auto-submitted when time expired. (Partial effort)';
        finalExplanation = explanation + '\n\nNote to evaluator: The candidate ran out of time. They made partial progress either in chat or by writing partial code. Please evaluate what they have and award partial credit (e.g. 2-5 points) for their effort and logical direction, even if the code does not fully compile or run.';
      }
    }

    let evalResult;

    if (isZeroEffortTimeout) {
      // 3. Fast-path: Skip the 6-second LLM call for 0-effort timeouts
      evalResult = {
        score: 0,
        isCorrect: false,
        confidence: 'high' as const,
        codeFeedback: 'Time expired before any code was written.',
        communicationFeedback: 'No communication recorded.',
        complexityFeedback: 'N/A',
        edgeCaseFeedback: 'N/A',
        hintPenalty: 0,
        strengths: [],
        improvements: ['Time management'],
        nextAction: 'end_interview' as const,
        interviewerReply: "Looks like we ran out of time before you could get started on this one.",
        provider: 'mock' as const,
        model: 'mock',
        apiMode: 'mock' as const,
        store: false,
        fallbackUsed: false,
      };
    } else {
      // 3. Build EvaluationRequest
      const evalReq: EvaluationRequest = {
        question: {
          title: currentSlot.title,
          description: currentSlot.description,
          examples: currentSlot.examples,
          constraints: currentSlot.constraints,
          domain: currentSlot.domain,
          difficulty: currentSlot.difficulty,
          optimalSolution: bankRow.optimalSolution as Record<string, string>,
          timeComplexity: bankRow.timeComplexity,
          spaceComplexity: bankRow.spaceComplexity,
          interviewerNotes: bankRow.interviewerNotes,
        },
        candidate: {
          code,
          language,
          explanation: finalExplanation,
          hintsUsed: state.activeQuestionState.hintsUsed,
          timeSpentSeconds,
        },
      };

      // 4. Call AI to evaluate
      evalResult = await evaluateAnswer(evalReq);
    }

    // 5. Store attempt in Postgres immediately (Durability)
    const [attempt] = await db.insert(answerAttempts).values({
      questionId: currentSlot.sessionQuestionId,
      userId,
      code,
      language,
      explanation,
      hintsUsed: state.activeQuestionState.hintsUsed,
      aiFeedback: evalResult.codeFeedback,
      evaluationResult: evalResult,
      score: evalResult.score,
    }).returning({ id: answerAttempts.id });

    // 6. Append evaluator chat messages to transcript
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      text: `[Submitted answer in ${language}]\nExplanation: ${explanation}`,
      timestamp: new Date().toISOString(),
      questionPosition: currentSlot.position,
      kind: 'message' as const,
    };

    const aiMsg = {
      id: crypto.randomUUID(),
      role: 'ai' as const,
      text: evalResult.interviewerReply,
      timestamp: new Date().toISOString(),
      questionPosition: currentSlot.position,
      kind: 'evaluation' as const,
    };

    await appendChatMessages(sessionId, [userMsg, aiMsg]);

    // Save chosenNextAction for the next-question traversal
    const { updateActiveQuestionState } = await import('@/lib/interview-redis');
    await updateActiveQuestionState(sessionId, {
      chosenNextAction: evalResult.nextAction,
    });

    // NOTE: Question advancement is NOT done here.
    // The frontend will call /next-question when the user is ready to move on.
    // This allows the AI to finish cross-questioning about the current question.

    // 7. Return the evaluation result + attempt metadata to the client
    let hasNextQuestion = state.questionSlots.length < state.maxQuestions;
    if (evalResult.nextAction === 'end_interview') {
      hasNextQuestion = false;
    }

    return NextResponse.json({
      ...evalResult,
      attemptId: attempt.id,
      hasNextQuestion,
    });

  } catch (error) {
    console.error('Answer endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

