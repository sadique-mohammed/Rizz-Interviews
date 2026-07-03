import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questionBank, questions } from '@/db/schema';
import { z } from 'zod';
import { createInterviewState, setUserActiveInterview } from '@/lib/interview-redis';
import type { RedisInterviewState, RedisQuestionSlot } from '@/types/interviewRedis';
import { eq, and, sql } from 'drizzle-orm';

const createInterviewSchema = z.object({
  domain: z.enum(['DSA', 'Web Dev']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  duration: z.coerce.number().pipe(z.union([z.literal(15), z.literal(30), z.literal(45)])),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createInterviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { domain, difficulty, duration } = validation.data;

    // 1. Fetch 2 questions from the bank for the requested domain/difficulty
    // We order by RANDOM() to get varied questions
    const bankQuestions = await db
      .select()
      .from(questionBank)
      .where(
        and(
          eq(questionBank.domain, domain),
          eq(questionBank.difficulty, difficulty)
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(2);

    if (bankQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this domain and difficulty.' },
        { status: 400 }
      );
    }

    // 2. Create the interview row
    // The database has a partial unique index `interviews_one_active_per_user_idx`
    // which guarantees no concurrent active interviews for the same user.
    let interview;
    try {
      const result = await db
        .insert(interviews)
        .values({
          userId,
          domain,
          difficulty,
          duration,
          status: 'in_progress',
        })
        .returning({ id: interviews.id });
      interview = result[0];
    } catch (error: any) {
      // Postgres error code 23505 = unique_violation
      if (error.code === '23505' && error.constraint === 'interviews_one_active_per_user_idx') {
        // Find their existing active interview to return the ID
        const existing = await db.query.interviews.findFirst({
          where: and(eq(interviews.userId, userId), eq(interviews.status, 'in_progress')),
          columns: { id: true },
        });
        return NextResponse.json(
          { error: 'You already have an active interview session.', sessionId: existing?.id },
          { status: 409 },
        );
      }
      throw error;
    }

    // 3. Create the active session question in Postgres
    const [activeQ, lookaheadQ] = bankQuestions;

    const [sessionQuestion] = await db
      .insert(questions)
      .values({
        interviewId: interview.id,
        questionBankId: activeQ.id,
        position: 0,
      })
      .returning({ id: questions.id });

    // 4. Construct Redis Question Slots (stripping private fields)
    const questionSlots: RedisQuestionSlot[] = [
      {
        questionBankId: activeQ.id,
        sessionQuestionId: sessionQuestion.id,
        position: 0,
        title: activeQ.title,
        description: activeQ.description,
        examples: activeQ.examples as string[],
        constraints: activeQ.constraints as string[],
        starterCode: activeQ.starterCode as Record<string, string>,
        hints: activeQ.hints as string[],
        domain: activeQ.domain,
        difficulty: activeQ.difficulty,
        status: 'active',
      },
    ];

    if (lookaheadQ) {
      questionSlots.push({
        questionBankId: lookaheadQ.id,
        position: 1,
        title: lookaheadQ.title,
        description: lookaheadQ.description,
        examples: lookaheadQ.examples as string[],
        constraints: lookaheadQ.constraints as string[],
        starterCode: lookaheadQ.starterCode as Record<string, string>,
        hints: lookaheadQ.hints as string[],
        domain: lookaheadQ.domain,
        difficulty: lookaheadQ.difficulty,
        status: 'lookahead',
      });
    }

    // 5. Initialize the Redis state
    const state: RedisInterviewState = {
      sessionId: interview.id,
      userId,
      domain: domain as 'DSA' | 'Web Dev',
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      duration,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000).toISOString(),
      status: 'in_progress',
      questionSlots,
      currentQuestionIndex: 0,
      activeQuestionState: {
        hintIndex: 0,
        hintsUsed: 0,
        draftCode: null,
        draftLanguage: null,
        draftExplanation: null,
        lastDraftSavedAt: null,
      },
      chatMessages: [],
      chatSummary: {
        text: '',
        summarizedThroughMessageId: null,
        updatedAt: null,
      },
      answeredQuestions: [],
    };

    // 6. Write to Redis
    await createInterviewState(state);
    await setUserActiveInterview(userId, interview.id, duration * 60 * 2);

    return NextResponse.json({ id: interview.id }, { status: 201 });
  } catch (error) {
    console.error('Create interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
