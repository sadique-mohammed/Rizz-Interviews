'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Play, ArrowRight } from 'lucide-react';
import { Interview, Difficulty, Status } from '@/types/interviewHistory';
import { formatDateRelative } from '@/lib/formatters';
import { getDifficultyBadgeClass } from '@/lib/styles';

interface HistoryListProps {
  interviewHistory: Interview[];
}

export default function HistoryList({ interviewHistory }: HistoryListProps) {
  if (!interviewHistory.length) {
    return (
      <div className='text-center py-12'>
        <div className='mb-4'>
          <Trophy className='h-12 w-12 text-gray-400 mx-auto' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>No interviews yet</h3>
        <p className='text-gray-600 mb-6'>Start your first interview to see your progress here</p>
        <Button asChild>
          <Link href='/dashboard?startInterview=true' className='gap-2'>
            <Play className='h-4 w-4' />
            Start Interview
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {interviewHistory.map((interview) => (
        <Link key={interview.id} href={`/history/${interview.id}`} passHref>
          <Card className='h-full hover:border-blue-500 hover:shadow-sm transition-all duration-200 group'>
            <CardContent className='p-5 flex flex-col h-full'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='font-semibold text-base text-gray-800'>{interview.domain}</h3>
                  <p className='text-xs text-gray-500'>{formatDateRelative(interview.startedAt)}</p>
                </div>
                <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform duration-200' />
              </div>

              <div className='flex items-center gap-2 mb-4'>
                <Badge
                  variant='outline'
                  className={`text-xs font-medium ${getDifficultyBadgeClass(interview.difficulty)}`}
                >
                  {interview.difficulty}
                </Badge>
                <Badge
                  variant={interview.status === Status.Completed ? 'default' : 'outline'}
                  className='text-xs font-medium'
                >
                  {interview.status}
                </Badge>
              </div>

              <div className='mt-auto flex items-center justify-between text-sm text-gray-600'>
                <div className='flex items-center gap-1.5'>
                  <Clock className='h-4 w-4 text-gray-400' />
                  <span>{interview.duration}m</span>
                </div>
                {interview.totalScore !== null && (
                  <div className='flex items-center gap-1.5 font-medium'>
                    <Trophy className='h-4 w-4 text-yellow-500' />
                    <span>{interview.totalScore}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
