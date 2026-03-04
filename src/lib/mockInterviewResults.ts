import { QUESTIONS, questionToMarkdown } from '@/lib/questions';

function questionById(id: string) {
  const question = QUESTIONS.find((item) => item.id === id);
  if (!question) {
    throw new Error(`Question not found in bank: ${id}`);
  }
  return question;
}

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

const SEEDED_MOCK_INTERVIEW_QUESTIONS: MockQuestion[] = [
  {
    id: 'mock-q-1',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('dsa-two-sum')),
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
        aiFeedback:
          'Excellent use of hash map for O(n) time complexity.\nCorrectly avoids reusing the same element.\nClean and readable implementation.',
        score: 10,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-2',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('dsa-valid-parentheses')),
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
        aiFeedback:
          'Correct stack-based approach.\nHandles nesting correctly.\nConsider explicitly checking invalid characters for robustness.',
        score: 8,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-3',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('dsa-reverse-linked-list')),
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-3',
        questionId: 'mock-q-3',
        userId: 'mock-user',
        code: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}`,
        explanation:
          'Iterated once through the list while rewiring next pointers using prev/curr/next pointers.',
        aiFeedback:
          'Correct in-place reversal with O(1) extra space.\nGood pointer handling without losing the remaining list.\nEdge case for empty list is handled naturally.',
        score: 9,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-4',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('web-debounce')),
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-4',
        questionId: 'mock-q-4',
        userId: 'mock-user',
        code: `function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}`,
        explanation: 'Used a closure to retain timeout ID and reset it on every rapid invocation.',
        aiFeedback:
          'Solid debounce implementation with correct timer reset behavior.\nPreserves arguments and this-context using apply.\nCan be extended with cancel/flush support for production utility use.',
        score: 9,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-5',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('web-throttle')),
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-5',
        questionId: 'mock-q-5',
        userId: 'mock-user',
        code: `function throttle(func, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}`,
        explanation:
          'Used a boolean gate to allow execution only once per interval and block intermediate calls.',
        aiFeedback:
          'Correct basic throttle pattern with interval gating.\nMaintains this/args correctly.\nCould add trailing-call support depending on product requirements.',
        score: 8,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-6',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('web-promise-all')),
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
        aiFeedback:
          'Correct handling of order preservation.\nGood use of Promise.resolve to normalize values.\nEdge case missing: empty array should resolve immediately.',
        score: 6,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'mock-q-7',
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(questionById('web-event-delegation')),
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: 'mock-attempt-7',
        questionId: 'mock-q-7',
        userId: 'mock-user',
        code: `const parent = document.getElementById('list');
parent.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLLIElement) {
    console.log('Item clicked:', target.innerText);
  }
});`,
        explanation:
          'Attached one listener at parent level and filtered click events to li elements via event target.',
        aiFeedback:
          'Correct delegation pattern with a single parent listener.\nWorks for dynamically added children due to bubbling.\nGood use of target narrowing for safer DOM handling.',
        score: 7,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const SEEDED_QUESTION_IDS = new Set<string>([
  'dsa-two-sum',
  'dsa-valid-parentheses',
  'dsa-reverse-linked-list',
  'web-debounce',
  'web-throttle',
  'web-promise-all',
  'web-event-delegation',
]);

const GENERATED_MOCK_INTERVIEW_QUESTIONS: MockQuestion[] = QUESTIONS.filter(
  (question) => !SEEDED_QUESTION_IDS.has(question.id),
).map((question, index) => {
  const questionId = `mock-q-auto-${index + 1}`;
  const starterCode = question.starterCode?.javascript ?? null;

  return {
    id: questionId,
    interviewId: 'mock-interview-1',
    aiQuestion: questionToMarkdown(question),
    createdAt: new Date().toISOString(),
    attempts: [
      {
        id: `mock-attempt-auto-${index + 1}`,
        questionId,
        userId: 'mock-user',
        code: question.requiresCode ? starterCode : null,
        explanation: question.requiresCode
          ? `Started solving ${question.title} using the provided starter template and outlined the core approach.`
          : `Explained the key design considerations for ${question.title} and covered trade-offs.`,
        aiFeedback:
          'Good initial response structure.\nClear direction and relevant fundamentals.\nAdd more edge-case handling and deeper complexity discussion for a higher score.',
        score: 7,
        createdAt: new Date().toISOString(),
      },
    ],
  };
});

export const MOCK_INTERVIEW_QUESTIONS: MockQuestion[] = [
  ...SEEDED_MOCK_INTERVIEW_QUESTIONS,
  ...GENERATED_MOCK_INTERVIEW_QUESTIONS,
];
