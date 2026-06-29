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
import { getDifficultyBadgeClass, getStatusBadgeClass, getStatusLabel } from '@/lib/styles';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { MOCK_INTERVIEW_QUESTIONS } from '@/lib/mockInterviewResults';
import type { PrismLight as PrismType } from 'react-syntax-highlighter';

const SyntaxHighlighter = dynamic<React.ComponentProps<typeof PrismType>>(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false, loading: () => <div className='animate-pulse bg-gray-200 h-32 rounded' /> },
) as typeof PrismType;

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    const CACHE_KEY = `interview_${params.id}`;
    const IN_PROGRESS_TTL = 15_000; // 15s for in-progress sessions

    const fetchInterviewDetail = async () => {
      // Check sessionStorage before hitting the network
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, status, cachedAt } = JSON.parse(cached);
          const isCompleted = status === 'completed';
          const isStillFresh = Date.now() - cachedAt < IN_PROGRESS_TTL;

          // Completed = immutable, serve forever. In-progress = serve within TTL.
          if (isCompleted || isStillFresh) {
            setInterview(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // sessionStorage unavailable or parse error — fall through to network
      }

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

        // Map answerAttempts → attempts
        if (interviewData.questions) {
          interviewData.questions = interviewData.questions.map((q: any) => ({
            ...q,
            attempts: q.answerAttempts || [],
          }));
        }

        setInterview(interviewData);

        // Cache in sessionStorage — completed interviews cached indefinitely
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: interviewData,
              status: interviewData.status,
              cachedAt: Date.now(),
            }),
          );
        } catch {
          // sessionStorage full or unavailable — silently skip
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

  const detectLanguage = React.useMemo(() => {
    return (code: string): string => {
      const source = code.trim();

      if (!source) return 'text';

      if (
        source.includes('public class') ||
        source.includes('public static') ||
        source.includes('System.out') ||
        source.includes('new HashMap')
      ) {
        return 'java';
      }

      if (
        source.includes('#include') ||
        source.includes('std::') ||
        source.includes('vector<') ||
        source.includes('using namespace std')
      ) {
        return 'cpp';
      }

      if (/^\s*def\s+\w+\s*\(/m.test(source) || /^\s*class\s+\w+\s*:/m.test(source)) {
        return 'python';
      }

      if (
        source.includes('interface ') ||
        source.includes('type ') ||
        source.includes(': unknown') ||
        source.includes(': string') ||
        source.includes(' as ')
      ) {
        return 'typescript';
      }

      if (
        source.includes('function') ||
        source.includes('const ') ||
        source.includes('let ') ||
        source.includes('=>')
      ) {
        return 'javascript';
      }

      return 'text';
    };
  }, []);

  const getLanguageLabel = React.useMemo(() => {
    return (language: string): string => {
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
  }, []);

  if (loading) return <Loading />;
  if (!interview) return <p>Interview not found</p>;

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white'>
      <div className='max-w-5xl mx-auto px-6 py-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <Button
            asChild
            variant='ghost'
            className='w-fit gap-2 px-0 text-blue-700 hover:text-blue-900 hover:cursor-pointer'
          >
            <Link href='/history'>
              <ArrowLeft className='h-4 w-4' /> Back to history
            </Link>
          </Button>
        </div>

        {/* Overview */}
        <Card className='mb-10 border border-blue-100 bg-white/90 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <Badge className='mb-3 bg-blue-100 text-blue-700'>Session recap</Badge>
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
            <div className='rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-center gap-3'>
              <div className='h-10 w-10 rounded-lg bg-slate-900 text-white grid place-content-center'>
                <Clock className='h-5 w-5' />
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Duration</p>
                <p className='text-lg font-semibold text-slate-900'>{interview.duration} minutes</p>
              </div>
            </div>
            {interview.totalScore !== null && (
              <div className='rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 flex items-center gap-3'>
                <div className='h-10 w-10 rounded-lg bg-emerald-500 text-white grid place-content-center'>
                  <Trophy className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-600'>Overall score</p>
                  <p className='text-lg font-semibold text-emerald-700'>{interview.totalScore}%</p>
                </div>
              </div>
            )}
            <div className='rounded-xl border border-blue-100 bg-blue-50/70 p-4 flex items-center gap-3'>
              <div className='h-10 w-10 rounded-lg bg-blue-600 text-white grid place-content-center'>
                <MessageSquare className='h-5 w-5' />
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-blue-700/80'>Questions</p>
                <p className='text-lg font-semibold text-blue-900'>{interview.questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Interview conversation</h2>
              <p className='text-sm text-gray-500'>
                Review prompts, your responses, and AI feedback.
              </p>
            </div>
          </div>
          {interview.questions.length === 0 && interview.status !== 'completed' ? (
            <MockInterviewQuestions
              detectLanguage={detectLanguage}
              handleCopyCode={handleCopyCode}
              copiedCode={copiedCode}
            />
          ) : interview.questions.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-600'>No questions recorded for this interview.</p>
              </CardContent>
            </Card>
          ) : (
            <RealInterviewQuestions
              questions={interview.questions}
              detectLanguage={detectLanguage}
              getLanguageLabel={getLanguageLabel}
              handleCopyCode={handleCopyCode}
              copiedCode={copiedCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const RealInterviewQuestions = ({
  questions,
  detectLanguage,
  getLanguageLabel,
  handleCopyCode,
  copiedCode,
}: any) => {
  return (
    <>
      {questions.map((q: any, idx: number) => (
        <Card key={q.id} className='border border-slate-200/80 shadow-sm'>
          <CardContent className='p-6 space-y-6'>
            {/* AI Question */}
            <div className='flex gap-4'>
              <div className='flex-1'>
                <div className='bg-blue-50/80 border border-blue-100 rounded-xl p-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center'>
                      <Bot className='h-4 w-4 text-white' />
                    </div>
                    <div className='h-9 flex items-center'>
                      <p className='text-sm font-semibold tracking-wide text-blue-600 leading-none'>
                        Nexus AI &mdash; Question #{idx + 1}
                      </p>
                    </div>
                  </div>

                  <div className='mt-3 text-gray-900 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-0.5'>
                    <ReactMarkdown>{q.aiQuestion}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* User Attempts */}
            {q.attempts.map((attempt: any, aIdx: number) => {
              const language = detectLanguage(attempt.code ?? '');

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
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : attempt.score >= 6
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-red-200 bg-red-50 text-red-700'
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
                              onClick={() => handleCopyCode(attempt.code, attempt.id)}
                              aria-label='Copy code to clipboard'
                              title='Copy code'
                              className='h-8 px-2 cursor-pointer'
                            >
                              {copiedCode === attempt.id ? (
                                <Check className='h-3 w-3 text-green-600' />
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
                      <div className='bg-blue-50/60 border border-blue-100 rounded-lg p-4'>
                        <p className='text-sm font-medium text-blue-600 mb-1'>Nexus AI Feedback</p>
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

const MockInterviewQuestions = ({ detectLanguage, handleCopyCode, copiedCode }: any) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 px-1 py-2 rounded-lg bg-amber-50 border border-amber-200 mb-6'>
        <span className='text-xs font-semibold text-amber-700 uppercase tracking-wide px-2'>
          Dev Preview — Mock Session Data
        </span>
      </div>
      <RealInterviewQuestions
        questions={MOCK_INTERVIEW_QUESTIONS}
        detectLanguage={detectLanguage}
        getLanguageLabel={(language: string) => {
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
        }}
        handleCopyCode={handleCopyCode}
        copiedCode={copiedCode}
      />
    </div>
  );
};
