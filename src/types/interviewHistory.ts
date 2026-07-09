export enum Domain {
  DSA = 'DSA',
  WebDev = 'Web Dev',
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum Status {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export interface Interview {
  id: string;
  userId: string; // clerk_id
  domain: Domain;
  difficulty: Difficulty;
  startedAt: string;
  endedAt: string | null; // null while in-progress
  duration: number; // in minutes
  totalScore: number | null; // null until completed
  status: Status;
}
