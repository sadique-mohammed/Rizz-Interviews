import { and, eq, gt, lt, notInArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { questionBank } from '@/db/schema';
import type { RedisQuestionSlot } from '@/types/interviewRedis';

type BufferSlot = Omit<RedisQuestionSlot, 'position' | 'sessionQuestionId' | 'status'>;

export async function fetchAdaptiveBuffers(
  domain: string,
  currentScore: number,
  seenIds: string[],
): Promise<{ harder?: BufferSlot; easier?: BufferSlot; same_topic?: BufferSlot }> {
  // Option B: Bulk Fallback Strategy
  const baseCond = seenIds.length > 0 
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
    } as BufferSlot;
  };

  const [harder, easier, same_topic] = await Promise.all([
    fetchSlot(gt(questionBank.difficultyScore, currentScore)),
    fetchSlot(lt(questionBank.difficultyScore, currentScore)),
    fetchSlot(eq(questionBank.difficultyScore, currentScore))
  ]);

  const buffers = { harder, easier, same_topic };
  
  // Bulk Fallback for missing buffers
  const missingCount = (!harder ? 1 : 0) + (!easier ? 1 : 0) + (!same_topic ? 1 : 0);
  if (missingCount > 0) {
    // Exclude the ones we just fetched in the specific queries
    const newlyFetchedIds = [harder?.questionBankId, easier?.questionBankId, same_topic?.questionBankId].filter(Boolean) as string[];
    const bulkExcludeIds = [...seenIds, ...newlyFetchedIds];
    
    const bulkBaseCond = bulkExcludeIds.length > 0
      ? and(eq(questionBank.domain, domain), notInArray(questionBank.id, bulkExcludeIds))
      : eq(questionBank.domain, domain);

    const fallbacks = await db
      .select()
      .from(questionBank)
      .where(bulkBaseCond) // ANY question in domain
      .orderBy(sql`random()`)
      .limit(missingCount);

    const fallbackSlots = fallbacks.map(row => ({
      questionBankId: row.id,
      title: row.title,
      description: row.description,
      examples: Array.isArray(row.examples) ? row.examples : [],
      constraints: Array.isArray(row.constraints) ? row.constraints : [],
      starterCode: typeof row.starterCode === 'object' ? row.starterCode : {},
      hints: Array.isArray(row.hints) ? row.hints : [],
      domain: row.domain,
      difficulty: row.difficulty,
    } as BufferSlot));

    let fIdx = 0;
    if (!buffers.harder && fallbackSlots[fIdx]) buffers.harder = fallbackSlots[fIdx++];
    if (!buffers.easier && fallbackSlots[fIdx]) buffers.easier = fallbackSlots[fIdx++];
    if (!buffers.same_topic && fallbackSlots[fIdx]) buffers.same_topic = fallbackSlots[fIdx++];
  }

  return buffers;
}
