import { and, eq, sql, gt, lt, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { interviews, questionBank, questions } from '@/db/schema';

import type { QuestionBankQuestion } from '@/types/questionBank';

type QuestionBankRow = typeof questionBank.$inferSelect;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function asCodeMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

export function questionBankToMarkdown(
  question: Pick<QuestionBankQuestion, 'title' | 'description' | 'examples' | 'constraints'>,
): string {
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

import type { RedisQuestionSlot } from '@/types/interviewRedis';

type BufferSlot = Omit<RedisQuestionSlot, 'position' | 'sessionQuestionId' | 'status'>;

function toBufferSlot(row: QuestionBankRow): BufferSlot {
  return {
    questionBankId: row.id,
    title: row.title,
    description: row.description,
    examples: Array.isArray(row.examples) ? row.examples : [],
    constraints: Array.isArray(row.constraints) ? row.constraints : [],
    starterCode: typeof row.starterCode === 'object' ? row.starterCode : {},
    hints: Array.isArray(row.hints) ? row.hints : [],
    domain: row.domain,
    difficulty: row.difficulty,
    difficultyScore: row.difficultyScore,
  } as BufferSlot;
}

export async function fetchAdaptiveBuffers(
  domain: string,
  currentScore: number,
  seenIds: string[],
): Promise<{ harder?: BufferSlot; easier?: BufferSlot; same_topic?: BufferSlot }> {
  const baseCond =
    seenIds.length > 0
      ? and(eq(questionBank.domain, domain), notInArray(questionBank.id, seenIds))
      : eq(questionBank.domain, domain);

  const fetchSlot = async (condition: any) => {
    const [row] = await db
      .select()
      .from(questionBank)
      .where(and(baseCond, condition))
      .orderBy(sql`random()`)
      .limit(1);
    if (!row) return undefined;
    return toBufferSlot(row);
  };

  const [harder, easier, same_topic] = await Promise.all([
    fetchSlot(gt(questionBank.difficultyScore, currentScore)),
    fetchSlot(lt(questionBank.difficultyScore, currentScore)),
    fetchSlot(eq(questionBank.difficultyScore, currentScore)),
  ]);

  const buffers = { harder, easier, same_topic };

  const missingCount = (!harder ? 1 : 0) + (!easier ? 1 : 0) + (!same_topic ? 1 : 0);
  if (missingCount > 0) {
    const newlyFetchedIds = [
      harder?.questionBankId,
      easier?.questionBankId,
      same_topic?.questionBankId,
    ].filter(Boolean) as string[];
    const bulkExcludeIds = [...seenIds, ...newlyFetchedIds];

    const bulkBaseCond =
      bulkExcludeIds.length > 0
        ? and(eq(questionBank.domain, domain), notInArray(questionBank.id, bulkExcludeIds))
        : eq(questionBank.domain, domain);

    const fallbacks = await db
      .select()
      .from(questionBank)
      .where(bulkBaseCond) // ANY question in domain
      .orderBy(sql`random()`)
      .limit(missingCount);

    const fallbackSlots = fallbacks.map(toBufferSlot);

    let fIdx = 0;
    if (!buffers.harder && fallbackSlots[fIdx]) buffers.harder = fallbackSlots[fIdx++];
    if (!buffers.easier && fallbackSlots[fIdx]) buffers.easier = fallbackSlots[fIdx++];
    if (!buffers.same_topic && fallbackSlots[fIdx]) buffers.same_topic = fallbackSlots[fIdx++];
  }

  return buffers;
}

export function resolveNextBuffer(
  chosenNextAction: 'harder' | 'easier' | 'same_topic' | 'follow_up' | 'end_interview' | undefined,
  pendingBuffers: { harder?: BufferSlot; easier?: BufferSlot; same_topic?: BufferSlot },
): { key: 'harder' | 'easier' | 'same_topic'; buffer: BufferSlot } | undefined {
  let initialKey: 'harder' | 'easier' | 'same_topic' = 'same_topic';
  if (chosenNextAction === 'harder') initialKey = 'harder';
  if (chosenNextAction === 'easier') initialKey = 'easier';

  if (pendingBuffers[initialKey])
    return { key: initialKey, buffer: pendingBuffers[initialKey] as BufferSlot };
  if (pendingBuffers['same_topic'])
    return { key: 'same_topic', buffer: pendingBuffers['same_topic'] as BufferSlot };
  if (pendingBuffers['harder'])
    return { key: 'harder', buffer: pendingBuffers['harder'] as BufferSlot };
  if (pendingBuffers['easier'])
    return { key: 'easier', buffer: pendingBuffers['easier'] as BufferSlot };

  return undefined;
}
