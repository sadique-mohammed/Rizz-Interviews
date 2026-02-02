import {
  Domain,
  Difficulty,
  Status,
  Interview,
  Question,
  AnswerAttempt,
} from '@/types/interviewHistory';
import { User } from '@/types/user';
import { Recording } from '@/types/recording';

export const users: User[] = [
  {
    id: 'user_mock_aditi_rao_001',
    name: 'Aditi Rao',
    email: 'aditi.rao@example.com',
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z',
    lastSignInAt: '2025-09-21T12:00:00Z',
  },
  {
    id: 'user_mock_brian_ng_002',
    name: 'Brian Ng',
    email: 'brian.ng@example.com',
    createdAt: '2025-09-02T10:00:00Z',
    updatedAt: '2025-09-02T10:00:00Z',
    lastSignInAt: '2025-09-21T11:30:00Z',
  },
  {
    id: 'user_mock_carmen_lee_003',
    name: 'Carmen Lee',
    email: 'carmen.lee@example.com',
    createdAt: '2025-09-03T11:00:00Z',
    updatedAt: '2025-09-03T11:00:00Z',
    lastSignInAt: '2025-09-21T10:45:00Z',
  },
  {
    id: 'user_mock_david_kim_004',
    name: 'David Kim',
    email: 'david.kim@example.com',
    createdAt: '2025-09-04T12:00:00Z',
    updatedAt: '2025-09-04T12:00:00Z',
    lastSignInAt: '2025-09-21T09:30:00Z',
  },
];
export const recordings: Recording[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    interviewId: '550e8400-e29b-41d4-a716-446655440010',
    videoUrl: 'https://example.com/recordings/i1.mp4',
    transcriptUrl: 'https://example.com/recordings/i1_transcript.txt',
    recordingStatus: 'completed',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    interviewId: '550e8400-e29b-41d4-a716-446655440012',
    videoUrl: 'https://example.com/recordings/i3.mp4',
    transcriptUrl: 'https://example.com/recordings/i3_transcript.txt',
    recordingStatus: 'completed',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    interviewId: '550e8400-e29b-41d4-a716-446655440011',
    recordingStatus: 'pending',
  },
];

// ...existing code...

export const interviews: Interview[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    userId: 'user_mock_aditi_rao_001',
    domain: Domain.DSA,
    difficulty: Difficulty.Easy,
    startedAt: '2025-09-20T10:00:00Z',
    endedAt: '2025-09-20T10:45:00Z',
    duration: 45,
    totalScore: 81,
    status: Status.Completed,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    userId: 'user_mock_brian_ng_002',
    domain: Domain.WebDev,
    difficulty: Difficulty.Medium,
    startedAt: '2025-09-21T12:00:00Z',
    endedAt: null, // ongoing
    duration: 30,
    totalScore: null,
    status: Status.InProgress,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    userId: 'user_mock_carmen_lee_003',
    domain: Domain.DSA,
    difficulty: Difficulty.Hard,
    startedAt: '2025-09-19T14:00:00Z',
    endedAt: '2025-09-19T14:50:00Z',
    duration: 50,
    totalScore: 75,
    status: Status.Completed,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    userId: 'user_mock_brian_ng_002',
    domain: Domain.DSA,
    difficulty: Difficulty.Medium,
    startedAt: '2025-09-18T09:00:00Z',
    endedAt: '2025-09-18T09:40:00Z',
    duration: 40,
    totalScore: 97,
    status: Status.Completed,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    userId: 'user_mock_brian_ng_002',
    domain: Domain.WebDev,
    difficulty: Difficulty.Hard,
    startedAt: '2025-09-17T13:00:00Z',
    endedAt: '2025-09-17T13:50:00Z',
    duration: 50,
    totalScore: 88,
    status: Status.Completed,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    userId: 'user_mock_brian_ng_002',
    domain: Domain.DSA,
    difficulty: Difficulty.Easy,
    startedAt: '2025-09-16T15:00:00Z',
    endedAt: '2025-09-16T15:30:00Z',
    duration: 30,
    totalScore: 72,
    status: Status.Completed,
  },
];

export const questions: Question[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    interviewId: '550e8400-e29b-41d4-a716-446655440010',
    aiQuestion: 'Reverse a string.',
    createdAt: '2025-09-20T10:05:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    interviewId: '550e8400-e29b-41d4-a716-446655440011',
    aiQuestion: 'Build a React component for a todo list.',
    createdAt: '2025-09-21T12:05:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    interviewId: '550e8400-e29b-41d4-a716-446655440013',
    aiQuestion: 'Find the intersection of two arrays.',
    createdAt: '2025-09-18T09:05:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    interviewId: '550e8400-e29b-41d4-a716-446655440014',
    aiQuestion: 'Explain the virtual DOM in React.',
    createdAt: '2025-09-17T13:10:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024',
    interviewId: '550e8400-e29b-41d4-a716-446655440014',
    aiQuestion: 'Implement a debounce function in JavaScript.',
    createdAt: '2025-09-17T13:20:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440025',
    interviewId: '550e8400-e29b-41d4-a716-446655440015',
    aiQuestion: 'Check if a string is a palindrome.',
    createdAt: '2025-09-16T15:05:00Z',
  },
];

export const answerAttempts: AnswerAttempt[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    questionId: '550e8400-e29b-41d4-a716-446655440020',
    userId: 'user_mock_aditi_rao_001',
    code: `function reverseStr(s) {
  return s.split('').reverse().join('');
}`,
    explanation: 'Used split, reverse, join.',
    aiFeedback: 'Correct and efficient.',
    score: 10,
    createdAt: '2025-09-20T10:15:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    questionId: '550e8400-e29b-41d4-a716-446655440021',
    userId: 'user_mock_brian_ng_002',
    explanation: 'Tried map but forgot key props',
    aiFeedback: 'You need unique keys in list items',
    score: 5,
    createdAt: '2025-09-21T12:10:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    questionId: '550e8400-e29b-41d4-a716-446655440022',
    userId: 'user_mock_brian_ng_002',
    code: `function intersection(a, b) {
  return a.filter(x => b.includes(x));
}`,
    explanation: 'Used filter and includes.',
    aiFeedback: 'Efficient for small arrays.',
    score: 9,
    createdAt: '2025-09-18T09:15:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    questionId: '550e8400-e29b-41d4-a716-446655440023',
    userId: 'user_mock_brian_ng_002',
    explanation: 'Described how React uses a virtual DOM to optimize updates.',
    aiFeedback: 'Good explanation, could mention reconciliation.',
    score: 8,
    createdAt: '2025-09-17T13:25:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    questionId: '550e8400-e29b-41d4-a716-446655440024',
    userId: 'user_mock_brian_ng_002',
    code: `function debounce(fn, delay) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), delay);
  };
}`,
    explanation: 'Implemented debounce using closures and setTimeout.',
    aiFeedback: 'Correct and concise.',
    score: 10,
    createdAt: '2025-09-17T13:30:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440035',
    questionId: '550e8400-e29b-41d4-a716-446655440025',
    userId: 'user_mock_brian_ng_002',
    code: `function isPalindrome(s) {
  return s === s.split('').reverse().join('');
}`,
    explanation: 'Compared string to its reverse.',
    aiFeedback: 'Works for simple cases.',
    score: 9,
    createdAt: '2025-09-16T15:10:00Z',
  },
];
