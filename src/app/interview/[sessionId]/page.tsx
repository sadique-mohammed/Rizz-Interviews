import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InterviewCanvas from '@/components/interview/interview-canvas';
import { getInterviewState } from '@/lib/interview-redis';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/auth');

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

  return (
    <InterviewCanvas state={state} />
  );
}
