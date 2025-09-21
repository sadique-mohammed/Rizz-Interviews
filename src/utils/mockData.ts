import {
  Domain,
  Difficulty,
  Status,
  Interview,
  Question,
  AnswerAttempt,
  Conversation,
  Sender,
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
  {
    id: "u4",
    name: "Deepak Kumar",
    email: "deepak.k@example.com",
    createdAt: "2025-09-04T08:00:00Z",
    updatedAt: "2025-09-04T08:00:00Z",
    lastSignInAt: "2025-09-21T09:50:00Z",
  },
  {
    id: "u5",
    name: "Elena Garcia",
    email: "elena.garcia@example.com",
    createdAt: "2025-09-05T14:00:00Z",
    updatedAt: "2025-09-05T14:00:00Z",
    lastSignInAt: "2025-09-21T08:30:00Z",
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
    score: 8,
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
    score: null,
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
    score: 5,
    status: Status.Completed,
  },
  {
    id: "i4",
    userId: "u4",
    domain: Domain.WebDev,
    difficulty: Difficulty.Easy,
    startedAt: "2025-09-21T09:30:00Z",
    endedAt: null,
    duration: 20,
    score: null,
    status: Status.InProgress,
  },
  {
    id: "i5",
    userId: "u5",
    domain: Domain.DSA,
    difficulty: Difficulty.Medium,
    startedAt: "2025-09-18T15:00:00Z",
    endedAt: "2025-09-18T15:45:00Z",
    duration: 45,
    score: 9,
    status: Status.Completed,
  },
];

// Questions, AnswerAttempts, Conversations, Recordings follow similarly...
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
    totalAttempts: 1,
    aiFeedback: "Correct and efficient.",
    score: 10,
    createdAt: "2025-09-20T10:15:00Z",
  },
  {
    id: "aa2",
    questionId: "q2",
    userId: "u2",
    totalAttempts: 3,
    explanation: "Tried map but forgot key props",
    aiFeedback: "You need unique keys in list items",
    score: 5,
    createdAt: "2025-09-21T12:10:00Z",
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    attemptId: "aa2",
    sender: Sender.Candidate,
    message: "I tried mapping items but keys missing?",
    createdAt: "2025-09-21T12:11:00Z",
  },
  {
    id: "c2",
    attemptId: "aa2",
    sender: Sender.Interviewer,
    message: "Correct, keys are required to avoid warnings.",
    createdAt: "2025-09-21T12:12:00Z",
  },
];
