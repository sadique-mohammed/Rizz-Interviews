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

export interface RedisQuestionSlot {
  questionBankId: string;
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
  difficultyScore: number;
  status: 'lookahead' | 'active' | 'answered' | 'skipped';
}

export interface RedisActiveQuestionState {
  hintIndex: number;
  hintsUsed: number;
  draftCode: string | null;
  draftLanguage: string | null;
  draftExplanation: string | null;
  lastDraftSavedAt: string | null;
  chosenNextAction?: 'follow_up' | 'same_topic' | 'harder' | 'easier' | 'end_interview';
}

export interface RedisChatMessage {
  id: string;
  role: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  questionPosition?: number;
  kind?: 'message' | 'hint' | 'evaluation' | 'transition';
}

export interface RedisChatSummary {
  text: string;
  summarizedThroughMessageId: string | null;
  updatedAt: string | null;
}

export interface RedisAnsweredQuestion {
  sessionQuestionId: string;
  questionBankId: string;
  position: number;
  attemptId: string;
  score: number | null;
  submittedAt: string;
  nextAction?: 'follow_up' | 'same_topic' | 'harder' | 'easier' | 'end_interview';
}

export interface RedisInterviewState {
  sessionId: string;
  userId: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  status: 'in_progress';

  questionSlots: RedisQuestionSlot[];

  maxQuestions: number;

  seenQuestionBankIds: string[];

  pendingBuffers: {
    harder?: Omit<RedisQuestionSlot, 'position' | 'sessionQuestionId' | 'status'>;
    easier?: Omit<RedisQuestionSlot, 'position' | 'sessionQuestionId' | 'status'>;
    same_topic?: Omit<RedisQuestionSlot, 'position' | 'sessionQuestionId' | 'status'>;
  };

  currentQuestionIndex: number;

  activeQuestionState: RedisActiveQuestionState;

  chatMessages: RedisChatMessage[];

  chatSummary: RedisChatSummary;

  answeredQuestions: RedisAnsweredQuestion[];
}
