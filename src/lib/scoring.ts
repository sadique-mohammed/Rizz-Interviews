export function getExpectedQuestionsCount(duration: number, _difficulty: string): number {
  // 15 mins: 1 question expected (no penalty if they only do 1)
  if (duration <= 15) return 1;
  
  // 30 mins and 45 mins: 3 questions expected
  // (If they do 3 or 4, they won't be penalized because the denominator scales up)
  if (duration <= 45) return 3;

  // Fallback for > 45 mins
  return 4;
}
