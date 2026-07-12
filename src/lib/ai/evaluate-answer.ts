import 'server-only';

import { getEvaluationConfig, isMockMode, isForceFailure, aiLog } from './config';
import { callGeminiForEvaluation } from './gemini';
import { callGroqForEvaluation } from './groq';
import { mockEvaluateAnswer } from './mock';
import { AITransientError, AISchemaError } from './types';
import type { EvaluationRequest, EvaluationResult } from './types';

function buildEvaluationPrompt(req: EvaluationRequest): string {
  const { question: q, candidate: c } = req;

  const solutionForLang =
    c.language && q.optimalSolution[c.language]
      ? q.optimalSolution[c.language]
      : Object.values(q.optimalSolution)[0] || 'No optimal solution available';

  return `You are a senior software engineer conducting a mock technical interview.

You must evaluate the candidate's submitted code and explanation.
There is no code execution in this product version, so be explicit about uncertainty.
Do not reveal the optimal solution.
Do not provide a full corrected solution unless the session is already ended.
This call is stateless from the application perspective. The request includes all required context. Do not assume prior turns unless they are included in this prompt.
CRITICAL: Do NOT mention or suggest any specific follow-up problem names in your interviewerReply (e.g., do not say "Let's move on to Meeting Rooms" or "Are you familiar with Counting Bits"). The system will automatically select the next question independently. Simply provide feedback on the current submission and state that you are moving on to the next question.

Question:
- Title: ${q.title}
- Description: ${q.description}
- Examples: ${q.examples.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}
- Constraints: ${q.constraints.map((c) => `  - ${c}`).join('\n')}
- Domain: ${q.domain}
- Difficulty: ${q.difficulty}

Reference Material:
- Optimal solution for ${c.language || 'default language'}:
\`\`\`
${solutionForLang}
\`\`\`
- Official time complexity: ${q.timeComplexity}
- Official space complexity: ${q.spaceComplexity}
- Interviewer notes: ${q.interviewerNotes}

Candidate Submission:
- Language: ${c.language || 'Not specified'}
- Code:
\`\`\`${c.language || ''}
${c.code}
\`\`\`
- Explanation: ${c.explanation}
- Hints used: ${c.hintsUsed}
${c.timeSpentSeconds ? `- Time spent: ${Math.round(c.timeSpentSeconds / 60)} minutes` : ''}

Scoring:
- Correctness: 0-4
- Complexity understanding: 0-2
- Edge cases: 0-1
- Communication clarity: 0-2
- Interview readiness: 0-1
- Apply hint penalty after subtotal, but never below 0

Return strict JSON only matching this schema:
{
  "score": <0-10 integer>,
  "isCorrect": <boolean>,
  "confidence": <"low" | "medium" | "high">,
  "codeFeedback": <string>,
  "communicationFeedback": <string>,
  "complexityFeedback": <string>,
  "edgeCaseFeedback": <string>,
  "hintPenalty": <0-3 integer>,
  "strengths": [<string>],
  "improvements": [<string>],
  "nextAction": <"follow_up" | "same_topic" | "harder" | "easier" | "end_interview">,
  "interviewerReply": <string>
}`;
}

/**
 * Evaluate a candidate's answer submission.
 *
 * Fallback order:
 *   1. Gemini primary (gemini-3.1-flash-lite via Interactions API)
 *   2. Gemini fallback (gemini-2.5-flash-lite via Interactions API)
 *   3. Groq fallback (openai/gpt-oss-20b)
 *
 * Returns the full EvaluationResult with provider metadata.
 * Throws if all models fail (caller should handle gracefully).
 */
export async function evaluateAnswer(req: EvaluationRequest): Promise<EvaluationResult> {
  if (isMockMode()) {
    aiLog('evaluate', 'Using mock mode');
    return mockEvaluateAnswer(req);
  }

  const config = getEvaluationConfig();
  const prompt = buildEvaluationPrompt(req);
  const errors: Error[] = [];

  const attempts: Array<{
    provider: 'gemini' | 'groq';
    model: string;
    isFallback: boolean;
  }> = [
    {
      provider: config.primary.provider as 'gemini' | 'groq',
      model: config.primary.model,
      isFallback: false,
    },
    ...config.fallbacks.map((f) => ({
      provider: f.provider as 'gemini' | 'groq',
      model: f.model,
      isFallback: true,
    })),
  ];

  const startIndex = isForceFailure() ? 1 : 0;

  for (let i = startIndex; i < attempts.length; i++) {
    const attempt = attempts[i];
    const isFallback = i > 0;

    try {
      aiLog(
        'evaluate',
        `Attempt ${i + 1}/${attempts.length}: ${attempt.provider}/${attempt.model}`,
      );

      let result: Omit<
        EvaluationResult,
        'provider' | 'model' | 'apiMode' | 'store' | 'fallbackUsed'
      >;

      if (attempt.provider === 'gemini') {
        result = await callGeminiForEvaluation(prompt, attempt.model);
        return {
          ...result,
          provider: 'gemini',
          model: attempt.model,
          apiMode: 'interactions',
          store: false,
          fallbackUsed: isFallback,
        };
      } else {
        result = await callGroqForEvaluation(prompt, attempt.model);
        return {
          ...result,
          provider: 'groq',
          model: attempt.model,
          apiMode: 'groq-chat',
          store: false,
          fallbackUsed: isFallback,
        };
      }
    } catch (error) {
      const isTransient = error instanceof AITransientError || error instanceof AISchemaError;
      aiLog(
        'evaluate',
        `Attempt ${i + 1} failed (transient=${isTransient}): ${error instanceof Error ? error.message : String(error)}`,
      );

      if (isTransient) {
        errors.push(error);
        continue; // Try next fallback
      }

      throw error;
    }
  }

  const errorSummary = errors.map((e) => e.message).join('; ');
  throw new Error(`[evaluate-answer] All evaluation models failed. Errors: ${errorSummary}`);
}
