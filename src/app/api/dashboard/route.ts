import { users, interviews, questions, answerAttempts, recordings } from '@/utils/mockData';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
export async function GET() {
  const user = await currentUser();
  console.log('------------------------------');
  console.log('Current User:', user);
  console.log('------------------------------');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // Find user
  const userData = users.find((u) => u.email === email);
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get user's interviews
  const userInterviews = interviews.filter((i) => i.userId === userData.id);

  // Nest questions + answerAttempts under each interview
  const interviewsWithDetails = userInterviews.map((interview) => {
    const qs = questions.filter((q) => q.interviewId === interview.id);
    const qsWithAttempts = qs.map((q) => ({
      ...q,
      answerAttempts: answerAttempts.filter((a) => a.questionId === q.id),
    }));

    return {
      ...interview,
      questions: qsWithAttempts,
      recordings: recordings.filter((r) => r.interviewId === interview.id),
    };
  });

  return NextResponse.json(
    {
      user: userData,
      interviews: interviewsWithDetails,
    },
    { status: 200 },
  );
}
