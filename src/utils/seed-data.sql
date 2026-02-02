-- Seed data for Nexus AI Interview Platform
-- Run this in your Neon Postgres console to populate the database

-- Insert Users (clerk_id format)
INSERT INTO users (id, name, email, image_url, auth_provider, created_at, updated_at, last_sign_in_at) VALUES
('user_mock_aditi_rao_001', 'Aditi Rao', 'aditi.rao@example.com', NULL, 'clerk', '2025-09-01T09:00:00Z', '2025-09-01T09:00:00Z', '2025-09-21T12:00:00Z'),
('user_mock_brian_ng_002', 'Brian Ng', 'brian.ng@example.com', NULL, 'clerk', '2025-09-02T10:00:00Z', '2025-09-02T10:00:00Z', '2025-09-21T11:30:00Z'),
('user_mock_carmen_lee_003', 'Carmen Lee', 'carmen.lee@example.com', NULL, 'clerk', '2025-09-03T11:00:00Z', '2025-09-03T11:00:00Z', '2025-09-21T10:45:00Z'),
('user_mock_david_kim_004', 'David Kim', 'david.kim@example.com', NULL, 'clerk', '2025-09-04T12:00:00Z', '2025-09-04T12:00:00Z', '2025-09-21T09:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Interviews
INSERT INTO interviews (id, user_id, domain, difficulty, duration, started_at, ended_at, status, total_score) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'user_mock_aditi_rao_001', 'DSA', 'easy', 45, '2025-09-20T10:00:00Z', '2025-09-20T10:45:00Z', 'completed', 81),
('550e8400-e29b-41d4-a716-446655440011', 'user_mock_brian_ng_002', 'Web Dev', 'medium', 30, '2025-09-21T12:00:00Z', NULL, 'in_progress', NULL),
('550e8400-e29b-41d4-a716-446655440012', 'user_mock_carmen_lee_003', 'DSA', 'hard', 50, '2025-09-19T14:00:00Z', '2025-09-19T14:50:00Z', 'completed', 75),
('550e8400-e29b-41d4-a716-446655440013', 'user_mock_brian_ng_002', 'DSA', 'medium', 40, '2025-09-18T09:00:00Z', '2025-09-18T09:40:00Z', 'completed', 97),
('550e8400-e29b-41d4-a716-446655440014', 'user_mock_brian_ng_002', 'Web Dev', 'hard', 50, '2025-09-17T13:00:00Z', '2025-09-17T13:50:00Z', 'completed', 88),
('550e8400-e29b-41d4-a716-446655440015', 'user_mock_brian_ng_002', 'DSA', 'easy', 30, '2025-09-16T15:00:00Z', '2025-09-16T15:30:00Z', 'completed', 72)
ON CONFLICT (id) DO NOTHING;

-- Insert Questions
INSERT INTO questions (id, interview_id, ai_question, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'Reverse a string.', '2025-09-20T10:05:00Z'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'Build a React component for a todo list.', '2025-09-21T12:05:00Z'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440013', 'Find the intersection of two arrays.', '2025-09-18T09:05:00Z'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440014', 'Explain the virtual DOM in React.', '2025-09-17T13:10:00Z'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440014', 'Implement a debounce function in JavaScript.', '2025-09-17T13:20:00Z'),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440015', 'Check if a string is a palindrome.', '2025-09-16T15:05:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Answer Attempts
INSERT INTO answer_attempts (id, question_id, user_id, code, explanation, ai_feedback, score, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'user_mock_aditi_rao_001', 
'function reverseStr(s) {
  return s.split('''').reverse().join('''');
}', 
'Used split, reverse, join.', 'Correct and efficient.', 10, '2025-09-20T10:15:00Z'),

('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 'user_mock_brian_ng_002', 
NULL, 
'Tried map but forgot key props', 'You need unique keys in list items', 5, '2025-09-21T12:10:00Z'),

('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', 'user_mock_brian_ng_002', 
'function intersection(a, b) {
  return a.filter(x => b.includes(x));
}', 
'Used filter and includes.', 'Efficient for small arrays.', 9, '2025-09-18T09:15:00Z'),

('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440023', 'user_mock_brian_ng_002', 
NULL, 
'Described how React uses a virtual DOM to optimize updates.', 'Good explanation, could mention reconciliation.', 8, '2025-09-17T13:25:00Z'),

('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440024', 'user_mock_brian_ng_002', 
'function debounce(fn, delay) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), delay);
  };
}', 
'Implemented debounce using closures and setTimeout.', 'Correct and concise.', 10, '2025-09-17T13:30:00Z'),

('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440025', 'user_mock_brian_ng_002', 
'function isPalindrome(s) {
  return s === s.split('''').reverse().join('''');
}', 
'Compared string to its reverse.', 'Works for simple cases.', 9, '2025-09-16T15:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Recordings
INSERT INTO recordings (id, interview_id, video_url, transcript_url, recording_status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'https://example.com/recordings/i1.mp4', 'https://example.com/recordings/i1_transcript.txt', 'completed', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'https://example.com/recordings/i3.mp4', 'https://example.com/recordings/i3_transcript.txt', 'completed', NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', NULL, NULL, 'pending', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Interviews:', COUNT(*) FROM interviews
UNION ALL
SELECT 'Questions:', COUNT(*) FROM questions
UNION ALL
SELECT 'Answer Attempts:', COUNT(*) FROM answer_attempts
UNION ALL
SELECT 'Recordings:', COUNT(*) FROM recordings;
