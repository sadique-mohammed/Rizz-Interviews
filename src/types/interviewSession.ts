export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface SessionTiming {
  startedAt: Date | string;
  duration: number; // in minutes
}

export interface ActiveSessionRecord extends SessionTiming {
  id: string;
  domain: string;
  difficulty: string;
  status: string | null;
}

export interface InterviewSessionRecord extends SessionTiming {
  id: string;
  domain: string;
  difficulty: string;
  status: string | null;
}
