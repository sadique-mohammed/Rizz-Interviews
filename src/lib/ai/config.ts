import 'server-only';

/**
 * AI model configuration.
 *
 * Reads all AI_* env vars and provides centralized config for evaluation
 * and chat model roles, including fallback order, timeouts, and dev controls.
 *
 * Model IDs are configurable through env vars so code does not need edits
 * when providers rotate model availability.
 */

export type AIProvider = 'gemini' | 'groq' | 'mock';
export type GeminiApiMode = 'interactions';

export interface ModelConfig {
  provider: AIProvider;
  model: string;
}

export interface FallbackModelConfig extends ModelConfig {
  raw: string;
}

export const EVALUATION_TIMEOUT_MS = 20_000;
export const CHAT_TIMEOUT_MS = 8_000;

function envOrDefault(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const val = process.env[key];
  if (!val) return fallback;
  return val === 'true' || val === '1';
}

export function isMockMode(): boolean {
  return envBool('AI_DEV_MOCK_MODE', false);
}

export function isForceFailure(): boolean {
  return envBool('AI_FORCE_MODEL_FAILURE', false);
}

export function isVerboseLogging(): boolean {
  return envBool('AI_DEV_VERBOSE_LOGS', false);
}

export function getGeminiApiMode(): GeminiApiMode {
  return 'interactions';
}

export function shouldStoreGeminiInteractions(): boolean {
  return envBool('AI_GEMINI_STORE_INTERACTIONS', false);
}

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('[ai/config] GEMINI_API_KEY is not set');
  return key;
}

export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('[ai/config] GROQ_API_KEY is not set');
  return key;
}

export function getEvaluationConfig(): {
  primary: ModelConfig;
  fallbacks: FallbackModelConfig[];
} {
  const provider = envOrDefault('AI_EVALUATION_PROVIDER', 'gemini') as AIProvider;
  const model = envOrDefault('AI_EVALUATION_MODEL', 'gemini-3.1-flash-lite');

  const fallbacksRaw = envOrDefault(
    'AI_EVALUATION_FALLBACK_MODELS',
    'gemini-2.5-flash-lite,groq:openai/gpt-oss-20b',
  );

  return {
    primary: { provider, model },
    fallbacks: parseFallbackModels(fallbacksRaw),
  };
}

export function getChatConfig(): {
  primary: ModelConfig;
  fallbacks: FallbackModelConfig[];
} {
  const provider = envOrDefault('AI_CHAT_PROVIDER', 'groq') as AIProvider;
  const model = envOrDefault('AI_CHAT_MODEL', 'openai/gpt-oss-120b');

  const fallbacksRaw = envOrDefault(
    'AI_CHAT_FALLBACK_MODELS',
    'groq:openai/gpt-oss-20b,gemini:gemini-3.1-flash-lite',
  );

  return {
    primary: { provider, model },
    fallbacks: parseFallbackModels(fallbacksRaw),
  };
}

/**
 * Parse comma-separated fallback model strings.
 * Format: "provider:model" or just "model" (inherits primary provider).
 *
 * Examples:
 *   "gemini-2.5-flash-lite"       → { provider: 'gemini', model: 'gemini-2.5-flash-lite' }
 *   "groq:openai/gpt-oss-20b"    → { provider: 'groq',  model: 'openai/gpt-oss-20b' }
 */
function parseFallbackModels(raw: string): FallbackModelConfig[] {
  if (!raw.trim()) return [];

  return raw.split(',').map((entry) => {
    const trimmed = entry.trim();
    const colonIndex = trimmed.indexOf(':');

    if (colonIndex > 0) {
      return {
        provider: trimmed.slice(0, colonIndex) as AIProvider,
        model: trimmed.slice(colonIndex + 1),
        raw: trimmed,
      };
    }

    return {
      provider: 'gemini' as AIProvider,
      model: trimmed,
      raw: trimmed,
    };
  });
}

export function aiLog(component: string, message: string, data?: unknown): void {
  if (!isVerboseLogging()) return;
  const prefix = `[ai/${component}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
