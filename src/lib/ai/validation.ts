import type { EvaluationResult } from './types';

/**
 * Validate that the parsed JSON matches the EvaluationResult shape.
 * Applies safe defaults for missing optional fields.
 */
export function validateEvaluationShape(
  data: Record<string, unknown>,
): Omit<EvaluationResult, 'provider' | 'model' | 'apiMode' | 'store' | 'fallbackUsed'> {
  const score =
    typeof data.score === 'number' ? Math.max(0, Math.min(10, Math.round(data.score))) : 0;
  const hintPenalty =
    typeof data.hintPenalty === 'number'
      ? Math.max(0, Math.min(3, Math.round(data.hintPenalty)))
      : 0;

  return {
    score,
    isCorrect: data.isCorrect === true,
    confidence: validateEnum(data.confidence, ['low', 'medium', 'high'], 'medium'),
    codeFeedback: String(data.codeFeedback || 'No code feedback available.'),
    communicationFeedback: String(
      data.communicationFeedback || 'No communication feedback available.',
    ),
    complexityFeedback: String(data.complexityFeedback || 'No complexity feedback available.'),
    edgeCaseFeedback: String(data.edgeCaseFeedback || 'No edge case feedback available.'),
    hintPenalty,
    strengths: Array.isArray(data.strengths)
      ? data.strengths.filter((s): s is string => typeof s === 'string')
      : [],
    improvements: Array.isArray(data.improvements)
      ? data.improvements.filter((s): s is string => typeof s === 'string')
      : [],
    nextAction: validateEnum(
      data.nextAction,
      ['follow_up', 'same_topic', 'harder', 'easier', 'end_interview'],
      'same_topic',
    ),
    interviewerReply: String(data.interviewerReply || 'Thank you for your submission.'),
  };
}

export function validateEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  if (typeof value === 'string' && allowed.includes(value as T)) return value as T;
  return fallback;
}
