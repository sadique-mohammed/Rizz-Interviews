import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questions, answerAttempts, recordings } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get interview with ownership verification (returns 404 if not found or not owned)
    const interviewResult = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.userId, userId)))
      .limit(1);

    if (interviewResult.length === 0) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = interviewResult[0];

    // 2. Get all questions for this interview
    const interviewQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.interviewId, id));

    // 3. Get all answer attempts for these questions
    const questionIds = interviewQuestions.map((q) => q.id);
    const allAnswers =
      questionIds.length > 0
        ? await db
            .select()
            .from(answerAttempts)
            .where(inArray(answerAttempts.questionId, questionIds))
        : [];

    // 4. Get all recordings for this interview
    const interviewRecordings = await db
      .select()
      .from(recordings)
      .where(eq(recordings.interviewId, id));

    // 5. Nest data structure
    const questionsWithAnswers = interviewQuestions.map((q) => ({
      ...q,
      answerAttempts: allAnswers.filter((a) => a.questionId === q.id),
    }));

    const fullInterviewDetails = {
      ...interview,
      questions: questionsWithAnswers,
      recordings: interviewRecordings,
    };

    return NextResponse.json(fullInterviewDetails);
  } catch (error) {
    console.error('Interview detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
