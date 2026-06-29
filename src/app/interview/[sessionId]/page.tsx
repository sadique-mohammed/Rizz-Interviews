import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { interviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import InterviewCanvas from '@/components/interview/interview-canvas';
import Footer from '@/components/dashboard/footer';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/auth');

  const [interview] = await db
    .select({
      id: interviews.id,
      domain: interviews.domain,
      difficulty: interviews.difficulty,
      duration: interviews.duration,
      status: interviews.status,
    })
    .from(interviews)
    .where(and(eq(interviews.id, sessionId), eq(interviews.userId, userId)))
    .limit(1);

  if (!interview || interview.status !== 'in_progress') {
    redirect('/dashboard');
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
