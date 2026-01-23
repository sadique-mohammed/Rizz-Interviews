import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const dbUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (dbUser.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const result = await db
      .select({
        interviewId: interviews.id,
        domain: interviews.domain,
        difficulty: interviews.difficulty,
        status: interviews.status,
        totalScore: interviews.totalScore,
      })
      .from(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.userId, dbUser[0].id)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 });
  }
}
