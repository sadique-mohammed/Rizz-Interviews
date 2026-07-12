/**
 * Shared request/response types for AI evaluation and chat.
 */

import type { AIProvider, GeminiApiMode } from './config';

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
  provider: AIProvider;
  model: string;
  apiMode: GeminiApiMode | 'groq-chat' | 'mock';
  store: boolean;
  fallbackUsed: boolean;
}

export interface ChatRequest {
  sessionId: string;
  userMessage: string;
  isHintRequest: boolean;
  questionContext: {
    title: string;
    description: string;
    examples: string[];
    constraints: string[];
    domain: string;
    difficulty: string;
    hints: string[];
  };
  hintState: {
    hintIndex: number;
    hintsUsed: number;
    totalHints: number;
  };
  transcriptWindow: {
    summary: string | null;
    recentMessages: Array<{
      role: 'ai' | 'user' | 'system';
      text: string;
    }>;
  };
}

export interface ChatResponse {
  reply: string;
  provider: AIProvider;
  model: string;
  apiMode: GeminiApiMode | 'groq-chat' | 'mock';
  fallbackUsed: boolean;
  newHintIndex?: number;
}

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
