import 'server-only';

import { getChatConfig, isMockMode, isForceFailure, aiLog } from './config';
import { callGroqForChat } from './groq';
import { callGeminiForChat } from './gemini';
import { mockInterviewChat } from './mock';
import { AITransientError } from './types';
import type { ChatRequest, ChatResponse } from './types';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const INTERVIEWER_SYSTEM_PROMPT = `You are a senior software engineer running a mock technical interview. You are the interviewer, not a tutor and not a chatbot.

If this is the candidate's first message, greet them, ease them in with one human sentence, and give a one-line rundown of the format before introducing the question.

For every reply:
- Ask one thing at a time.
- Keep it short for voice — 2-3 sentences — but short isn't the same as cold. React to what the candidate actually said before moving on: a quick "good, that covers the edge case" or "hold on, walk me through why that's O(n log n)" before your next question. Don't just fire question after question with nothing in between.
- Do not reveal the optimal solution or provide a full corrected solution.
- If the candidate asks for a hint, use ONLY the specific hint provided in the context. Do not invent additional hints.
- If the candidate is stuck, ask a guiding question rather than giving the answer.
- If the candidate submits an answer, do not score it in chat. Scoring happens separately.
- Use the current question's topic and difficulty to calibrate your tone and follow-ups.
- Be encouraging but honest — acknowledge what's working, push back on what isn't. Don't inflate a weak answer to be nice.
- Do not break character. You are the interviewer, not an AI assistant.
- CRITICAL: Do not ask endless theoretical questions. Once the candidate has adequately explained a sound approach, tell them clearly to write their implementation in the code editor and click "Submit Code."`;

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
      const label =
        msg.role === 'user' ? 'Candidate' : msg.role === 'ai' ? 'Interviewer' : 'System';
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

  // If the conversation is just starting, remind the AI to introduce the problem
  if (transcriptWindow.recentMessages.length <= 2) {
    prompt += `\n\nCRITICAL INSTRUCTION: If you have not yet introduced the coding problem to the candidate, you MUST seamlessly transition from the current small talk/greeting into introducing the coding problem now. Introduce the problem BY ITS TITLE ONLY IN BOLD TEXT. Do NOT explain the problem description or logic (the candidate can read it on their screen). Explicitly ask them to walk you through their initial thoughts/approach before they write any code.`;
  }

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
      aiLog(
        'chat',
        `Attempt ${i + 1} failed (transient=${isTransient}): ${error instanceof Error ? error.message : String(error)}`,
      );

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
    reply:
      "I'm having a moment — could you repeat that or continue with your approach? I want to make sure I give you a thoughtful response.",
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

// ---------------------------------------------------------------------------
// Dynamic Openers and Transitions
// ---------------------------------------------------------------------------

export async function generateGreeting(candidateName: string = 'the candidate'): Promise<string> {
  const interviewerNames = [
    'Alex',
    'Sam',
    'Jordan',
    'Taylor',
    'Casey',
    'Riley',
    'Morgan',
    'Avery',
    'Drew',
    'Harper',
  ];
  const interviewerRoles = [
    'backend services',
    'infrastructure',
    'frontend architecture',
    'core platform',
    'machine learning',
    'payments',
    'search and discovery',
  ];

  const randomName = interviewerNames[Math.floor(Math.random() * interviewerNames.length)];
  const randomRole = interviewerRoles[Math.floor(Math.random() * interviewerRoles.length)];

  const systemPrompt = `You are a senior software engineer at a top tech company conducting a mock interview. The candidate, ${candidateName}, has just joined the room. Write a short, friendly opening message introducing yourself (your name is ${randomName} from the ${randomRole} team), welcome the candidate (by name if provided), and ask how they are doing or if they are ready to begin. 

CRITICAL: Do NOT introduce the coding problem yet. Keep it to 2-3 sentences max. Be conversational and human.`;

  const config = getChatConfig();

  try {
    if (config.primary.provider === 'groq') {
      return await callGroqForChat(
        systemPrompt,
        'The candidate just joined. Greet them.',
        config.primary.model,
      );
    } else {
      return await callGeminiForChat(
        'The candidate just joined. Greet them.',
        config.primary.model,
        systemPrompt,
      );
    }
  } catch (error) {
    aiLog('chat', `Failed to generate dynamic greeting: ${error}`);
    return "Hi there! I'm Alex, one of the engineers here. Welcome to your mock interview! Are you ready to dive in?";
  }
}

export async function generateTransition(nextQuestionTitle: string): Promise<string> {
  const systemPrompt = `You are a senior software engineer conducting a mock interview. The candidate just finished a problem and you are moving to the next one. Write a short, encouraging transition message. Tell them you're moving on, and introduce the next problem by its title. Ask them to walk you through their initial thoughts.
  
Next problem title: ${nextQuestionTitle}

CRITICAL: Keep it to 2-3 sentences. Be conversational and human. Do NOT explain the problem description or logic. Just mention the title and ask them to walk you through their first instincts before they start coding.`;

  const config = getChatConfig();

  try {
    if (config.primary.provider === 'groq') {
      return await callGroqForChat(
        systemPrompt,
        'Introduce the next problem.',
        config.primary.model,
      );
    } else {
      return await callGeminiForChat(
        'Introduce the next problem.',
        config.primary.model,
        systemPrompt,
      );
    }
  } catch (error) {
    aiLog('chat', `Failed to generate dynamic transition: ${error}`);
    return `Great work on that one! Let's move on to the next question: ${nextQuestionTitle}. Walk me through your first instincts.`;
  }
}
