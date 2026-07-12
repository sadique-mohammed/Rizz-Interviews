'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Trophy,
  MessageSquare,
  Code2,
  User,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import Loading from '@/components/dashboard/loader';
import { formatDateFull } from '@/lib/formatters';
import { getExpectedQuestionsCount } from '@/lib/scoring';
import { getDifficultyBadgeClass, getStatusBadgeClass, getStatusLabel } from '@/lib/styles';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import type { PrismLight as PrismType } from 'react-syntax-highlighter';

const SyntaxHighlighter = dynamic<React.ComponentProps<typeof PrismType>>(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false, loading: () => <div className='animate-pulse bg-gray-200 h-32 rounded' /> },
) as typeof PrismType;

const getLanguageLabel = (language: string): string => {
  switch (language) {
    case 'javascript':
      return 'JavaScript';
    case 'typescript':
      return 'TypeScript';
    case 'java':
      return 'Java';
    case 'python':
      return 'Python';
    case 'cpp':
      return 'C++';
    default:
      return 'Plain text';
  }
};

const generateOverallFeedback = (interview: any) => {
  if (!interview || !interview.questions) return null;

  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];
  let attemptedQuestionsCount = 0;

  interview.questions.forEach((q: any) => {
    if (q.attempts && q.attempts.length > 0) {
      const validAttempts = q.attempts.filter(
        (a: any) => !(a.score === 0 && a.explanation === 'Auto-submitted when time expired.'),
      );

      if (validAttempts.length > 0) {
        attemptedQuestionsCount++;
        const bestAttempt = validAttempts.reduce(
          (best: any, current: any) => ((current.score || 0) > (best.score || 0) ? current : best),
          validAttempts[0],
        );

        if (bestAttempt.evaluationResult) {
          if (bestAttempt.evaluationResult.strengths) {
            allStrengths.push(...bestAttempt.evaluationResult.strengths);
          }
          if (bestAttempt.evaluationResult.improvements) {
            allWeaknesses.push(...bestAttempt.evaluationResult.improvements);
          }
        }
      }
    }
  });

  const expectedCount = getExpectedQuestionsCount(interview.duration, interview.difficulty);

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 3);
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 3);

  return {
    attemptedCount: attemptedQuestionsCount,
    expectedCount,
    strengths: uniqueStrengths,
    weaknesses: uniqueWeaknesses,
    hasPenalty: attemptedQuestionsCount < expectedCount,
  };
};

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    const CACHE_KEY = `interview_${params.id}`;
    const fetchInterviewDetail = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, status } = JSON.parse(cached);

          if (status === 'completed' || status === 'abandoned') {
            setInterview(data);
            setLoading(false);
            return;
          }
        }
      } catch {}

      try {
        setLoading(true);
        const res = await fetch(`/api/history/${params.id}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/history');
          return;
        }

        const interviewData = await res.json();

        if (interviewData.questions) {
          interviewData.questions = interviewData.questions.map((q: any) => ({
            ...q,
            attempts: q.answerAttempts || [],
          }));
        }

        setInterview(interviewData);

        if (interviewData.status === 'completed' || interviewData.status === 'abandoned') {
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                data: interviewData,
                status: interviewData.status,
                cachedAt: Date.now(),
              }),
            );
          } catch {}
        }
      } catch (error) {
        console.error(error);
        router.push('/history');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchInterviewDetail();
  }, [params.id, router]);

  const handleCopyCode = React.useCallback(async (code: string, attemptId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(attemptId);
      setTimeout(() => setCopiedCode(null), 1000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, []);

  if (loading) return <Loading />;
  if (!interview) return <p>Interview not found</p>;

  const overallFeedback = generateOverallFeedback(interview);

  return (
    <div className='page-shell min-h-screen'>
      <div className='max-w-5xl mx-auto px-6 py-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <Button
            asChild
            variant='ghost'
            className='w-fit gap-2 px-0 text-brand hover:cursor-pointer hover:text-brand-dark'
          >
            <Link href='/history'>
              <ArrowLeft className='h-4 w-4' /> Back to history
            </Link>
          </Button>
        </div>

        <Card className='surface-brand mb-10 border'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <Badge className='badge-brand-soft mb-3'>Session recap</Badge>
                <CardTitle className='text-3xl font-semibold text-gray-900'>
                  {interview.domain} Interview
                </CardTitle>
                <p className='text-sm text-gray-500 mt-1'>{formatDateFull(interview.startedAt)}</p>
              </div>
              <div className='flex gap-2'>
                <Badge className={getDifficultyBadgeClass(interview.difficulty)}>
                  {interview.difficulty}
                </Badge>
                <Badge variant='outline' className={getStatusBadgeClass(interview.status)}>
                  {getStatusLabel(interview.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
            <div className='surface-muted flex items-center gap-3 rounded-xl p-4'>
              <div className='grid h-10 w-10 place-content-center rounded-lg bg-brand-dark text-white'>
                <Clock className='h-5 w-5' />
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-600'>Duration</p>
                <p className='text-lg font-semibold text-brand-dark'>
                  {interview.duration} minutes
                </p>
              </div>
            </div>
            {interview.totalScore !== null && (
              <div className='surface-accent flex items-center gap-3 rounded-xl p-4'>
                <div className='grid h-10 w-10 place-content-center rounded-lg bg-brand-secondary text-white'>
                  <Trophy className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-brand-secondary'>
                    Overall score
                  </p>
                  <p className='text-lg font-semibold text-brand-dark'>{interview.totalScore}%</p>
                </div>
              </div>
            )}
            <div className='surface-brand-soft flex items-center gap-3 rounded-xl p-4'>
              <div className='grid h-10 w-10 place-content-center rounded-lg bg-brand text-white'>
                <MessageSquare className='h-5 w-5' />
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-brand/80'>Questions</p>
                <p className='text-lg font-semibold text-brand-dark'>
                  {interview.questions.length}
                </p>
              </div>
            </div>
          </CardContent>

          {overallFeedback && interview.status === 'completed' && (
            <div className='px-6 pb-6'>
              <div className='rounded-xl bg-slate-50 border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>Overall Feedback</h3>

                <div className='mb-6 p-4 rounded-lg bg-white border border-slate-100 shadow-sm'>
                  <p className='text-sm text-slate-700 leading-relaxed'>
                    <span className='font-semibold text-slate-900'>Pacing & Overall Speed: </span>
                    You completed{' '}
                    <span className='font-semibold'>{overallFeedback.attemptedCount}</span>{' '}
                    question(s) during your{' '}
                    <span className='font-semibold'>
                      {interview.duration} minute {interview.difficulty}
                    </span>{' '}
                    interview.
                    {overallFeedback.attemptedCount > overallFeedback.expectedCount ? (
                      <span className='font-medium text-brand-secondary'>
                        {' '}
                        Your pacing was exceptionally fast, demonstrating a strong ability to write
                        working code quickly under time constraints. You moved through the problems
                        with highly impressive speed!
                      </span>
                    ) : overallFeedback.attemptedCount === overallFeedback.expectedCount ? (
                      <span className='font-medium text-brand-secondary'>
                        {' '}
                        Your pacing was excellent and perfectly aligned with what is expected for
                        this difficulty level. You demonstrated a solid balance of speed and
                        accuracy.
                      </span>
                    ) : (
                      <span className='text-rose-700 font-medium'>
                        {' '}
                        While focus on quality is important, your overall pacing was slower than
                        what is typically expected for this time limit. In a real interview setting,
                        completing more problems within the time limit is crucial, which slightly
                        impacted your final score.
                      </span>
                    )}
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {overallFeedback.strengths.length > 0 && (
                    <div className='space-y-3'>
                      <h4 className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-secondary'>
                        <div className='h-2 w-2 rounded-full bg-brand-secondary' />
                        The Good
                      </h4>
                      <ul className='space-y-2'>
                        {overallFeedback.strengths.map((s, i) => (
                          <li
                            key={i}
                            className='text-sm text-slate-600 leading-relaxed flex items-start gap-2'
                          >
                            <span className='mt-0.5 text-brand-secondary'>•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {overallFeedback.weaknesses.length > 0 && (
                    <div className='space-y-3'>
                      <h4 className='text-sm font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-rose-500' />
                        What to Focus On
                      </h4>
                      <ul className='space-y-2'>
                        {overallFeedback.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className='text-sm text-slate-600 leading-relaxed flex items-start gap-2'
                          >
                            <span className='text-rose-500 mt-0.5'>•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Interview conversation</h2>
              <p className='text-sm text-gray-500'>
                Review prompts, your responses, and AI feedback.
              </p>
            </div>
          </div>
          {interview.questions.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-600'>No questions recorded for this interview.</p>
              </CardContent>
            </Card>
          ) : (
            <RealInterviewQuestions
              questions={interview.questions}
              onCopyCode={handleCopyCode}
              copiedCode={copiedCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface RealInterviewQuestionsProps {
  questions: any[];
  onCopyCode: (code: string, attemptId: string) => void;
  copiedCode: string | null;
}

const RealInterviewQuestions = ({
  questions,
  onCopyCode,
  copiedCode,
}: RealInterviewQuestionsProps) => {
  return (
    <>
      {questions.map((q: any, idx: number) => (
        <Card key={q.id} className='border border-slate-200/80 shadow-sm'>
          <CardContent className='p-6 space-y-6'>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <div className='surface-brand-soft rounded-xl p-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-9 w-9 rounded-lg bg-brand flex items-center justify-center'>
                      <Bot className='h-4 w-4 text-white' />
                    </div>
                    <div className='h-9 flex items-center'>
                      <p className='text-sm font-semibold tracking-wide text-brand-dark leading-none'>
                        Nexus AI &mdash; Question #{idx + 1}
                      </p>
                    </div>
                  </div>

                  {q.questionBank ? (
                    <div className='mt-4 space-y-5'>
                      <div>
                        <h2 className='mb-2 text-lg font-semibold tracking-tight text-gray-900'>
                          {q.questionBank.title}
                        </h2>
                        <div className='text-sm leading-relaxed text-gray-700 whitespace-pre-wrap'>
                          {q.questionBank.description}
                        </div>
                      </div>

                      {q.questionBank.examples?.length > 0 && (
                        <div>
                          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-brand-dark'>
                            Examples
                          </h3>
                          <div className='space-y-2'>
                            {q.questionBank.examples.map((example: string, i: number) => (
                              <div
                                key={i}
                                className='rounded-lg border border-brand/20 bg-brand/5 p-3 font-mono text-xs leading-relaxed text-gray-800 shadow-xs'
                              >
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.questionBank.constraints?.length > 0 && (
                        <div>
                          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-brand-dark'>
                            Constraints
                          </h3>
                          <ul className='space-y-1.5 rounded-lg border border-brand/20 bg-brand/5 p-3 shadow-xs'>
                            {q.questionBank.constraints.map((c: string, i: number) => (
                              <li
                                key={i}
                                className='flex items-start gap-2 text-xs font-medium text-gray-700'
                              >
                                <span className='mt-0.5 text-brand'>•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='mt-3 text-gray-900 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-0.5'>
                      <ReactMarkdown>{q.aiQuestion}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {q.attempts.map((attempt: any, aIdx: number) => {
              const language = attempt.language || 'text';

              return (
                <div key={attempt.id} className='flex gap-4'>
                  <div className='flex-1 space-y-3 overflow-x-auto'>
                    <div className='bg-white border border-slate-200 rounded-xl p-4 shadow-xs'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex gap-2 items-center flex-shrink-0'>
                          <div className='h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center'>
                            <User className='h-4 w-4 text-gray-600' />
                          </div>
                          <div>
                            <p className='text-sm font-semibold text-gray-900'>
                              Your Answer #{aIdx + 1}
                            </p>
                          </div>
                        </div>
                        {attempt.score !== null && (
                          <Badge
                            className={`border gap-1 font-semibold ${
                              attempt.score >= 8
                                ? 'border-brand/20 bg-brand/10 text-brand-dark'
                                : attempt.score >= 6
                                  ? 'border-brand-secondary/20 bg-brand-secondary/10 text-brand-secondary'
                                  : 'border-destructive/20 bg-destructive/10 text-destructive'
                            }`}
                          >
                            <Trophy className='h-3 w-3' />
                            {attempt.score}/10
                          </Badge>
                        )}
                      </div>
                      {attempt.code && (
                        <div className='mb-3'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              <Code2 className='h-4 w-4 text-gray-500' />
                              <span className='text-sm font-medium text-gray-700'>Code</span>
                              <Badge variant='secondary' className='text-xs'>
                                {getLanguageLabel(language)}
                              </Badge>
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onCopyCode(attempt.code, attempt.id)}
                              aria-label='Copy code to clipboard'
                              title='Copy code'
                              className='h-8 px-2 cursor-pointer'
                            >
                              {copiedCode === attempt.id ? (
                                <Check className='h-3 w-3 text-brand-secondary' />
                              ) : (
                                <Copy className='h-3 w-3 cursor-pointer' />
                              )}
                            </Button>
                          </div>
                          <div className='rounded-lg border border-slate-200'>
                            <SyntaxHighlighter
                              language={language}
                              customStyle={{
                                margin: 0,
                                fontSize: '13px',
                                lineHeight: '1.5',
                                borderRadius: '0.5rem',
                              }}
                              showLineNumbers={true}
                            >
                              {attempt.code}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )}
                      {attempt.explanation && (
                        <div>
                          <p className='text-sm font-medium text-gray-700 mb-1'>Explanation:</p>
                          <p className='text-sm text-gray-900 whitespace-pre-line'>
                            {attempt.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    {attempt.aiFeedback && (
                      <div className='surface-brand-soft rounded-lg p-4'>
                        <p className='text-sm font-medium text-brand-dark mb-1'>
                          Nexus AI Feedback
                        </p>
                        <p className='text-sm text-slate-700 whitespace-pre-line'>
                          {attempt.aiFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {q.attempts.length === 0 && (
              <div className='flex gap-4'>
                <div className='flex-shrink-0'>
                  <div className='h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center'>
                    <User className='h-4 w-4 text-gray-400' />
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center'>
                    <p className='text-sm text-slate-500'>No response recorded</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};
