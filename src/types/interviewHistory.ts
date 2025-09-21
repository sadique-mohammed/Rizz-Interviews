export enum Domain {
  DSA = "DSA",
  WebDev = "Web Dev",
}

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum Status {
  InProgress = "in_progress",
  Completed = "completed",
}
export enum Sender {
  Candidate = "candidate",
  Interviewer = "interviewer",
}

export interface Interview {
  id: string;
  userId: string;
  domain: Domain;
  difficulty: Difficulty;
  startedAt: string;
  endedAt: string | null; // null for ongoing interview
  duration: number; // in minutes
  score: number | null; // null until completed; total score
  status: Status;
}

export interface Question {
  id: string;
  interviewId: string;
  aiQuestion: string;
  createdAt: string;
}

export interface AnswerAttempt {
  id: string;
  questionId: string;
  userId: string;
  code?: string; // nullable for theoretical questions
  explanation?: string;
  totalAttempts: number; // 1, 2, 3...
  aiFeedback?: string;
  score: number; // 0-10 points
  createdAt: string;
}

export interface Conversation {
  id: string;
  attemptId: string; // answer_attempts.id
  sender: Sender;
  message: string;
  createdAt: string;
}
