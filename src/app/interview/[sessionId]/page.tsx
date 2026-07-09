import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InterviewCanvas from '@/components/interview/interview-canvas';
import { getInterviewState } from '@/lib/interview-redis';
import { getInterviewSessionForAccess } from '@/lib/interview-session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/auth');

  // Enforce DB existence, ownership, and strict expiry
  const dbSession = await getInterviewSessionForAccess(userId, sessionId);
  if (!dbSession) {
    redirect('/dashboard');
  }

  if (dbSession.status !== 'in_progress') {
    redirect(`/history/${sessionId}`);
  }

  // Verify state in Redis (now guaranteed to be legally in_progress by DB)
  const state = await getInterviewState(sessionId);

  if (!state) {
    redirect('/dashboard');
  }

  if (state.userId !== userId) {
    redirect('/dashboard');
  }

  if (state.status !== 'in_progress') {
    redirect(`/history/${sessionId}`);
  }

  return <InterviewCanvas key={state.currentQuestionIndex} state={state} />;
}
