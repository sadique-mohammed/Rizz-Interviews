// utils/mockData.ts

// 1. Single current user (from Clerk, extended into DB)
export const mockUser = {
  id: 1,
  username: "Aditi Rao",
  email: "aditi.rao@example.com",
  auth_provider: "clerk_google",
  created_at: "2025-09-01T09:00:00Z",
};

// 2. Interviews (list for the user)
export const mockInterviews = [
  {
    id: "int_001",
    user_id: 1,
    domain: "DSA",
    difficulty: "easy",
    duration: 45,
    start_time: "2025-09-15T10:00:00Z",
    end_time: "2025-09-15T10:45:00Z",
    status: "completed",
    score: 78,
  },
  {
    id: "int_002",
    user_id: 1,
    domain: "Web Dev",
    difficulty: "medium",
    duration: 60,
    start_time: "2025-09-17T12:00:00Z",
    end_time: null,
    status: "in_progress",
    score: null,
  },
];

// 3. One interview expanded with nested Q&A and recording
export const mockInterviewDetail = {
  id: "int_002",
  user_id: 1,
  domain: "Web Dev",
  difficulty: "medium",
  duration: 60,
  start_time: "2025-09-17T12:00:00Z",
  end_time: null,
  status: "in_progress",
  score: null,
  questions: [
    {
      id: "q001",
      ai_prompt: "Build a responsive navbar using HTML, CSS, and JS.",
      created_at: "2025-09-17T12:05:00Z",
      attempts: [
        {
          id: "a001",
          user_id: 1,
          code: "<nav>...</nav>",
          explanation: "Used flexbox for layout.",
          ai_feedback: "Good, but navbar is not responsive yet.",
          points: 5,
          created_at: "2025-09-17T12:10:00Z",
          conversations: [
            {
              id: "c001",
              sender: "user",
              message: "I added flexbox, is that enough?",
              created_at: "2025-09-17T12:11:00Z",
            },
            {
              id: "c002",
              sender: "ai",
              message: "Flexbox is a good start, but you need media queries for responsiveness.",
              created_at: "2025-09-17T12:12:00Z",
            },
          ],
        },
        {
          id: "a002",
          user_id: 1,
          code: "<nav class='responsive'>...</nav>",
          explanation: "Added media queries for smaller screens.",
          ai_feedback: "Perfect! Now it’s responsive.",
          points: 10,
          created_at: "2025-09-17T12:20:00Z",
          conversations: [
            {
              id: "c003",
              sender: "user",
              message: "I added media queries, does it look fine?",
              created_at: "2025-09-17T12:21:00Z",
            },
            {
              id: "c004",
              sender: "ai",
              message: "Yes, that solves it. Well done!",
              created_at: "2025-09-17T12:22:00Z",
            },
          ],
        },
      ],
    },
  ],
  recording: {
    id: "rec001",
    video_url: "/mock/recordings/int_002.mp4",
    transcript_url: "/mock/transcripts/int_002.txt",
  },
};
