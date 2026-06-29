import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InterviewCanvas from '@/components/interview/interview-canvas';
import Footer from '@/components/dashboard/footer';
import { getInterviewSessionForAccess } from '@/lib/interview-session';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/auth');

  const interview = await getInterviewSessionForAccess(userId, sessionId);

  if (!interview) {
    redirect('/dashboard');
  }

  if (interview.status !== 'in_progress') {
    redirect(interview.status === 'completed' ? `/history/${sessionId}` : '/dashboard');
  }

  return (
    <>
      <InterviewCanvas
        sessionId={interview.id}
        domain={interview.domain as 'DSA' | 'Web Dev'}
        difficulty={interview.difficulty as 'easy' | 'medium' | 'hard'}
        duration={interview.duration}
      />
      <Footer />
    </>
  );
}
