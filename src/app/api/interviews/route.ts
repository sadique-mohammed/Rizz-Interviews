import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questionBank, questions, users } from '@/db/schema';
import { z } from 'zod';
import { createInterviewState, setUserActiveInterview } from '@/lib/interview-redis';
import type { RedisInterviewState, RedisQuestionSlot } from '@/types/interviewRedis';
import { eq, and, sql } from 'drizzle-orm';

const createInterviewSchema = z.object({
  domain: z.enum(['DSA', 'Web Dev']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  duration: z.coerce.number().pipe(z.union([z.literal(1), z.literal(15), z.literal(30), z.literal(45)])),
});

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn('Unauthorized access attempt: No userId provided to /api/interviews');
      throw new Error('Unauthenticated');
    }

    const { success } = await ratelimit.limit(`ratelimit_interview_create_${userId}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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
    
    // Determine max questions cap based on duration
    const maxQuestions = duration === 15 ? 5 : duration === 30 ? 10 : 15;

    // 1. Fetch the 1st active question
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
      .limit(1);

    if (bankQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this domain and difficulty.' },
        { status: 400 }
      );
    }

    const activeQ = bankQuestions[0];
    const seenQuestionBankIds = [activeQ.id];

    // 2. Fetch the initial adaptive buffers
    const { fetchAdaptiveBuffers } = await import('@/lib/question-bank');
    const pendingBuffers = await fetchAdaptiveBuffers(domain, activeQ.difficultyScore, seenQuestionBankIds);

    // Record buffer IDs into the seen ledger
    if (pendingBuffers.harder) seenQuestionBankIds.push(pendingBuffers.harder.questionBankId);
    if (pendingBuffers.easier) seenQuestionBankIds.push(pendingBuffers.easier.questionBankId);
    if (pendingBuffers.same_topic) seenQuestionBankIds.push(pendingBuffers.same_topic.questionBankId);

    // 3. Create the interview row
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

    // 4. Create the active session question in Postgres
    const [sessionQuestion] = await db
      .insert(questions)
      .values({
        interviewId: interview.id,
        questionBankId: activeQ.id,
        position: 0,
      })
      .returning({ id: questions.id });

    // 5. Construct Redis Question Slots
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
        difficultyScore: activeQ.difficultyScore,
        status: 'active',
      },
    ];

    // 6. Generate dynamic AI greeting
    const [localUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    const candidateName = localUser?.name?.split(' ')[0] || 'the candidate';
    const { generateGreeting } = await import('@/lib/ai/interview-chat');
    const dynamicGreeting = await generateGreeting(candidateName);

    // 7. Initialize the Redis state
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
      maxQuestions,
      seenQuestionBankIds,
      pendingBuffers,
      currentQuestionIndex: 0,
      activeQuestionState: {
        hintIndex: 0,
        hintsUsed: 0,
        draftCode: null,
        draftLanguage: null,
        draftExplanation: null,
        lastDraftSavedAt: null,
      },
      chatMessages: [
        {
          id: crypto.randomUUID(),
          role: 'ai',
          text: dynamicGreeting,
          timestamp: new Date().toISOString(),
          questionPosition: 0,
          kind: 'message',
        },
      ],
      chatSummary: {
        text: '',
        summarizedThroughMessageId: null,
        updatedAt: null,
      },
      answeredQuestions: [],
    };

    // 8. Write to Redis
    await createInterviewState(state);
    await setUserActiveInterview(userId, interview.id, duration * 60 * 2);

    return NextResponse.json({ id: interview.id }, { status: 201 });
  } catch (error) {
    console.error('Create interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
