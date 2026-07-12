import HistoryList from '@/components/history/history-list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Interview } from '@/types/interviewHistory';

async function fetchHistory(): Promise<Interview[]> {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  const origin = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_BASE_URL;
  const url = new URL('/api/history', origin);

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  if (res.status === 401) {
    redirect('/auth');
  }

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error('Failed to fetch interview history');
  }

  return res.json();
}

export default async function HistoryPage() {
  const interviewHistory = await fetchHistory();
  const completedCount = interviewHistory.filter((item) => item.status === 'completed').length;
  const totalMinutes = interviewHistory.reduce((acc, item) => acc + Number(item.duration || 0), 0);
  const averageScoreRaw = interviewHistory
    .map((item) => item.totalScore)
    .filter((value): value is number => value !== null && value !== undefined);
  const averageScore =
    averageScoreRaw.length > 0
      ? Math.round(averageScoreRaw.reduce((acc, score) => acc + score, 0) / averageScoreRaw.length)
      : null;

  return (
    <div className='page-shell min-h-screen'>
      <div className='max-w-6xl mx-auto px-6 py-12'>
        <div className='grid gap-6 md:grid-cols-[2fr,1fr] items-start mb-10'>
          <Card className='surface-brand border'>
            <CardContent className='p-6 flex flex-col gap-5'>
              <div>
                <Badge className='badge-brand-soft mb-3 w-fit'>Progress</Badge>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Your Interview Journey</h1>
                <p className='text-gray-600 max-w-xl'>
                  Track past sessions, review AI feedback, and identify patterns to keep improving
                  toward your next win.
                </p>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                <div className='surface-brand-soft flex items-center gap-3 rounded-xl px-4 py-3'>
                  <div className='grid h-9 w-9 place-content-center rounded-lg bg-brand text-white'>
                    <Trophy className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-brand/80'>Completed</p>
                    <p className='text-lg font-semibold text-brand-dark'>{completedCount}</p>
                  </div>
                </div>
                <div className='surface-muted flex items-center gap-3 rounded-xl px-4 py-3'>
                  <div className='grid h-9 w-9 place-content-center rounded-lg bg-brand-dark text-white'>
                    <Clock className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-gray-600'>
                      Practice minutes
                    </p>
                    <p className='text-lg font-semibold text-brand-dark'>{totalMinutes || 0}m</p>
                  </div>
                </div>
                <div className='surface-accent flex items-center gap-3 rounded-xl px-4 py-3'>
                  <div className='grid h-9 w-9 place-content-center rounded-lg bg-brand-secondary text-white'>
                    <ArrowRight className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-brand-secondary'>
                      Avg. score
                    </p>
                    <p className='text-lg font-semibold text-brand-dark'>
                      {averageScore !== null ? `${averageScore}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <HistoryList interviewHistory={interviewHistory} />
      </div>
    </div>
  );
}
