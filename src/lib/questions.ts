export type Question = {
  id: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  requiresCode?: boolean;
};

export const QUESTIONS: Question[] = [
  // ---------------- DSA ----------------

  {
    id: 'dsa-two-sum',
    domain: 'DSA',
    difficulty: 'easy',
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target. Each input has exactly one solution and you may not use the same element twice. Return the answer in any order.',
    examples: [
      'Input: nums = [2,7,11,15], target = 9 → Output: [0,1]',
      'Input: nums = [3,2,4], target = 6 → Output: [1,2]',
      'Input: nums = [3,3], target = 6 → Output: [0,1]',
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10^4',
      '-10^9 ≤ nums[i] ≤ 10^9',
      '-10^9 ≤ target ≤ 10^9',
      'Exactly one valid answer exists',
    ],
    requiresCode: true,
  },

  {
    id: 'dsa-valid-parentheses',
    domain: 'DSA',
    difficulty: 'medium',
    title: 'Valid Parentheses',
    description:
      "Given a string s containing the characters '(', ')', '{', '}', '[' and ']', determine if the string is valid. A string is valid if open brackets are closed by the same type and in the correct order, and every closing bracket has a corresponding opening bracket.",
    examples: [
      'Input: s = "()" → Output: true',
      'Input: s = "()[]{}" → Output: true',
      'Input: s = "(]" → Output: false',
      'Input: s = "([])" → Output: true',
      'Input: s = "([)]" → Output: false',
    ],
    constraints: ['1 ≤ s.length ≤ 10^4', 's consists only of the characters ()[]{}'],
    requiresCode: true,
  },

  {
    id: 'dsa-container-water',
    domain: 'DSA',
    difficulty: 'hard',
    title: 'Container With Most Water',
    description:
      'You are given an integer array height where each element represents a vertical line. Find two lines that together with the x-axis form a container that holds the most water. Return the maximum area. You may not tilt the container.',
    examples: [
      'Input: height = [1,8,6,2,5,4,8,3,7] → Output: 49',
      'Input: height = [1,1] → Output: 1',
    ],
    constraints: ['2 ≤ height.length ≤ 10^5', '0 ≤ height[i] ≤ 10^4'],
    requiresCode: true,
  },

  // ---------------- WebDev (discussion / design) ----------------

  {
    id: 'web-auth',
    domain: 'Web Dev',
    difficulty: 'easy',
    title: 'Design User Authentication API',
    description:
      'Design a backend API for user registration and login. The system should allow users to create an account and later log in securely. Consider validation, password storage, and response handling.',
    examples: [
      'POST /api/auth/register → creates a new user account',
      'POST /api/auth/login → returns authentication token or session',
    ],
    constraints: [
      'Passwords must not be stored in plaintext',
      'Email must be unique',
      'Invalid credentials should return proper HTTP status codes',
      'System should prevent brute force login attempts',
    ],
    requiresCode: false,
  },

  {
    id: 'web-rate-limit',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'Design a Rate Limited Public API',
    description:
      'You are building a public REST API that may receive thousands of requests per minute. Design how the backend should protect itself from abuse and ensure fair usage among users.',
    examples: [
      'Allow each authenticated user to make limited requests per minute',
      'Return an error when the rate limit is exceeded',
    ],
    constraints: [
      'System must prevent API abuse',
      'Should work with multiple servers',
      'Must not block legitimate users',
      'Consider storage for tracking request counts',
    ],
    requiresCode: false,
  },

  {
    id: 'web-promise-all',
    domain: 'Web Dev',
    difficulty: 'hard',
    title: 'Implement Promise.all',
    description:
      "Implement a function promiseAll that behaves like JavaScript's Promise.all(). The function takes an array of values (which may be promises or non-promises) and returns a Promise that resolves to an array of resolved values in the same order. If any promise rejects, the returned promise should immediately reject with that error.",
    examples: [
      "promiseAll([Promise.resolve(3), 42, Promise.resolve('foo')]) → resolves to [3, 42, 'foo']",
      "promiseAll([Promise.resolve(1), Promise.reject('Error')]) → rejects with 'Error'",
    ],
    constraints: [
      'Maintain the order of results',
      'Reject immediately when any promise rejects',
      'Handle both promises and non-promise values',
      'Do not use the built-in Promise.all',
    ],
    requiresCode: true,
  },

  // ---------------- Theory ----------------

  {
    id: 'theory-hoisting',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'JavaScript Hoisting',
    description:
      'Explain what hoisting is in JavaScript. Describe how variables declared with var, let, and const behave during hoisting and what the temporal dead zone (TDZ) means.',
    examples: [
      'Accessing a var variable before declaration returns undefined',
      'Accessing a let or const variable before declaration throws ReferenceError',
    ],
    constraints: [
      'Explain execution context',
      'Explain temporal dead zone',
      'Compare var, let, and const behavior',
    ],
    requiresCode: false,
  },
];

export function getQuestion(
  domain: 'DSA' | 'Web Dev',
  difficulty: 'easy' | 'medium' | 'hard',
  index: number,
): Question {
  // 1. exact match
  const exact = QUESTIONS.filter((q) => q.domain === domain && q.difficulty === difficulty);
  if (exact.length > 0) return exact[index % exact.length];

  // 2. same domain fallback
  const sameDomain = QUESTIONS.filter((q) => q.domain === domain);
  if (sameDomain.length > 0) return sameDomain[index % sameDomain.length];

  // 3. global fallback (safety)
  return QUESTIONS[index % QUESTIONS.length];
}

export function questionToMarkdown(q: Question): string {
  const lines: string[] = [];

  lines.push(`## ${q.title}`);
  lines.push('');
  lines.push(q.description);

  if (q.examples.length > 0) {
    lines.push('');
    lines.push('**Examples:**');
    q.examples.forEach((ex) => lines.push(`- ${ex}`));
  }

  if (q.constraints.length > 0) {
    lines.push('');
    lines.push('**Constraints:**');
    q.constraints.forEach((c) => lines.push(`- ${c}`));
  }

  return lines.join('\n');
}
