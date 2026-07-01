export type QuestionBankQuestion = {
  sessionQuestionId: string;
  questionBankId: string;
  slug: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyScore: number;
  title: string;
  primaryTopic: string;
  secondaryTopic: string | null;
  description: string;
  examples: string[];
  constraints: string[];
  requiresCode: boolean;
  starterCode: Record<string, string>;
  hints: string[];
};
