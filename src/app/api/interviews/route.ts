import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews } from '@/db/schema';
import { z } from 'zod';

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

    const result = await db
      .insert(interviews)
      .values({
        userId,
        domain,
        difficulty,
        duration,
      })
      .returning({ id: interviews.id });

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error('Create interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
