/**
 * Redis interview session state types.
 *
 * These types define the shape of `interview:{sessionId}:state` in Redis.
 * Redis owns active interview runtime state (refresh recovery, drafts, chat,
 * hints, question snapshots). Postgres owns durable history.
 *
 * IMPORTANT: Never include `optimalSolution`, `solutionExplanation`, or
 * `interviewerNotes` in any Redis-stored type.
 */

// ---------------------------------------------------------------------------
// Question Slot — public snapshot stored in Redis
// ---------------------------------------------------------------------------

export interface RedisQuestionSlot {
  questionBankId: string;
  /** Created only when this question becomes active (not for lookahead). */
  sessionQuestionId?: string;
  position: number;
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  starterCode: Record<string, string>;
  hints: string[];
  domain: string;
  difficulty: string;
  status: 'lookahead' | 'active' | 'answered' | 'skipped';
}

// ---------------------------------------------------------------------------
// Active Question State — mutable per-question progress
// ---------------------------------------------------------------------------

export interface RedisActiveQuestionState {
  /** Index of the next hint to reveal (0-based). */
  hintIndex: number;
  /** Total hints consumed for this question (for scoring penalty). */
  hintsUsed: number;
  draftCode: string | null;
  draftLanguage: string | null;
  draftExplanation: string | null;
  lastDraftSavedAt: string | null;
}

// ---------------------------------------------------------------------------
// Chat Message
// ---------------------------------------------------------------------------

export interface RedisChatMessage {
  id: string;
  role: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  /** Which question position this message relates to. */
  questionPosition?: number;
  kind?: 'message' | 'hint' | 'evaluation' | 'transition';
}

// ---------------------------------------------------------------------------
// Chat Summary — rolling summary for transcript windowing
// ---------------------------------------------------------------------------

export interface RedisChatSummary {
  text: string;
  /** The id of the last message included in this summary. */
  summarizedThroughMessageId: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Answered Question Reference
// ---------------------------------------------------------------------------

export interface RedisAnsweredQuestion {
  sessionQuestionId: string;
  questionBankId: string;
  position: number;
  attemptId: string;
  score: number | null;
  submittedAt: string;
}

// ---------------------------------------------------------------------------
// Full Interview State — stored at interview:{sessionId}:state
// ---------------------------------------------------------------------------

export interface RedisInterviewState {
  sessionId: string;
  userId: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  status: 'in_progress';

  /** Active + lookahead question snapshots (public fields only). */
  questionSlots: RedisQuestionSlot[];

  /** Index into questionSlots for the currently active question. */
  currentQuestionIndex: number;

  /** Mutable state for the active question (hints, drafts). */
  activeQuestionState: RedisActiveQuestionState;

  /** Full chat transcript for refresh recovery. */
  chatMessages: RedisChatMessage[];

  /** Rolling summary for transcript windowing (sent to models). */
  chatSummary: RedisChatSummary;

  /** References to submitted & evaluated answers. */
  answeredQuestions: RedisAnsweredQuestion[];
}
