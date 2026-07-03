/**
 * Shared request/response types for AI evaluation and chat.
 */

import type { AIProvider, GeminiApiMode } from './config';

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/** Server-side context assembled before calling the evaluation model. */
export interface EvaluationRequest {
  question: {
    title: string;
    description: string;
    examples: string[];
    constraints: string[];
    domain: string;
    difficulty: string;
    optimalSolution: Record<string, string>;
    timeComplexity: string;
    spaceComplexity: string;
    interviewerNotes: string;
  };
  candidate: {
    code: string;
    language: string;
    explanation: string;
    hintsUsed: number;
    timeSpentSeconds?: number;
  };
}

/** Structured evaluation response from AI models. */
export interface EvaluationResult {
  score: number; // 0-10 integer
  isCorrect: boolean;
  confidence: 'low' | 'medium' | 'high';
  codeFeedback: string;
  communicationFeedback: string;
  complexityFeedback: string;
  edgeCaseFeedback: string;
  hintPenalty: number; // 0-3
  strengths: string[];
  improvements: string[];
  nextAction: 'follow_up' | 'same_topic' | 'harder' | 'easier' | 'end_interview';
  interviewerReply: string;
  // Provider metadata
  provider: AIProvider;
  model: string;
  apiMode: GeminiApiMode | 'groq-chat' | 'mock';
  store: boolean;
  fallbackUsed: boolean;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/** Request context for interview chat. */
export interface ChatRequest {
  sessionId: string;
  userMessage: string;
  /** Is this message a hint request? */
  isHintRequest: boolean;
  /** Active question public snapshot for context. */
  questionContext: {
    title: string;
    description: string;
    examples: string[];
    constraints: string[];
    domain: string;
    difficulty: string;
    hints: string[];
  };
  /** Current hint state from Redis. */
  hintState: {
    hintIndex: number;
    hintsUsed: number;
    totalHints: number;
  };
  /** Bounded transcript window for the model prompt. */
  transcriptWindow: {
    summary: string | null;
    recentMessages: Array<{
      role: 'ai' | 'user' | 'system';
      text: string;
    }>;
  };
}

/** Chat response from AI models. */
export interface ChatResponse {
  reply: string;
  provider: AIProvider;
  model: string;
  apiMode: GeminiApiMode | 'groq-chat' | 'mock';
  fallbackUsed: boolean;
  /** Updated hint index if a hint was dispensed. */
  newHintIndex?: number;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/** Indicates a transient failure eligible for fallback. */
export class AITransientError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProvider,
    public readonly model: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AITransientError';
  }
}

/** Indicates the response could not be parsed as valid JSON / schema. */
export class AISchemaError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string,
    public readonly provider: AIProvider,
    public readonly model: string,
  ) {
    super(message);
    this.name = 'AISchemaError';
  }
}
