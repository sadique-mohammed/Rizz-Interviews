'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { Clock, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatters';
import { getDifficultyBadgeClass, timerColor, progressColor } from '@/lib/styles';

interface InterviewModeHeaderProps {
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLeft: number;
  progressPercent: number;
  onEnd: () => void;
}

export default function InterviewModeHeader({
  domain,
  difficulty,
  timeLeft,
  progressPercent,
  onEnd,
}: InterviewModeHeaderProps) {
  return (
    <>
      <header className='flex shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-4 py-2.5 sm:px-6'>
        <div className='flex items-center gap-3'>
          <Link
            href='/dashboard'
            className='flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-80'
          >
            <Image src='/favicon.svg' alt='Nexus' width={24} height={24} />
            <span className='hidden text-sm font-semibold sm:inline'>Nexus AI</span>
          </Link>
          <div className='h-5 w-px bg-gray-200' />
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className={`border px-2 py-0.5 text-[11px] uppercase tracking-wide ${getDifficultyBadgeClass(difficulty)}`}
            >
              {difficulty}
            </Badge>
            <Badge className='border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] uppercase tracking-wide text-blue-600'>
              {domain}
            </Badge>
          </div>
        </div>

        <div className='flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5'>
          <Clock className={`h-4 w-4 ${timerColor(timeLeft)}`} />
          <span className={`font-mono text-sm font-semibold tabular-nums ${timerColor(timeLeft)}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onEnd}
            className='gap-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer'
          >
            <LogOut className='h-3.5 w-3.5' />
            <span className='hidden sm:inline'>End</span>
          </Button>
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-7 w-7' } }} />
        </div>
      </header>

      <div className='h-[4px] w-full shrink-0 bg-gray-100'>
        <div
          className={`h-full transition-all duration-1000 ease-linear ${progressColor(timeLeft)}`}
          style={{ width: `${100 - progressPercent}%` }}
        />
      </div>
    </>
  );
}
