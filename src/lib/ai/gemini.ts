import 'server-only';

import { GoogleGenAI } from '@google/genai';
import {
  getGeminiApiKey,
  shouldStoreGeminiInteractions,
  EVALUATION_TIMEOUT_MS,
  CHAT_TIMEOUT_MS,
  aiLog,
} from './config';
import { AITransientError, AISchemaError } from './types';
import type { EvaluationResult } from './types';
import { validateEvaluationShape } from './validation';

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }
  return _client;
}

const EVALUATION_JSON_SCHEMA = {
  type: 'object' as const,
  properties: {
    score: { type: 'integer' as const, description: 'Overall score 0-10' },
    isCorrect: {
      type: 'boolean' as const,
      description: 'Whether the solution is functionally correct',
    },
    confidence: {
      type: 'string' as const,
      enum: ['low', 'medium', 'high'],
      description: 'Confidence in the evaluation',
    },
    codeFeedback: {
      type: 'string' as const,
      description: 'Feedback on the code quality and correctness',
    },
    communicationFeedback: {
      type: 'string' as const,
      description: 'Feedback on explanation clarity',
    },
    complexityFeedback: {
      type: 'string' as const,
      description: 'Feedback on time/space complexity understanding',
    },
    edgeCaseFeedback: { type: 'string' as const, description: 'Feedback on edge case handling' },
    hintPenalty: { type: 'integer' as const, description: 'Penalty for hints used, 0-3' },
    strengths: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Key strengths',
    },
    improvements: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Areas to improve',
    },
    nextAction: {
      type: 'string' as const,
      enum: ['follow_up', 'same_topic', 'harder', 'easier', 'end_interview'],
      description: 'Recommended next action',
    },
    interviewerReply: {
      type: 'string' as const,
      description: 'Natural interviewer response to the candidate',
    },
  },
  required: [
    'score',
    'isCorrect',
    'confidence',
    'codeFeedback',
    'communicationFeedback',
    'complexityFeedback',
    'edgeCaseFeedback',
    'hintPenalty',
    'strengths',
    'improvements',
    'nextAction',
    'interviewerReply',
  ],
};

/**
 * Call Gemini Interactions API for answer evaluation with structured JSON output.
 * Uses `store: false` — Redis/Postgres own state, not Gemini.
 *
 * @throws AITransientError on network/timeout/5xx/rate-limit
 * @throws AISchemaError on invalid JSON response
 */
export async function callGeminiForEvaluation(
  prompt: string,
  model: string,
): Promise<Omit<EvaluationResult, 'provider' | 'model' | 'apiMode' | 'store' | 'fallbackUsed'>> {
  const client = getClient();
  const store = shouldStoreGeminiInteractions();

  aiLog('gemini', `Calling evaluation model=${model} store=${store}`);

  try {
    const interaction = await Promise.race([
      client.interactions.create({
        model,
        input: prompt,
        store,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: EVALUATION_JSON_SCHEMA,
        },
      }),
      rejectAfterTimeout(EVALUATION_TIMEOUT_MS),
    ]);

    const text = interaction.output_text;

    if (!text) {
      throw new AITransientError('Gemini returned empty response', 'gemini', model);
    }

    aiLog('gemini', 'Raw evaluation response', text);

    try {
      const parsed = JSON.parse(text);
      return validateEvaluationShape(parsed);
    } catch (parseError) {
      throw new AISchemaError(
        `Failed to parse Gemini evaluation JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        text,
        'gemini',
        model,
      );
    }
  } catch (error) {
    if (error instanceof AITransientError || error instanceof AISchemaError) {
      throw error;
    }
    throw new AITransientError(
      `Gemini evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      'gemini',
      model,
      error,
    );
  }
}

/**
 * Call Gemini Interactions API for interview chat (used as fallback when Groq fails).
 * Returns plain text response.
 * Uses `store: false`.
 *
 * @throws AITransientError on network/timeout/5xx/rate-limit
 */
export async function callGeminiForChat(
  prompt: string,
  model: string,
  systemInstruction?: string,
): Promise<string> {
  const client = getClient();
  const store = shouldStoreGeminiInteractions();

  aiLog('gemini', `Calling chat model=${model} store=${store}`);

  try {
    const interaction = await Promise.race([
      client.interactions.create({
        model,
        input: prompt,
        store,
        ...(systemInstruction ? { system_instruction: systemInstruction } : {}),
      }),
      rejectAfterTimeout(CHAT_TIMEOUT_MS),
    ]);

    const text = interaction.output_text;

    if (!text) {
      throw new AITransientError('Gemini returned empty chat response', 'gemini', model);
    }

    aiLog('gemini', 'Chat response received', { length: text.length });
    return text;
  } catch (error) {
    if (error instanceof AITransientError) throw error;
    throw new AITransientError(
      `Gemini chat failed: ${error instanceof Error ? error.message : String(error)}`,
      'gemini',
      model,
      error,
    );
  }
}

function rejectAfterTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new AITransientError(`Timeout after ${ms}ms`, 'gemini', 'unknown')),
      ms,
    ),
  );
}
