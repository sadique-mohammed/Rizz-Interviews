import 'server-only';

/**
 * Deterministic mock responses for offline development and flow testing.
 *
 * Active when AI_DEV_MOCK_MODE=true. Allows testing the entire
 * UI/database/Redis flow without external API calls.
 */

import type {
  EvaluationRequest,
  EvaluationResult,
  ChatRequest,
  ChatResponse,
} from './types';

// ---------------------------------------------------------------------------
// Mock evaluation
// ---------------------------------------------------------------------------

/**
 * Returns a deterministic evaluation result for offline testing.
 * Score varies based on code length and hints used to make testing realistic.
 */
export function mockEvaluateAnswer(req: EvaluationRequest): EvaluationResult {
  const { candidate } = req;

  // Simple heuristic: longer code + explanation = higher score
  const codeLength = candidate.code.length;
  const explanationLength = candidate.explanation.length;

  let baseScore = 5; // Start at midpoint
  if (codeLength > 100) baseScore += 1;
  if (codeLength > 300) baseScore += 1;
  if (explanationLength > 50) baseScore += 1;
  if (explanationLength > 150) baseScore += 1;

  // Apply hint penalty
  const hintPenalty = Math.min(candidate.hintsUsed, 3);
  const finalScore = Math.max(0, Math.min(10, baseScore - hintPenalty));

  return {
    score: finalScore,
    isCorrect: finalScore >= 6,
    confidence: finalScore >= 7 ? 'high' : finalScore >= 4 ? 'medium' : 'low',
    codeFeedback:
      codeLength > 100
        ? 'Your code demonstrates a reasonable approach to the problem. Consider edge cases more carefully.'
        : 'Your code is quite short. Make sure you have handled all cases described in the problem.',
    communicationFeedback:
      explanationLength > 100
        ? 'Good explanation — you clearly communicated your thought process.'
        : 'Try to explain your approach in more detail, including why you chose this strategy.',
    complexityFeedback:
      'Consider the time and space complexity of your solution. Can you optimize further?',
    edgeCaseFeedback:
      'Think about edge cases such as empty inputs, single-element arrays, or very large inputs.',
    hintPenalty,
    strengths: [
      'Demonstrated understanding of the problem requirements',
      'Provided working code structure',
    ],
    improvements: [
      'Add more thorough edge case handling',
      'Discuss time and space complexity explicitly',
      'Consider alternative approaches for optimization',
    ],
    nextAction: finalScore >= 7 ? 'harder' : finalScore >= 4 ? 'follow_up' : 'same_topic',
    interviewerReply:
      finalScore >= 7
        ? 'Solid work. Let me give you something more challenging next.'
        : finalScore >= 4
          ? "That's a decent start. Let me ask a follow-up to dig deeper into your approach."
          : "I think there's room to improve here. Let's work through this problem a bit more.",
    provider: 'mock',
    model: 'mock-evaluator',
    apiMode: 'mock',
    store: false,
    fallbackUsed: false,
  };
}

// ---------------------------------------------------------------------------
// Mock chat
// ---------------------------------------------------------------------------

/** Deterministic mock responses keyed by message type. */
const MOCK_RESPONSES: Record<string, string> = {
  hint: "Here's something to think about: consider what data structure would let you look up values in constant time.",
  clarification:
    "Good question. The input will always be a valid array of integers. You don't need to handle non-numeric inputs.",
  stuck:
    "Let's take a step back. What's the brute force approach? Sometimes starting simple helps you see the optimization.",
  default:
    "Good thinking. Before coding, can you walk me through your approach step by step? What's the key insight here?",
  solution_request:
    "I can't give you the solution directly, but I can help guide you. What part are you struggling with?",
};

/**
 * Returns a deterministic chat response for offline testing.
 */
export function mockInterviewChat(req: ChatRequest): ChatResponse {
  const msg = req.userMessage.toLowerCase();

  let reply: string;
  let newHintIndex: number | undefined;

  if (req.isHintRequest) {
    if (req.hintState.hintIndex < req.hintState.totalHints) {
      const hint = req.questionContext.hints[req.hintState.hintIndex];
      reply = `Here's a hint: ${hint}`;
      newHintIndex = req.hintState.hintIndex + 1;
    } else {
      reply = "You've used all available hints. Try to work through the rest on your own — you've got this.";
    }
  } else if (msg.includes('solution') || msg.includes('answer') || msg.includes('tell me')) {
    reply = MOCK_RESPONSES.solution_request;
  } else if (msg.includes('clarif') || msg.includes('constraint') || msg.includes('input')) {
    reply = MOCK_RESPONSES.clarification;
  } else if (msg.includes('stuck') || msg.includes('help') || msg.includes("don't know")) {
    reply = MOCK_RESPONSES.stuck;
  } else {
    reply = MOCK_RESPONSES.default;
  }

  return {
    reply,
    provider: 'mock',
    model: 'mock-interviewer',
    apiMode: 'mock',
    fallbackUsed: false,
    ...(newHintIndex !== undefined ? { newHintIndex } : {}),
  };
}
