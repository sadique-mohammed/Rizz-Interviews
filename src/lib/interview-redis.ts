import 'server-only';

import { redis } from '@/lib/redis';
import type {
  RedisInterviewState,
  RedisQuestionSlot,
  RedisActiveQuestionState,
  RedisChatMessage,
  RedisChatSummary,
  RedisAnsweredQuestion,
} from '@/types/interviewRedis';
import { resolveNextBuffer } from '@/lib/question-bank';

// ---------------------------------------------------------------------------
// Key builders
// ---------------------------------------------------------------------------

/** Main session state key. TTL = durationMinutes * 60 * 2. */
export function interviewStateKey(sessionId: string): string {
  return `interview:${sessionId}:state`;
}

/** User → active session pointer (cache only, not the authoritative lock). */
export function userActiveInterviewKey(userId: string): string {
  return `user:${userId}:activeInterview`;
}

// ---------------------------------------------------------------------------
// Create / Read / Delete session state
// ---------------------------------------------------------------------------

/**
 * Store initial interview state in Redis.
 *
 * Called after Postgres interview row is created and active + lookahead
 * questions are selected. TTL = durationMinutes * 60 * 2.
 */
export async function createInterviewState(
  state: RedisInterviewState,
): Promise<void> {
  const ttl = state.duration * 60 * 2;
  const key = interviewStateKey(state.sessionId);

  await redis.set(key, JSON.stringify(state), { ex: ttl });
}

/**
 * Read and parse the full interview session state from Redis.
 * Returns null if the key does not exist or has expired.
 */
export async function getInterviewState(
  sessionId: string,
): Promise<RedisInterviewState | null> {
  const raw = await redis.get<string>(interviewStateKey(sessionId));
  if (!raw) return null;

  // @upstash/redis auto-deserializes JSON, so raw may already be an object
  if (typeof raw === 'object') return raw as unknown as RedisInterviewState;

  try {
    return JSON.parse(raw) as RedisInterviewState;
  } catch {
    console.error(`[interview-redis] Failed to parse state for session ${sessionId}`);
    return null;
  }
}

/**
 * Atomically update the full session state.
 * Preserves the existing TTL.
 */
export async function updateInterviewState(
  sessionId: string,
  state: RedisInterviewState,
): Promise<void> {
  const key = interviewStateKey(sessionId);
  const remainingMs = new Date(state.expiresAt).getTime() - Date.now();
  const ttl = Math.max(Math.ceil(remainingMs / 1000), 60);

  await redis.set(key, JSON.stringify(state), { ex: ttl });
}

/**
 * Delete session state and user pointer on complete/abandon.
 */
export async function deleteInterviewState(
  sessionId: string,
  userId: string,
): Promise<void> {
  await Promise.all([
    redis.del(interviewStateKey(sessionId)),
    redis.del(userActiveInterviewKey(userId)),
  ]);
}

// ---------------------------------------------------------------------------
// User active-session pointer (cache only)
// ---------------------------------------------------------------------------

/**
 * Set the user → active session pointer with TTL.
 * This is a cache pointer, NOT the authoritative lock (Postgres partial
 * unique index is the lock).
 */
export async function setUserActiveInterview(
  userId: string,
  sessionId: string,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(userActiveInterviewKey(userId), sessionId, { ex: ttlSeconds });
}

/**
 * Read the user's active interview session ID.
 * Returns null if no active session or pointer expired.
 */
export async function getUserActiveInterview(
  userId: string,
): Promise<string | null> {
  return redis.get<string>(userActiveInterviewKey(userId));
}

// ---------------------------------------------------------------------------
// Active question state updates
// ---------------------------------------------------------------------------

/**
 * Update the mutable active question state (drafts, hints).
 * Reads current state, merges updates, writes back.
 */
export async function updateActiveQuestionState(
  sessionId: string,
  updates: Partial<RedisActiveQuestionState>,
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  applyActiveQuestionState(state, updates);
  await updateInterviewState(sessionId, state);
  return state;
}

/**
 * Pure mutator for active question state.
 */
export function applyActiveQuestionState(
  state: RedisInterviewState,
  updates: Partial<RedisActiveQuestionState>,
): void {
  state.activeQuestionState = {
    ...state.activeQuestionState,
    ...updates,
  };
}

// ---------------------------------------------------------------------------
// Chat message operations
// ---------------------------------------------------------------------------

/**
 * Append a chat message to the session transcript.
 */
export async function appendChatMessage(
  sessionId: string,
  message: RedisChatMessage,
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  state.chatMessages.push(message);
  await updateInterviewState(sessionId, state);
  return state;
}

/**
 * Append multiple chat messages (e.g., user + AI pair).
 */
export async function appendChatMessages(
  sessionId: string,
  messages: RedisChatMessage[],
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  applyChatMessages(state, messages);
  await updateInterviewState(sessionId, state);
  return state;
}

