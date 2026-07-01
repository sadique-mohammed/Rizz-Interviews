import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { interviews, questionBank, questions } from '@/db/schema';

import type { QuestionBankQuestion } from '@/types/questionBank';

type QuestionBankRow = typeof questionBank.$inferSelect;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asCodeMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

export function questionBankToMarkdown(question: Pick<
  QuestionBankQuestion,
  'title' | 'description' | 'examples' | 'constraints'
>): string {
  const lines = [`## ${question.title}`, '', question.description];

  if (question.examples.length > 0) {
    lines.push('', '**Examples:**');
    question.examples.forEach((example) => lines.push(`- ${example}`));
  }

  if (question.constraints.length > 0) {
    lines.push('', '**Constraints:**');
    question.constraints.forEach((constraint) => lines.push(`- ${constraint}`));
  }

  return lines.join('\n');
}

function mapQuestion(row: QuestionBankRow & { sessionQuestionId: string }): QuestionBankQuestion {
  return {
    sessionQuestionId: row.sessionQuestionId,
    questionBankId: row.id,
    slug: row.slug,
    domain: row.domain as 'DSA' | 'Web Dev',
    difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
    difficultyScore: row.difficultyScore,
    title: row.title,
    primaryTopic: row.primaryTopic,
    secondaryTopic: row.secondaryTopic,
    description: row.description,
    examples: asStringArray(row.examples),
    constraints: asStringArray(row.constraints),
    requiresCode: row.requiresCode,
    starterCode: asCodeMap(row.starterCode),
    hints: asStringArray(row.hints),
  };
}

export async function getOrCreateSessionQuestion(interview: {
  id: string;
  domain: string;
  difficulty: string;
}): Promise<QuestionBankQuestion | null> {
  const [existing] = await db
    .select({
      sessionQuestionId: questions.id,
      id: questionBank.id,
      slug: questionBank.slug,
      domain: questionBank.domain,
      difficulty: questionBank.difficulty,
      difficultyScore: questionBank.difficultyScore,
      title: questionBank.title,
      primaryTopic: questionBank.primaryTopic,
      secondaryTopic: questionBank.secondaryTopic,
      description: questionBank.description,
      examples: questionBank.examples,
      constraints: questionBank.constraints,
      requiresCode: questionBank.requiresCode,
      starterCode: questionBank.starterCode,
      optimalSolution: questionBank.optimalSolution,
      solutionExplanation: questionBank.solutionExplanation,
      timeComplexity: questionBank.timeComplexity,
      spaceComplexity: questionBank.spaceComplexity,
      hints: questionBank.hints,
      followUpQuestions: questionBank.followUpQuestions,
      interviewerNotes: questionBank.interviewerNotes,
      createdAt: questionBank.createdAt,
      updatedAt: questionBank.updatedAt,
    })
    .from(questions)
    .innerJoin(questionBank, eq(questions.questionBankId, questionBank.id))
    .where(eq(questions.interviewId, interview.id))
    .limit(1);

  if (existing) {
    return mapQuestion(existing);
  }

  const [bankQuestion] = await db
    .select()
    .from(questionBank)
    .where(and(eq(questionBank.domain, interview.domain), eq(questionBank.difficulty, interview.difficulty)))
    .orderBy(sql`random()`)
    .limit(1);

  if (!bankQuestion) {
    return null;
  }

  const [created] = await db
    .insert(questions)
    .values({
      interviewId: interview.id,
      questionBankId: bankQuestion.id,
    })
    .returning({ id: questions.id });

  return mapQuestion({ ...bankQuestion, sessionQuestionId: created.id });
}

export async function getSessionQuestionForUser(
  userId: string,
  sessionId: string,
): Promise<QuestionBankQuestion | null> {
  const [session] = await db
    .select({
      id: interviews.id,
      domain: interviews.domain,
      difficulty: interviews.difficulty,
    })
    .from(interviews)
    .where(and(eq(interviews.id, sessionId), eq(interviews.userId, userId)))
    .limit(1);

  if (!session) {
    return null;
  }

  return getOrCreateSessionQuestion(session);
}
