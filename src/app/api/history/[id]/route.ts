import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { interviews, questions, answerAttempts, recordings, questionBank } from '@/db/schema';
import { and, eq, inArray, ne, asc } from 'drizzle-orm';
import { questionBankToMarkdown } from '@/lib/question-bank';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthenticated');
    }

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
      .where(
        and(
          eq(interviews.id, id),
          eq(interviews.userId, userId),
          ne(interviews.status, 'abandoned'),
        ),
      )
      .limit(1);

    if (interviewResult.length === 0) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = interviewResult[0];

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
      .where(eq(questions.interviewId, id))
      .orderBy(asc(questions.position));

    const questionIds = interviewQuestions.map((q) => q.id);
    const allAnswers =
      questionIds.length > 0
        ? await db
            .select({
              id: answerAttempts.id,
              questionId: answerAttempts.questionId,
              code: answerAttempts.code,
              language: answerAttempts.language,
              explanation: answerAttempts.explanation,
              hintsUsed: answerAttempts.hintsUsed,
              aiFeedback: answerAttempts.aiFeedback,
              evaluationResult: answerAttempts.evaluationResult,
              score: answerAttempts.score,
            })
            .from(answerAttempts)
            .where(inArray(answerAttempts.questionId, questionIds))
        : [];

    const interviewRecordings = await db
      .select({
        id: recordings.id,
        videoUrl: recordings.videoUrl,
        transcriptUrl: recordings.transcriptUrl,
        createdAt: recordings.createdAt,
      })
      .from(recordings)
      .where(eq(recordings.interviewId, id));

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