/**
 * Pure mutator to append chat messages.
 */
export function applyChatMessages(
  state: RedisInterviewState,
  messages: RedisChatMessage[],
): void {
  state.chatMessages.push(...messages);
}

/**
 * Update the rolling chat summary (for transcript windowing).
 */
export async function updateChatSummary(
  sessionId: string,
  summary: RedisChatSummary,
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  state.chatSummary = summary;
  await updateInterviewState(sessionId, state);
  return state;
}

// ---------------------------------------------------------------------------
// Question transition operations
// ---------------------------------------------------------------------------

/**
 * Mark the current active question as answered and record the attempt.
 * Advances currentQuestionIndex and activates the next lookahead if available.
 * Resets activeQuestionState for the new question.
 */
export async function markQuestionAnswered(
  sessionId: string,
  answered: RedisAnsweredQuestion,
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  applyMarkQuestionAnswered(state, answered);
  await updateInterviewState(sessionId, state);
  return state;
}

/**
 * Pure mutator to mark a question as answered.
 */
export function applyMarkQuestionAnswered(
  state: RedisInterviewState,
  answered: RedisAnsweredQuestion,
): void {
  const currentSlot = state.questionSlots[state.currentQuestionIndex];
  if (currentSlot) {
    currentSlot.status = 'answered';
  }

  state.answeredQuestions.push(answered);
  
  if (answered.nextAction) {
    state.activeQuestionState.chosenNextAction = answered.nextAction;
  }
}

/**
 * Promote a buffer to be the next active question.
 * Pops the designated buffer from pendingBuffers, appends it to questionSlots,
 * assigns the Postgres sessionQuestionId, and updates the seenQuestionBankIds ledger.
 */
export async function promoteNextQuestion(
  sessionId: string,
  chosenBufferKey: 'harder' | 'easier' | 'same_topic',
  sessionQuestionId: string,
  newBuffers: RedisInterviewState['pendingBuffers'],
): Promise<RedisInterviewState | null> {
  const state = await getInterviewState(sessionId);
  if (!state) return null;

  const success = applyPromoteNextQuestion(state, chosenBufferKey, sessionQuestionId, newBuffers);
  if (!success) return null;

  await updateInterviewState(sessionId, state);
  return state;
}

/**
 * Pure mutator to promote a buffer.
 * Returns true if successful, false if exhausted.
 */
export function applyPromoteNextQuestion(
  state: RedisInterviewState,
  chosenBufferKey: 'harder' | 'easier' | 'same_topic',
  sessionQuestionId: string,
  newBuffers: RedisInterviewState['pendingBuffers'],
): boolean {
  const resolved = resolveNextBuffer(chosenBufferKey, state.pendingBuffers);
  if (!resolved) return false;

  const { buffer: bufferToPop } = resolved;

  const nextPosition = state.questionSlots.length;
  const newSlot: RedisQuestionSlot = {
    ...bufferToPop,
    position: nextPosition,
    sessionQuestionId,
    status: 'active',
  };

  state.questionSlots.push(newSlot);
  state.currentQuestionIndex = nextPosition;
  state.activeQuestionState = createFreshActiveQuestionState();
  state.pendingBuffers = newBuffers;
  
  if (newBuffers.harder) state.seenQuestionBankIds.push(newBuffers.harder.questionBankId);
  if (newBuffers.easier) state.seenQuestionBankIds.push(newBuffers.easier.questionBankId);
  if (newBuffers.same_topic) state.seenQuestionBankIds.push(newBuffers.same_topic.questionBankId);

  return true;
}



// ---------------------------------------------------------------------------
// Transcript windowing helpers
// ---------------------------------------------------------------------------

/**
 * Get the bounded chat context for model prompts.
 * Returns rolling summary + last N messages (default 15).
 */
export function getTranscriptWindow(
  state: RedisInterviewState,
  maxRecentMessages: number = 15,
): { summary: string | null; recentMessages: RedisChatMessage[] } {
  const { chatMessages, chatSummary } = state;

  const recentMessages = chatMessages.slice(-maxRecentMessages);
  const summary = chatSummary.text || null;

  return { summary, recentMessages };
}

/**
 * Check if the transcript needs a rolling summary update.
 * Trigger when total messages exceed the threshold.
 */
export function needsSummaryUpdate(
  state: RedisInterviewState,
  threshold: number = 20,
): boolean {
  return state.chatMessages.length > threshold;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Create a fresh active question state. */
export function createFreshActiveQuestionState(): RedisActiveQuestionState {
  return {
    hintIndex: 0,
    hintsUsed: 0,
    draftCode: null,
    draftLanguage: null,
    draftExplanation: null,
    lastDraftSavedAt: null,
  };
}

/** Create a fresh chat summary. */
export function createFreshChatSummary(): RedisChatSummary {
  return {
    text: '',
    summarizedThroughMessageId: null,
    updatedAt: null,
  };
}
