export function getExpectedQuestionsCount(duration: number, _difficulty: string): number {
  if (duration <= 15) return 1;

  if (duration <= 45) return 3;

  return 4;
}
