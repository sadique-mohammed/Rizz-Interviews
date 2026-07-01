import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questions, answerAttempts, recordings, questionBank } from '@/db/schema';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { questionBankToMarkdown } from '@/lib/question-bank';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get interview with ownership verification (returns 404 if not found or not owned)
    const interviewResult = await db
      .select({
        id: interviews.id,
        domain: interviews.domain,
        difficulty: interviews.difficulty,
        duration: interviews.duration,
        startedAt: interviews.startedAt,
        totalScore: interviews.totalScore,
        status: interviews.status,
      })
      .from(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.userId, userId), ne(interviews.status, 'abandoned')))
      .limit(1);

    if (interviewResult.length === 0) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = interviewResult[0];

    // 2. Get all questions for this interview
    const interviewQuestions = await db
      .select({
        id: questions.id,
        interviewId: questions.interviewId,
        questionBankId: questions.questionBankId,
        createdAt: questions.createdAt,
        bankId: questionBank.id,
        title: questionBank.title,
        description: questionBank.description,
        examples: questionBank.examples,
        constraints: questionBank.constraints,
      })
      .from(questions)
      .innerJoin(questionBank, eq(questions.questionBankId, questionBank.id))
      .where(eq(questions.interviewId, id));

    // 3. Get all answer attempts for these questions
    const questionIds = interviewQuestions.map((q) => q.id);
    const allAnswers =
      questionIds.length > 0
        ? await db
            .select({
              id: answerAttempts.id,
              questionId: answerAttempts.questionId,
              code: answerAttempts.code,
              explanation: answerAttempts.explanation,
              aiFeedback: answerAttempts.aiFeedback,
              score: answerAttempts.score,
            })
            .from(answerAttempts)
            .where(inArray(answerAttempts.questionId, questionIds))
        : [];

    // 4. Get all recordings for this interview
    const interviewRecordings = await db
      .select({
        id: recordings.id,
        videoUrl: recordings.videoUrl,
        transcriptUrl: recordings.transcriptUrl,
        createdAt: recordings.createdAt,
      })
      .from(recordings)
      .where(eq(recordings.interviewId, id));

    // 5. Nest data structure
    const questionsWithAnswers = interviewQuestions.map((q) => {
      const bankQuestion = {
        id: q.bankId,
        title: q.title,
        description: q.description,
        examples: Array.isArray(q.examples) ? q.examples : [],
        constraints: Array.isArray(q.constraints) ? q.constraints : [],
      };

      return {
        id: q.id,
        interviewId: q.interviewId,
        questionBankId: q.questionBankId,
        createdAt: q.createdAt,
        questionBank: bankQuestion,
        aiQuestion: questionBankToMarkdown({
          title: q.title,
          description: q.description,
          examples: bankQuestion.examples as string[],
          constraints: bankQuestion.constraints as string[],
        }),
        answerAttempts: allAnswers.filter((a) => a.questionId === q.id),
      };
    });

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
