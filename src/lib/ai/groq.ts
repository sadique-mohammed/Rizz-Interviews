import 'server-only';

import Groq from 'groq-sdk';
import {
  getGroqApiKey,
  EVALUATION_TIMEOUT_MS,
  CHAT_TIMEOUT_MS,
  aiLog,
} from './config';
import { AITransientError, AISchemaError } from './types';
import type { EvaluationResult } from './types';
import { validateEvaluationShape } from './validation';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: Groq | null = null;

function getClient(): Groq {
  if (!_client) {
    _client = new Groq({ apiKey: getGroqApiKey() });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Groq — Chat (primary for interview conversation)
// ---------------------------------------------------------------------------

/**
 * Call Groq for interview chat. Returns plain text response.
 *
 * @throws AITransientError on network/timeout/429/5xx/empty response
 */
export async function callGroqForChat(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<string> {
  const client = getClient();

  aiLog('groq', `Calling chat model=${model}`);

  try {
    const response = await Promise.race([
      client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
      rejectAfterTimeout(CHAT_TIMEOUT_MS, model),
    ]);

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new AITransientError(
        'Groq returned empty chat response',
        'groq',
        model,
      );
    }

    aiLog('groq', 'Chat response received', { length: text.length });
    return text;
  } catch (error) {
    if (error instanceof AITransientError) throw error;

    // Check for rate-limit or server errors
    if (isGroqTransientError(error)) {
      throw new AITransientError(
        `Groq chat rate-limited or server error: ${error instanceof Error ? error.message : String(error)}`,
        'groq',
        model,
        error,
      );
    }

    throw new AITransientError(
      `Groq chat failed: ${error instanceof Error ? error.message : String(error)}`,
      'groq',
      model,
      error,
    );
  }
}

// ---------------------------------------------------------------------------
// Groq — Evaluation (fallback for Gemini)
// ---------------------------------------------------------------------------

/**
 * Call Groq for answer evaluation. Expects JSON response.
 *
 * @throws AITransientError on network/timeout/429/5xx
 * @throws AISchemaError on invalid JSON
 */
export async function callGroqForEvaluation(
  prompt: string,
  model: string,
): Promise<Omit<EvaluationResult, 'provider' | 'model' | 'apiMode' | 'store' | 'fallbackUsed'>> {
  const client = getClient();

  aiLog('groq', `Calling evaluation model=${model}`);

  try {
    const response = await Promise.race([
      client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer evaluating a mock interview candidate. Return strict JSON only. Do not include any text outside the JSON object.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
      rejectAfterTimeout(EVALUATION_TIMEOUT_MS, model),
    ]);

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new AITransientError(
        'Groq returned empty evaluation response',
        'groq',
        model,
      );
    }

    aiLog('groq', 'Raw evaluation response', text);

    try {
      const parsed = JSON.parse(text);
      return validateEvaluationShape(parsed);
    } catch (parseError) {
      throw new AISchemaError(
        `Failed to parse Groq evaluation JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        text,
        'groq',
        model,
      );
    }
  } catch (error) {
    if (error instanceof AITransientError || error instanceof AISchemaError) {
      throw error;
    }

    if (isGroqTransientError(error)) {
      throw new AITransientError(
        `Groq evaluation rate-limited or server error: ${error instanceof Error ? error.message : String(error)}`,
        'groq',
        model,
        error,
      );
    }

    throw new AITransientError(
      `Groq evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      'groq',
      model,
      error,
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rejectAfterTimeout(ms: number, model: string): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new AITransientError(`Timeout after ${ms}ms`, 'groq', model)), ms),
  );
}

/**
 * Detect Groq transient errors eligible for fallback:
 * HTTP 429 (rate limit), 5xx (server errors), network failures.
 */
function isGroqTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  // Groq SDK wraps HTTP errors with a status property
  const status = (error as { status?: number }).status;
  if (status === 429 || (status && status >= 500)) return true;

  // Network errors
  const code = (error as { code?: string }).code;
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') return true;

  return false;
}


