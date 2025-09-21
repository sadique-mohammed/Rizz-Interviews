import {
  Domain,
  Difficulty,
  Status,
  Interview,
  Question,
  AnswerAttempt,
} from "@/types/interviewHistory";
import { User } from "@/types/user";
import { Recording } from "@/types/recording";

export const users: User[] = [
  {
    id: "u1",
    name: "Aditi Rao",
    email: "aditi.rao@example.com",
    createdAt: "2025-09-01T09:00:00Z",
    updatedAt: "2025-09-01T09:00:00Z",
    lastSignInAt: "2025-09-21T12:00:00Z",
  },
  {
    id: "u2",
    name: "Brian Ng",
    email: "brian.ng@example.com",
    createdAt: "2025-09-02T10:00:00Z",
    updatedAt: "2025-09-02T10:00:00Z",
    lastSignInAt: "2025-09-21T11:30:00Z",
  },
  {
    id: "u3",
    name: "Carmen Lee",
    email: "carmen.lee@example.com",
    createdAt: "2025-09-03T11:00:00Z",
    updatedAt: "2025-09-03T11:00:00Z",
    lastSignInAt: "2025-09-21T10:45:00Z",
  },
];

export const interviews: Interview[] = [
  {
    id: "i1",
    userId: "u1",
    domain: Domain.DSA,
    difficulty: Difficulty.Easy,
    startedAt: "2025-09-20T10:00:00Z",
    endedAt: "2025-09-20T10:45:00Z",
    duration: 45,
    totalScore: 8,
    status: Status.Completed,
  },
  {
    id: "i2",
    userId: "u2",
    domain: Domain.WebDev,
    difficulty: Difficulty.Medium,
    startedAt: "2025-09-21T12:00:00Z",
    endedAt: null, // ongoing
    duration: 30,
    totalScore: null,
    status: Status.InProgress,
  },
  {
    id: "i3",
    userId: "u3",
    domain: Domain.DSA,
    difficulty: Difficulty.Hard,
    startedAt: "2025-09-19T14:00:00Z",
    endedAt: "2025-09-19T14:50:00Z",
    duration: 50,
    totalScore: 5,
    status: Status.Completed,
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    interviewId: "i1",
    aiQuestion: "Reverse a string.",
    createdAt: "2025-09-20T10:05:00Z",
  },
  {
    id: "q2",
    interviewId: "i2",
    aiQuestion: "Build a React component for a todo list.",
    createdAt: "2025-09-21T12:05:00Z",
  },
];

export const answerAttempts: AnswerAttempt[] = [
  {
    id: "aa1",
    questionId: "q1",
    userId: "u1",
    code: "function reverseStr(s){return s.split('').reverse().join('');}",
    explanation: "Used split, reverse, join.",
    aiFeedback: "Correct and efficient.",
    score: 10,
    createdAt: "2025-09-20T10:15:00Z",
  },
  {
    id: "aa2",
    questionId: "q2",
    userId: "u2",
    explanation: "Tried map but forgot key props",
    aiFeedback: "You need unique keys in list items",
    score: 5,
    createdAt: "2025-09-21T12:10:00Z",
  },
];

export const recordings: Recording[] = [
  {
    id: "r1",
    interviewId: "i1",
    videoUrl: "https://example.com/recordings/i1.mp4",
    transcriptUrl: "https://example.com/recordings/i1_transcript.txt",
    recordingStatus: "completed",
  },
  {
    id: "r2",
    interviewId: "i3",
    videoUrl: "https://example.com/recordings/i3.mp4",
    transcriptUrl: "https://example.com/recordings/i3_transcript.txt",
    recordingStatus: "completed",
  },
  {
    id: "r3",
    interviewId: "i2",
    recordingStatus: "pending",
  },
];
