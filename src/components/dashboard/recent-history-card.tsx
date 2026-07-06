import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, History } from 'lucide-react';
import type { Interview } from '@/types/interviewHistory';

type Props = {
  interviews: Interview[];
};

export default function RecentHistoryCard({ interviews }: Props) {
  const recentInterviews = [...interviews]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 3);

  return (
    <Card className='surface-brand h-full border'>
      <CardHeader className='pb-4'>
        <div className='flex items-center space-x-2'>
          <History className='h-5 w-5 text-brand' />
          <CardTitle className='text-lg font-semibold text-gray-900'>Recent Sessions</CardTitle>
        </div>
        <CardDescription className='text-gray-600'>
          Your latest practice results and feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentInterviews.length > 0 ? (
          <div className='space-y-2'>
            {recentInterviews.map((interview) => (
              <Link
                key={interview.id}
                href={`/history/${interview.id}`}
                className='flex items-center justify-between rounded-lg border border-gray-100 bg-white/70 p-3 transition-colors hover:border-brand/30 hover:bg-brand/5'
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (interview.totalScore ?? 0) >= 90
                          ? 'surface-accent'
                          : (interview.totalScore ?? 0) >= 75
                            ? 'surface-brand-soft'
                            : 'surface-muted'
                      }`}
                    >
                      <span
                        className={`text-base font-semibold ${
                          (interview.totalScore ?? 0) >= 90
                            ? 'text-brand-dark'
                            : (interview.totalScore ?? 0) >= 75
                              ? 'text-brand'
                              : 'text-gray-500'
                        }`}
                      >
                        {interview.totalScore ?? '-'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900 text-sm'>{interview.domain}</h4>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {new Date(interview.startedAt).toLocaleDateString()} • {interview.duration}{' '}
                      min • {interview.difficulty}
                    </p>
                  </div>
                </div>
                <ChevronRight className='h-4 w-4 text-gray-400' />
              </Link>
            ))}
            <div className='flex justify-end mt-4'>
              <Button
                variant='ghost'
                size='sm'
                className='cursor-pointer text-brand hover:bg-brand/10 hover:text-brand-dark'
              >
                <Link href='/history' className='text-sm text-brand hover:text-brand-dark'>
                  View All
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center h-full py-8'>
            <p className='text-center text-gray-500'>No recent interview sessions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
