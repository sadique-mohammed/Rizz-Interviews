import { QUESTIONS, questionToMarkdown } from '@/lib/questions';

export type MockAnswerAttempt = {
  id: string;
  questionId: string;
  userId: string;
  code: string | null;
  explanation: string;
  aiFeedback: string | null;
  score: number | null;
  createdAt: string;
};

export type MockQuestion = {
  id: string;
  interviewId: string;
  aiQuestion: string;
  createdAt: string;
  attempts: MockAnswerAttempt[];
};

export const MOCK_INTERVIEW_QUESTIONS: MockQuestion[] = [
  {
    id: 'mock-q-1',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[0]), // Two Sum
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-1',
        questionId: 'mock-q-1',
        userId: 'mock-user',
        code: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
}`,
        explanation: 'Used a hashmap to store visited numbers and checked for complement in O(1).',
        aiFeedback: 'Excellent use of hash map for O(n) time complexity.\nCorrectly avoids reusing the same element.\nClean and readable implementation.',
        score: 10,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-2',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[1]), // Valid Parentheses
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-2',
        questionId: 'mock-q-2',
        userId: 'mock-user',
        code: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (let char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}`,
        explanation: 'Used stack to track open brackets and match closing ones.',
        aiFeedback: 'Correct stack-based approach.\nHandles nesting correctly.\nConsider explicitly checking invalid characters for robustness.',
        score: 8,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-3',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[2]), // Container With Most Water
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-3',
        questionId: 'mock-q-3',
        userId: 'mock-user',
        code: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let max = 0;

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    max = Math.max(max, area);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return max;
}`,
        explanation: 'Used two pointers from both ends and moved the smaller height inward.',
        aiFeedback: 'Good two-pointer optimization.\nCorrect O(n) solution.\nExplanation could be deeper — why moving the shorter line is safe was not clearly justified.',
        score: 7,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-4',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[3]), // Auth API
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-4',
        questionId: 'mock-q-4',
        userId: 'mock-user',
        code: null,
        explanation: 'I would create POST /register and POST /login endpoints.\nPasswords would be hashed using bcrypt before storing in database.\nJWT would be issued on login and stored in HttpOnly cookies.\nI would validate input and return 400 for invalid requests.',
        aiFeedback: 'Strong understanding of password hashing and token-based authentication.\nGood use of HttpOnly cookies for security.\nCould discuss refresh tokens or token revocation strategy.',
        score: 9,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-5',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[4]), // Rate limited API
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-5',
        questionId: 'mock-q-5',
        userId: 'mock-user',
        code: null,
        explanation: 'I would use Redis to store request counters per user.\nImplement sliding window rate limiting.\nReturn 429 status when limit exceeded.\nUse middleware so logic is reusable.',
        aiFeedback: 'Correct use of Redis for distributed rate limiting.\nGood understanding of HTTP 429.\nConsider discussing burst traffic handling and monitoring.',
        score: 8,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-6',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[5]), // Promise.all
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-6',
        questionId: 'mock-q-6',
        userId: 'mock-user',
        code: `function promiseAll(arr) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    arr.forEach((p, i) => {
      Promise.resolve(p)
        .then((value) => {
          results[i] = value;
          completed++;
          if (completed === arr.length) resolve(results);
        })
        .catch(reject);
    });
  });
}`,
        explanation: 'Wrapped everything in new Promise and tracked completion count.',
        aiFeedback: 'Correct handling of order preservation.\nGood use of Promise.resolve to normalize values.\nEdge case missing: empty array should resolve immediately.',
        score: 6,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-q-7',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(QUESTIONS[6]), // Hoisting
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-7',
        questionId: 'mock-q-7',
        userId: 'mock-user',
        code: null,
        explanation: 'Hoisting means variable declarations are moved to top of scope.\nvar is hoisted and initialized as undefined.\nlet and const are hoisted but remain in temporal dead zone until declared.',
        aiFeedback: 'Correct high-level explanation.\nGood distinction between var and let/const.\nCould further explain execution context creation phase.',
        score: 7,
        createdAt: new Date().toISOString(),
      }
    ]
  }
];
