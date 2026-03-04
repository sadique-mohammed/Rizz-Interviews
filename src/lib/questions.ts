export type Question = {
  id: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  requiresCode?: boolean;
  starterCode?: Record<string, string>;
  codeSolution?: string;
  theoreticalSolution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
};

export const QUESTIONS: Question[] = [
  {
    id: 'dsa-two-sum',
    domain: 'DSA',
    difficulty: 'easy',
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target. Each input has exactly one solution and you may not use the same element twice.',
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
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your solution\n}',
      python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    pass',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
    },
    codeSolution:
      'public int[] twoSum(int[] nums, int target) {\n  Map<Integer, Integer> map = new HashMap<>();\n  for (int i = 0; i < nums.length; i++) {\n    int comp = target - nums[i];\n    if (map.containsKey(comp)) return new int[]{ map.get(comp), i };\n    map.put(nums[i], i);\n  }\n  return new int[]{};\n}',
    theoreticalSolution:
      'Uses a hash map to store indices. Brute-force is O(n^2); hash map finds the complement in O(1) average time for O(n) total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'dsa-valid-parentheses',
    domain: 'DSA',
    difficulty: 'easy',
    title: 'Valid Parentheses',
    description:
      "Given a string s containing the characters '(', ')', '{', '}', '[' and ']', determine if the string is valid. A string is valid if open brackets are closed by the same type and in the correct order, and every closing bracket has a corresponding opening bracket.",
    examples: [
      'Input: s = "()" → Output: true',
      'Input: s = "()[]{}" → Output: true',
      'Input: s = "(]" → Output: false',
      'Input: s = "([])" → Output: true',
    ],
    constraints: ['1 ≤ s.length ≤ 10^4', 's consists only of the characters ()[]{}'],
    requiresCode: true,
    starterCode: {
      javascript: 'function isValid(s) {\n  // Write your solution\n}',
      python: 'def is_valid(s: str) -> bool:\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};',
    },
    codeSolution:
      "public boolean isValid(String s) {\n  Stack<Character> st = new Stack<>();\n  for (char c : s.toCharArray()) {\n    if (c == '(') st.push(')');\n    else if (c == '{') st.push('}');\n    else if (c == '[') st.push(']');\n    else if (st.isEmpty() || st.pop() != c) return false;\n  }\n  return st.isEmpty();\n}",
    theoreticalSolution:
      'Uses a Stack (LIFO). Every opening bracket is pushed; each closing bracket must match the top of the stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'dsa-reverse-linked-list',
    domain: 'DSA',
    difficulty: 'easy',
    title: 'Reverse Linked List',
    description:
      'Given the head of a singly linked list, reverse the list and return the reversed head.',
    examples: [
      'Input: 1→2→3→4→5 → Output: 5→4→3→2→1',
      'Input: 1→2 → Output: 2→1',
      'Input: [] → Output: []',
    ],
    constraints: ['0 ≤ list length ≤ 1000', '-1000 ≤ Node.val ≤ 1000'],
    requiresCode: true,
    starterCode: {
      javascript: 'function reverseList(head) {\n  // Write your solution\n}',
      python: 'def reverse_list(head):\n    pass',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};',
    },
    codeSolution:
      'public ListNode reverseList(ListNode head) {\n  ListNode prev = null, curr = head;\n  while (curr != null) {\n    ListNode next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
    theoreticalSolution:
      'Iterative solution uses three pointers (prev, curr, next) to reverse pointers in place. Recursion is also possible but uses O(n) stack space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'dsa-longest-substring',
    domain: 'DSA',
    difficulty: 'medium',
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      'Input: s = "abcabcbb" → Output: 3 ("abc")',
      'Input: s = "bbbbb" → Output: 1 ("b")',
      'Input: s = "pwwkew" → Output: 3 ("wke")',
    ],
    constraints: ['0 ≤ s.length ≤ 5 × 10^4', 's consists of printable ASCII characters'],
    requiresCode: true,
    starterCode: {
      javascript: 'function lengthOfLongestSubstring(s) {\n  // Write your solution\n}',
      python: 'def length_of_longest_substring(s: str) -> int:\n    pass',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};',
    },
    codeSolution:
      'public int lengthOfLongestSubstring(String s) {\n  Map<Character, Integer> map = new HashMap<>();\n  int max = 0;\n  for (int i = 0, j = 0; i < s.length(); i++) {\n    if (map.containsKey(s.charAt(i)))\n      j = Math.max(j, map.get(s.charAt(i)) + 1);\n    map.put(s.charAt(i), i);\n    max = Math.max(max, i - j + 1);\n  }\n  return max;\n}',
    theoreticalSolution:
      'Uses a sliding window with two pointers. A hash map tracks the last seen index of each character to efficiently advance the left pointer past any duplicate.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n)) where m is the character set size',
  },
  {
    id: 'dsa-number-of-islands',
    domain: 'DSA',
    difficulty: 'medium',
    title: 'Number of Islands',
    description:
      "Given an m×n grid of '1's (land) and '0's (water), count the number of distinct islands. An island is surrounded by water and is formed by connecting adjacent land cells horizontally or vertically.",
    examples: [
      'Input: [["1","1","1"],["0","1","0"],["1","1","0"]] → Output: 1',
      'Input: [["1","0"],["0","1"]] → Output: 2',
    ],
    constraints: ['1 ≤ m, n ≤ 300', "grid[i][j] is '0' or '1'"],
    requiresCode: true,
    starterCode: {
      javascript: 'function numIslands(grid) {\n  // Write your solution\n}',
      python: 'def num_islands(grid: list[list[str]]) -> int:\n    pass',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};',
    },
    codeSolution:
      "public int numIslands(char[][] grid) {\n  int count = 0;\n  for (int i = 0; i < grid.length; i++)\n    for (int j = 0; j < grid[0].length; j++)\n      if (grid[i][j] == '1') { count++; dfs(grid, i, j); }\n  return count;\n}\nprivate void dfs(char[][] g, int r, int c) {\n  if (r<0 || c<0 || r>=g.length || c>=g[0].length || g[r][c]=='0') return;\n  g[r][c] = '0';\n  dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);\n}",
    theoreticalSolution:
      "Uses DFS (or BFS) to find connected components. Each time a '1' is found, increment the count and flood-fill the island to '0' to avoid recounting.",
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(min(m, n)) for the recursion stack',
  },
  {
    id: 'dsa-trapping-rain-water',
    domain: 'DSA',
    difficulty: 'hard',
    title: 'Trapping Rain Water',
    description:
      'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6',
      'Input: height = [4,2,0,3,2,5] → Output: 9',
    ],
    constraints: ['1 ≤ height.length ≤ 2 × 10^4', '0 ≤ height[i] ≤ 10^5'],
    requiresCode: true,
    starterCode: {
      javascript: 'function trap(height) {\n  // Write your solution\n}',
      python: 'def trap(height: list[int]) -> int:\n    pass',
      java: 'class Solution {\n    public int trap(int[] height) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        \n    }\n};',
    },
    codeSolution:
      'public int trap(int[] height) {\n  int l = 0, r = height.length - 1, lMax = 0, rMax = 0, ans = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      if (height[l] >= lMax) lMax = height[l];\n      else ans += lMax - height[l];\n      l++;\n    } else {\n      if (height[r] >= rMax) rMax = height[r];\n      else ans += rMax - height[r];\n      r--;\n    }\n  }\n  return ans;\n}',
    theoreticalSolution:
      'Water at index i equals min(leftMax, rightMax) - height[i]. Two pointers process from both ends simultaneously, maintaining running maximums to avoid a second pass.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'dsa-merge-k-sorted-lists',
    domain: 'DSA',
    difficulty: 'hard',
    title: 'Merge K Sorted Lists',
    description:
      'You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.',
    examples: [
      'Input: lists = [[1,4,5],[1,3,4],[2,6]] → Output: [1,1,2,3,4,4,5,6]',
      'Input: lists = [] → Output: []',
      'Input: lists = [[]] → Output: []',
    ],
    constraints: [
      '0 ≤ k ≤ 10^4',
      '0 ≤ lists[i].length ≤ 500',
      'Sum of all list lengths ≤ 10^4',
      '-10^4 ≤ lists[i][j] ≤ 10^4',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function mergeKLists(lists) {\n  // Write your solution\n}',
      python: 'def merge_k_lists(lists):\n    pass',
      java: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};',
    },
    codeSolution:
      'public ListNode mergeKLists(ListNode[] lists) {\n  PriorityQueue<ListNode> pq = new PriorityQueue<>((a,b)->a.val-b.val);\n  for(ListNode l : lists) if(l!=null) pq.add(l);\n  ListNode dummy = new ListNode(0), tail = dummy;\n  while(!pq.isEmpty()){\n    tail.next = pq.poll();\n    tail = tail.next;\n    if(tail.next!=null) pq.add(tail.next);\n  }\n  return dummy.next;\n}',
    theoreticalSolution:
      'A min-heap always yields the next smallest node across all k lists. Divide-and-conquer (repeatedly merging pairs) is an alternative with the same complexity.',
    timeComplexity: 'O(N log k) where N is total nodes',
    spaceComplexity: 'O(k) for the heap',
  },
  {
    id: 'dsa-lru-cache',
    domain: 'DSA',
    difficulty: 'hard',
    title: 'LRU Cache',
    description:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value), both running in O(1) average time. On capacity overflow, evict the least recently used key.',
    examples: [
      'capacity=2: put(1,1), put(2,2), get(1)=1, put(3,3) evicts key 2, get(2)=-1',
      'get returns -1 if the key does not exist',
    ],
    constraints: [
      '1 ≤ capacity ≤ 3000',
      '0 ≤ key ≤ 10^4',
      '0 ≤ value ≤ 10^5',
      'get and put must each run in O(1) average time',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        'class LRUCache {\n  constructor(capacity) {\n    // Write your solution\n  }\n  get(key) {}\n  put(key, value) {}\n}',
      python:
        'class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass',
      java: 'class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}',
    },
    codeSolution:
      'class LRUCache {\n  class Node { int k, v; Node prev, next; }\n  Map<Integer, Node> map = new HashMap<>();\n  Node head = new Node(), tail = new Node();\n  int cap;\n  LRUCache(int c) { cap = c; head.next = tail; tail.prev = head; }\n  public int get(int key) {\n    if(!map.containsKey(key)) return -1;\n    Node n = map.get(key); remove(n); insertAtHead(n); return n.v;\n  }\n  public void put(int key, int val) {\n    if(map.containsKey(key)) remove(map.get(key));\n    Node n = new Node(); n.k = key; n.v = val;\n    insertAtHead(n); map.put(key, n);\n    if(map.size() > cap) { Node lru = tail.prev; remove(lru); map.remove(lru.k); }\n  }\n  void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }\n  void insertAtHead(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }\n}',
    theoreticalSolution:
      'Combines a HashMap for O(1) lookup with a Doubly Linked List for O(1) reordering. Head = Most Recently Used, Tail = Least Recently Used (eviction candidate).',
    timeComplexity: 'O(1) for get and put',
    spaceComplexity: 'O(capacity)',
  },
  {
    id: 'dsa-course-schedule',
    domain: 'DSA',
    difficulty: 'hard',
    title: 'Course Schedule',
    description:
      'There are n courses labeled 0 to n-1. Given prerequisites[i] = [a, b] meaning you must take b before a, determine if it is possible to finish all courses (i.e., the graph has no cycle).',
    examples: [
      'Input: numCourses = 2, prerequisites = [[1,0]] → Output: true',
      'Input: numCourses = 2, prerequisites = [[1,0],[0,1]] → Output: false (cycle)',
    ],
    constraints: [
      '1 ≤ numCourses ≤ 2000',
      '0 ≤ prerequisites.length ≤ 5000',
      'prerequisites[i].length == 2',
      'No duplicate prerequisites',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function canFinish(numCourses, prerequisites) {\n  // Write your solution\n}',
      python: 'def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:\n    pass',
      java: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        \n    }\n}',
    },
    codeSolution:
      'public boolean canFinish(int n, int[][] pre) {\n  List<Integer>[] adj = new List[n];\n  int[] deg = new int[n];\n  for(int[] p : pre){\n    if(adj[p[1]]==null) adj[p[1]]=new ArrayList<>();\n    adj[p[1]].add(p[0]); deg[p[0]]++;\n  }\n  Queue<Integer> q = new LinkedList<>();\n  for(int i=0;i<n;i++) if(deg[i]==0) q.add(i);\n  int count = 0;\n  while(!q.isEmpty()){\n    int curr = q.poll(); count++;\n    if(adj[curr]!=null) for(int next:adj[curr]) if(--deg[next]==0) q.add(next);\n  }\n  return count == n;\n}',
    theoreticalSolution:
      "Kahn's Algorithm for Topological Sort. Build an in-degree array; repeatedly process nodes with in-degree 0. If all nodes are processed, no cycle exists.",
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
  },
  {
    id: 'web-debounce',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'Implement Debounce',
    description:
      'Implement a debounce function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was called.',
    examples: [
      'Search bar: API fires only after user stops typing for 300ms',
      'const debouncedFn = debounce(save, 500); // multiple rapid calls → one execution',
    ],
    constraints: [
      'Subsequent calls within the wait window must reset the timer',
      "Must preserve the correct 'this' context and all arguments",
      'Must return a function',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function debounce(func, wait) {\n  // Write your solution\n}',
      typescript:
        'function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {\n  // Write your solution\n}',
    },
    codeSolution:
      'function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}',
    theoreticalSolution:
      'Uses closures to maintain a private timeout. Each call clears the previous timer and starts a new one, so func only fires after a gap of at least wait ms with no further calls.',
    timeComplexity: 'O(1) per call',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'web-throttle',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'Implement Throttle',
    description:
      'Implement a throttle function that ensures func is invoked at most once per limit milliseconds, regardless of how frequently the throttled function is called.',
    examples: [
      'Scroll handler fires at most once every 100ms during continuous scrolling',
      'Resize handler fires at most once every 200ms',
    ],
    constraints: [
      'Must ignore calls that arrive within the cooldown window',
      "Must preserve the correct 'this' context and all arguments",
      'Must return a function',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function throttle(func, limit) {\n  // Write your solution\n}',
      typescript:
        'function throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {\n  // Write your solution\n}',
    },
    codeSolution:
      'function throttle(func, limit) {\n  let inThrottle;\n  return function(...args) {\n    if (!inThrottle) {\n      func.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}',
    theoreticalSolution:
      'Unlike debounce (waits for a pause), throttle guarantees regular execution at most once per interval. A boolean flag blocks calls during the cooldown window.',
    timeComplexity: 'O(1) per call',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'web-promise-all',
    domain: 'Web Dev',
    difficulty: 'hard',
    title: 'Implement Promise.all',
    description:
      'Implement promiseAll that behaves like Promise.all(). It takes an array of values (promises or non-promises) and returns a Promise resolving to an array of results in the original order. Reject immediately if any promise rejects.',
    examples: [
      "promiseAll([Promise.resolve(3), 42, Promise.resolve('foo')]) → resolves to [3, 42, 'foo']",
      "promiseAll([Promise.resolve(1), Promise.reject('Error')]) → rejects with 'Error'",
    ],
    constraints: [
      'Maintain the original order of results',
      'Reject immediately when any promise rejects',
      'Handle both promises and non-promise values',
      'Do not use the built-in Promise.all',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function promiseAll(promises) {\n  // Write your solution\n}',
      typescript:
        'function promiseAll<T>(promises: Array<T | Promise<T>>): Promise<T[]> {\n  // Write your solution\n}',
    },
    codeSolution:
      'function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let count = 0;\n    if (promises.length === 0) resolve([]);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then(val => {\n        results[i] = val;\n        if (++count === promises.length) resolve(results);\n      }, reject);\n    });\n  });\n}',
    theoreticalSolution:
      'Uses a counter to track fulfilled promises. Results are stored at their original index to preserve order regardless of resolution timing. Any rejection short-circuits immediately.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'web-deep-clone',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'Deep Clone',
    description:
      'Implement a deepClone function that creates a fully independent copy of a value, including all nested objects and arrays, with no shared references to the original.',
    examples: [
      'const clone = deepClone({a: 1, b: {c: 2}}); clone.b.c = 99; // original unchanged',
      'deepClone([1, [2, 3]]) → new array with no shared references',
    ],
    constraints: [
      'Must handle nested objects and arrays at any depth',
      'Mutations to the clone must not affect the original',
      'Must correctly handle null and primitive values',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function deepClone(obj) {\n  // Write your solution\n}',
      typescript: 'function deepClone<T>(obj: T): T {\n  // Write your solution\n}',
    },
    codeSolution:
      'function deepClone(obj) {\n  if (obj === null || typeof obj !== \"object\") return obj;\n  const copy = Array.isArray(obj) ? [] : {};\n  for (const key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key))\n      copy[key] = deepClone(obj[key]);\n  }\n  return copy;\n}',
    theoreticalSolution:
      'Recursively traverses the object tree, creating a new structure at every level. Senior candidates should discuss circular reference handling and structuredClone() as a native alternative.',
    timeComplexity: 'O(n) where n is total number of properties',
    spaceComplexity: 'O(d) where d is maximum nesting depth',
  },
  {
    id: 'web-event-emitter',
    domain: 'Web Dev',
    difficulty: 'medium',
    title: 'Implement an Event Emitter',
    description:
      'Implement an EventEmitter class with on(event, listener) to subscribe, emit(event, ...args) to trigger all listeners, and off(event, listener) to unsubscribe.',
    examples: [
      "emitter.on('login', () => console.log('user in')); emitter.emit('login'); // logs 'user in'",
      "emitter.on('data', (x) => console.log(x)); emitter.emit('data', 42); // logs 42",
    ],
    constraints: [
      'Multiple listeners per event must be supported',
      'emit must call all registered listeners in registration order',
      'Emitting an event with no listeners must not throw',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        'class EventEmitter {\n  constructor() {\n    // Write your solution\n  }\n  on(event, listener) {}\n  emit(event, ...args) {}\n  off(event, listener) {}\n}',
      typescript:
        'class EventEmitter {\n  private events: Record<string, Array<(...args: unknown[]) => void>> = {};\n  on(event: string, listener: (...args: unknown[]) => void): this { return this; }\n  emit(event: string, ...args: unknown[]): void {}\n  off(event: string, listener: (...args: unknown[]) => void): this { return this; }\n}',
    },
    codeSolution:
      'class EventEmitter {\n  constructor() { this.events = {}; }\n  on(name, cb) { (this.events[name] ??= []).push(cb); return this; }\n  emit(name, ...args) { this.events[name]?.forEach(f => f(...args)); }\n  off(name, cb) { this.events[name] = (this.events[name] ?? []).filter(f => f !== cb); return this; }\n}',
    theoreticalSolution:
      "Classic Observer pattern. A map stores event names as keys and arrays of callbacks as values. Returning 'this' from on/off enables method chaining.",
    timeComplexity: 'O(n) for emit where n is number of listeners',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'web-array-filter-polyfill',
    domain: 'Web Dev',
    difficulty: 'easy',
    title: 'Array.prototype.filter Polyfill',
    description:
      'Implement Array.prototype.myFilter that replicates the behavior of the native filter method, including correct argument passing and sparse array handling.',
    examples: [
      '[1, 2, 3, 4].myFilter(x => x > 2) → [3, 4]',
      '[1, 2, 3].myFilter((x, i) => i > 0) → [2, 3]',
    ],
    constraints: [
      'Must call callback with (element, index, array)',
      'Must return a new array without mutating the original',
      'Must support the optional thisArg parameter',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        'Array.prototype.myFilter = function(callback, thisArg) {\n  // Write your solution\n}',
    },
    codeSolution:
      'Array.prototype.myFilter = function(callback, thisArg) {\n  const res = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this))\n      res.push(this[i]);\n  }\n  return res;\n};',
    theoreticalSolution:
      "Iterates and collects elements for which the callback returns truthy. The 'in' operator correctly skips holes in sparse arrays.",
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'web-array-map-polyfill',
    domain: 'Web Dev',
    difficulty: 'easy',
    title: 'Array.prototype.map Polyfill',
    description:
      'Implement Array.prototype.myMap that replicates the behavior of the native map method, correctly handling sparse arrays and the optional thisArg parameter.',
    examples: [
      '[1, 2, 3].myMap(x => x * 2) → [2, 4, 6]',
      '[1, 2, , 4].myMap(x => x * x) → [1, 4, empty, 16]',
    ],
    constraints: [
      'Must call callback with (element, index, array)',
      'Must return a new array of the same length',
      "Must preserve holes in sparse arrays using the 'in' operator",
      'Must support the optional thisArg parameter',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        'Array.prototype.myMap = function(callback, thisArg) {\n  // Write your solution\n}',
    },
    codeSolution:
      'Array.prototype.myMap = function(callback, thisArg) {\n  const res = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) res[i] = callback.call(thisArg, this[i], i, this);\n  }\n  return res;\n};',
    theoreticalSolution:
      "Tests knowledge of higher-order functions and 'this' binding. Using 'in' is critical to preserve sparse array holes rather than mapping them to undefined.",
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'web-flatten-array',
    domain: 'Web Dev',
    difficulty: 'easy',
    title: 'Flatten Deeply Nested Array',
    description:
      'Implement a flatten function that flattens a nested array up to a given depth. Do not use Array.prototype.flat().',
    examples: [
      'flatten([1, [2, [3, [4]]]], 1) → [1, 2, [3, [4]]]',
      'flatten([1, [2, [3]]], Infinity) → [1, 2, 3]',
    ],
    constraints: [
      '0 ≤ total element count ≤ 10^5',
      '0 ≤ depth ≤ 1000',
      'Do not use Array.prototype.flat()',
    ],
    requiresCode: true,
    starterCode: {
      javascript: 'function flatten(arr, depth = 1) {\n  // Write your solution\n}',
      typescript:
        'function flatten(arr: unknown[], depth?: number): unknown[] {\n  // Write your solution\n}',
    },
    codeSolution:
      'function flatten(arr, depth = 1) {\n  return depth > 0\n    ? arr.reduce((acc, val) =>\n        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])\n    : arr.slice();\n}',
    theoreticalSolution:
      'Recursive approach decrements depth at each level. For large inputs, an iterative stack-based approach avoids call stack overflow.',
    timeComplexity: 'O(n) where n is total element count',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'web-event-delegation',
    domain: 'Web Dev',
    difficulty: 'easy',
    title: 'Event Delegation',
    description:
      'Explain and demonstrate event delegation. Attach a single listener to a parent element to handle events fired on any of its child elements, including those added dynamically.',
    examples: [
      'One click listener on <ul> handles clicks on any <li> child',
      'Dynamically added list items are handled automatically without re-registering',
    ],
    constraints: [
      'Must use a single event listener on the parent element',
      'Must correctly identify the target child using event.target',
      'Solution must work for dynamically added children',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        "const parent = document.getElementById('list');\n// Attach a single listener that handles clicks on <li> children\n// Write your solution",
    },
    codeSolution:
      "const parent = document.getElementById('list');\nparent.addEventListener('click', (event) => {\n  if (event.target && event.target.nodeName === 'LI') {\n    console.log('Item clicked:', event.target.innerText);\n  }\n});",
    theoreticalSolution:
      'Leverages browser event bubbling: events fired on a child propagate up to ancestors. Handling at the parent reduces memory usage and automatically covers dynamically inserted elements.',
    timeComplexity: 'O(1) for registration; O(d) per event where d is DOM depth',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'web-custom-promise',
    domain: 'Web Dev',
    difficulty: 'hard',
    title: 'Implement a Custom Promise',
    description:
      'Implement a CustomPromise class from scratch managing Pending, Fulfilled, and Rejected states, with support for then() and catch() chaining and microtask-based async resolution.',
    examples: [
      'new CustomPromise((resolve) => resolve(42)).then(v => console.log(v)) // logs 42',
      "new CustomPromise((_, reject) => reject('err')).catch(e => console.log(e)) // logs 'err'",
    ],
    constraints: [
      'Must manage Pending, Fulfilled, and Rejected states',
      'then() must return a new Promise to support chaining',
      'Callbacks must run asynchronously via the microtask queue',
      'Must handle both synchronous and asynchronous resolution',
    ],
    requiresCode: true,
    starterCode: {
      javascript:
        'class CustomPromise {\n  constructor(executor) {\n    // Write your solution\n  }\n  then(onFulfilled, onRejected) {}\n  catch(onRejected) { return this.then(null, onRejected); }\n}',
    },
    codeSolution:
      "class CustomPromise {\n  #state = 'pending';\n  #value;\n  #handlers = [];\n  constructor(executor) {\n    const resolve = (val) => this.#settle('fulfilled', val);\n    const reject = (reason) => this.#settle('rejected', reason);\n    try { executor(resolve, reject); } catch(e) { reject(e); }\n  }\n  #settle(state, value) {\n    if (this.#state !== 'pending') return;\n    this.#state = state; this.#value = value;\n    this.#handlers.forEach(h => this.#handle(h));\n  }\n  #handle({ onFulfilled, onRejected, resolve, reject }) {\n    queueMicrotask(() => {\n      const cb = this.#state === 'fulfilled' ? onFulfilled : onRejected;\n      if (typeof cb !== 'function')\n        return this.#state === 'fulfilled' ? resolve(this.#value) : reject(this.#value);\n      try { resolve(cb(this.#value)); } catch(e) { reject(e); }\n    });\n  }\n  then(onFulfilled, onRejected) {\n    return new CustomPromise((resolve, reject) => {\n      const handler = { onFulfilled, onRejected, resolve, reject };\n      if (this.#state === 'pending') this.#handlers.push(handler);\n      else this.#handle(handler);\n    });\n  }\n  catch(onRejected) { return this.then(null, onRejected); }\n}",
    theoreticalSolution:
      'A state machine with three states. Handlers queued via then() execute as microtasks to ensure async behaviour even for synchronous resolution. Each then() returns a new CustomPromise to enable chaining.',
    timeComplexity: 'O(n) where n is the number of chained handlers',
    spaceComplexity: 'O(n) for queued handlers',
  },
];

export function getQuestion(
  domain: 'DSA' | 'Web Dev',
  difficulty: 'easy' | 'medium' | 'hard',
  index: number,
): Question {
  const exact = QUESTIONS.filter((q) => q.domain === domain && q.difficulty === difficulty);
  if (exact.length > 0) return exact[index % exact.length];

  const sameDomain = QUESTIONS.filter((q) => q.domain === domain);
  if (sameDomain.length > 0) return sameDomain[index % sameDomain.length];

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
