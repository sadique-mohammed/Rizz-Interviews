import 'server-only';

import {
  getChatConfig,
  isMockMode,
  isForceFailure,
  aiLog,
} from './config';
import { callGroqForChat } from './groq';
import { callGeminiForChat } from './gemini';
import { mockInterviewChat } from './mock';
import { AITransientError } from './types';
import type { ChatRequest, ChatResponse } from './types';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const INTERVIEWER_SYSTEM_PROMPT = `You are a senior software engineer conducting a mock technical interview. You are the interviewer.

Rules:
- Ask one thing at a time.
- Keep replies short enough for voice — 2-3 sentences max.
- Do not reveal the optimal solution or provide a full corrected solution.
- If the user asks for a hint, use ONLY the specific hint provided in the context. Do not invent additional hints.
- If the user is stuck, ask a guiding question rather than giving the answer.
- If the user submits an answer, do not score it in chat. Scoring happens separately.
- Use the current question's topic and difficulty to calibrate responses.
- Be encouraging but honest. Act like a real interviewer, not a tutor.
- Do not break character. You are the interviewer, not an AI assistant.
- CRITICAL: Do not ask endless theoretical questions. Once the user has adequately explained a sound approach, explicitly tell them to write their implementation in the code editor and click the "Submit Code" button to proceed.`;

// ---------------------------------------------------------------------------
// Chat prompt builder
// ---------------------------------------------------------------------------

function buildChatPrompt(req: ChatRequest): string {
  const { questionContext: q, transcriptWindow, hintState } = req;

  let prompt = `Current Question:
- Title: ${q.title}
- Description: ${q.description}
- Domain: ${q.domain}
- Difficulty: ${q.difficulty}
- Constraints: ${q.constraints.join(', ')}

Hint State: ${hintState.hintsUsed}/${hintState.totalHints} hints used`;

  // Add transcript summary if available
  if (transcriptWindow.summary) {
    prompt += `\n\nConversation Summary:\n${transcriptWindow.summary}`;
  }

  // Add recent messages
  if (transcriptWindow.recentMessages.length > 0) {
    prompt += '\n\nRecent Conversation:';
    for (const msg of transcriptWindow.recentMessages) {
      const label = msg.role === 'user' ? 'Candidate' : msg.role === 'ai' ? 'Interviewer' : 'System';
      prompt += `\n${label}: ${msg.text}`;
    }
  }

  // Handle hint requests specifically
  if (req.isHintRequest) {
    if (hintState.hintIndex < hintState.totalHints) {
      const nextHint = q.hints[hintState.hintIndex];
      prompt += `\n\nThe candidate is asking for a hint. Provide ONLY this hint, lightly rephrased in a natural conversational tone. Do not add any additional hints or reveal more information than this single hint contains.

Hint to provide: "${nextHint}"`;
    } else {
      prompt += `\n\nThe candidate is asking for a hint, but all ${hintState.totalHints} hints have been used. Politely let them know no more hints are available, and ask a guiding question instead.`;
    }
  }

  prompt += `\n\nCandidate's latest message: ${req.userMessage}`;

  return prompt;
}

// ---------------------------------------------------------------------------
// Chat orchestration
// ---------------------------------------------------------------------------

/**
 * Generate an interview chat response.
 *
 * Fallback order:
 *   1. Groq primary (openai/gpt-oss-120b)
 *   2. Groq fallback (openai/gpt-oss-20b)
 *   3. Gemini fallback (gemini-3.1-flash-lite via Interactions API, store=false)
 *
 * If all models fail, returns a safe local fallback message.
 */
export async function generateInterviewChat(req: ChatRequest): Promise<ChatResponse> {
  // Dev mock mode
  if (isMockMode()) {
    aiLog('chat', 'Using mock mode');
    return mockInterviewChat(req);
  }

  const config = getChatConfig();
  const chatPrompt = buildChatPrompt(req);
  const errors: Error[] = [];

  // Build attempt list
  const attempts: Array<{
    provider: 'gemini' | 'groq';
    model: string;
  }> = [
    { provider: config.primary.provider as 'gemini' | 'groq', model: config.primary.model },
    ...config.fallbacks.map((f) => ({
      provider: f.provider as 'gemini' | 'groq',
      model: f.model,
    })),
  ];

  // If force-failure mode, skip the primary
  const startIndex = isForceFailure() ? 1 : 0;

  for (let i = startIndex; i < attempts.length; i++) {
    const attempt = attempts[i];
    const isFallback = i > 0;

    try {
      aiLog('chat', `Attempt ${i + 1}/${attempts.length}: ${attempt.provider}/${attempt.model}`);

      let reply: string;

      if (attempt.provider === 'groq') {
        reply = await callGroqForChat(INTERVIEWER_SYSTEM_PROMPT, chatPrompt, attempt.model);
      } else {
        reply = await callGeminiForChat(chatPrompt, attempt.model, INTERVIEWER_SYSTEM_PROMPT);
      }

      const response: ChatResponse = {
        reply,
        provider: attempt.provider,
        model: attempt.model,
        apiMode: attempt.provider === 'gemini' ? 'interactions' : 'groq-chat',
        fallbackUsed: isFallback,
      };

      // If this was a hint request and a hint was available, include updated index
      if (req.isHintRequest && req.hintState.hintIndex < req.hintState.totalHints) {
        response.newHintIndex = req.hintState.hintIndex + 1;
      }

      return response;
    } catch (error) {
      const isTransient = error instanceof AITransientError;
      aiLog('chat', `Attempt ${i + 1} failed (transient=${isTransient}): ${error instanceof Error ? error.message : String(error)}`);

      if (isTransient) {
        errors.push(error);
        continue;
      }

      // Non-transient — don't fallback, but for chat we still return a safe message
      break;
    }
  }

  // All models failed — return safe local fallback
  aiLog('chat', 'All chat models failed, returning safe fallback');

  const safeFallback: ChatResponse = {
    reply: "I'm having a moment — could you repeat that or continue with your approach? I want to make sure I give you a thoughtful response.",
    provider: 'mock',
    model: 'local-fallback',
    apiMode: 'mock',
    fallbackUsed: true,
  };

  if (req.isHintRequest && req.hintState.hintIndex < req.hintState.totalHints) {
    // Still dispense the hint even if AI formatting failed
    const hint = req.questionContext.hints[req.hintState.hintIndex];
    safeFallback.reply = `Here's a hint: ${hint}`;
    safeFallback.newHintIndex = req.hintState.hintIndex + 1;
  }

  return safeFallback;
}
