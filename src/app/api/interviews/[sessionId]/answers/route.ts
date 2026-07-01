import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { answerAttempts, interviews, questions } from '@/db/schema';

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

const submitAnswerSchema = z.object({
  questionId: z.uuid(),
  code: z.string().nullable().optional(),
  explanation: z.string().trim().min(1),
});

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;
    const body = await req.json();
    const validation = submitAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const [sessionQuestion] = await db
      .select({
        questionId: questions.id,
        status: interviews.status,
      })
      .from(questions)
      .innerJoin(interviews, eq(questions.interviewId, interviews.id))
      .where(
        and(
          eq(questions.id, validation.data.questionId),
          eq(questions.interviewId, sessionId),
          eq(interviews.userId, userId),
        ),
      )
      .limit(1);

    if (!sessionQuestion) {
      return NextResponse.json({ error: 'Question not found for this session' }, { status: 404 });
    }

    if (sessionQuestion.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session is not in progress' }, { status: 409 });
    }

    const [attempt] = await db
      .insert(answerAttempts)
      .values({
        questionId: validation.data.questionId,
        userId,
        code: validation.data.code?.trim() || null,
        explanation: validation.data.explanation,
        aiFeedback: null,
        score: null,
      })
      .returning({
        id: answerAttempts.id,
        questionId: answerAttempts.questionId,
        createdAt: answerAttempts.createdAt,
      });

    return NextResponse.json({ success: true, attempt }, { status: 201 });
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
