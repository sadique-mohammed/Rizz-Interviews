'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { Clock, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatters';
import { getDifficultyBadgeClass, timerColor, progressColor } from '@/lib/styles';

import React from 'react';

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
  const [animateScale, setAnimateScale] = React.useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    // Zoom animation at 5 mins, 1 min, 30 sec, and last 10 seconds
    const shouldAnimate = timeLeft === 300 || timeLeft === 60 || timeLeft === 30 || (timeLeft <= 10 && timeLeft > 0);
    
    if (shouldAnimate) {
      setAnimateScale(true);
      const timer = setTimeout(() => setAnimateScale(false), 500);
      
      // Play tick sound for last 10 seconds
      if (timeLeft <= 10) {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') ctx.resume();
          
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
          // ignore audio context errors
        }
      }
      
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
            <Badge className='badge-brand-soft px-2 py-0.5 text-[11px] uppercase tracking-wide'>
              {domain}
            </Badge>
          </div>
        </div>

        <div className={`flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 transition-all duration-300 ${animateScale ? 'scale-125 border-destructive/30 bg-destructive/10 shadow-lg' : ''}`}>
          <Clock className={`h-4 w-4 ${timerColor(timeLeft)} ${animateScale ? 'text-destructive animate-pulse' : ''}`} />
          <span className={`font-mono text-sm font-semibold tabular-nums ${timerColor(timeLeft)} ${animateScale ? 'text-destructive font-bold' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            size='sm'
            onClick={onEnd}
            className='btn-destructive-soft gap-1.5 text-sm font-medium cursor-pointer'
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
