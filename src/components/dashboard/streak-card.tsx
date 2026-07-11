'use client';

import { Trophy, Flame, Target, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreakData, getLast7DaysActivity, getDaysOfWeek } from '@/lib/streak';
import { Card, CardContent } from '@/components/ui/card';

interface StreakCardProps {
  streakData: StreakData;
  className?: string;
}

export default function StreakCard({ streakData, className }: StreakCardProps) {
  const currentStreak = streakData.currentStreak || 0;
  const bestStreak = streakData.bestStreak || 0;

  // Calculate next milestone
  const milestones = [3, 7, 14, 30, 50, 100, 365];
  let nextMilestone = milestones.find((m) => m > currentStreak) || currentStreak + 10;
  const daysToMilestone = nextMilestone - currentStreak;

  // Format milestone label
  let milestoneLabel = `${nextMilestone} Days`;
  if (nextMilestone === 7) milestoneLabel = '1 Week';
  if (nextMilestone === 14) milestoneLabel = '2 Weeks';
  if (nextMilestone === 30) milestoneLabel = '1 Month';

  // Get activity arrays
  const last7Days = getLast7DaysActivity(streakData.activityDays || []);
  const daysOfWeek = getDaysOfWeek();

  // Progress ring calculation (percentage)
  let prevMilestone = milestones.slice().reverse().find((m) => m <= currentStreak) || 0;
  if (currentStreak === 0) prevMilestone = 0;
  const progressPercent = currentStreak === 0 ? 0 : Math.min(100, Math.max(0, ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  const boxClasses = 'group flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 transition-all hover:border-brand hover:bg-brand/8 hover:shadow-sm cursor-default';

  return (
    <Card className={cn('surface-brand border w-full', className)}>
      <CardContent className="p-2">
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          
          {/* Box 1: Current Streak */}
          <div className={boxClasses}>
            <div className='flex items-center space-x-2.5'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 transition-colors group-hover:bg-brand/12'>
                  <Flame className='h-4 w-4 text-gray-400 group-hover:text-brand transition-colors' />
                </div>
              </div>
              <div className='flex flex-col justify-center'>
                <h4 className='font-medium text-gray-900 text-xs'>Current Streak</h4>
                <div className='flex items-baseline gap-1'>
                  <span className='text-lg font-bold text-gray-900 leading-none tracking-tight'>{currentStreak}</span>
                  <span className='text-[9px] text-gray-500 font-medium uppercase'>days</span>
                </div>
              </div>
            </div>
            
            <div className='flex flex-col items-center bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm ml-2'>
              <Trophy className='w-3 h-3 text-yellow-500 mb-0.5' />
              <span className='text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center leading-none'>
                Best: {bestStreak}
              </span>
            </div>
          </div>

          {/* Box 2: 7-Day History */}
          <div className={boxClasses}>
            <div className='flex flex-col justify-center w-full h-full'>
              <div className='flex items-center gap-1 mb-1'>
                <CalendarDays className='w-3 h-3 text-gray-600 group-hover:text-brand transition-colors' />
                <h4 className='font-medium text-gray-900 text-xs'>Past 7 Days</h4>
              </div>
              <div className='flex items-center justify-between w-full mt-auto'>
                {last7Days.map((isActive, idx) => (
                  <div key={idx} className='flex flex-col items-center gap-0.5'>
                    <div
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center transition-all duration-300',
                        isActive 
                          ? 'bg-brand shadow-sm shadow-brand/20 group-hover:bg-brand' 
                          : 'bg-gray-100 border border-gray-200 opacity-60 group-hover:border-brand/30'
                      )}
                    >
                      {isActive && <Flame className='w-2.5 h-2.5 text-white animate-pulse' style={{ animationDuration: '3s' }} />}
                    </div>
                    <span className='text-[8px] font-bold text-gray-500 uppercase leading-none'>
                      {daysOfWeek[idx].slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Box 3: Next Milestone */}
          <div className={boxClasses}>
            <div className='flex items-center space-x-2.5'>
              <div className='flex-shrink-0'>
                <div className='relative w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md transition-colors group-hover:bg-brand/12'>
                  {/* Background Ring */}
                  <svg className='w-full h-full transform -rotate-90 absolute inset-0'>
                    <circle cx='16' cy='16' r='13' stroke='currentColor' strokeWidth='3' fill='transparent' className='text-gray-200 group-hover:text-brand/20 transition-colors' />
                    {/* Progress Ring */}
                    <circle
                      cx='16'
                      cy='16'
                      r='13'
                      stroke='currentColor'
                      strokeWidth='3'
                      fill='transparent'
                      strokeDasharray={2 * Math.PI * 13}
                      strokeDashoffset={(2 * Math.PI * 13) - (progressPercent / 100) * (2 * Math.PI * 13)}
                      strokeLinecap='round'
                      className='text-gray-400 group-hover:text-brand transition-all duration-1000 ease-out'
                    />
                  </svg>
                  <Target className='absolute w-3.5 h-3.5 text-gray-400 group-hover:text-brand transition-colors' />
                </div>
              </div>
              <div className='flex flex-col justify-center'>
                <h4 className='font-medium text-gray-900 text-xs'>Next Milestone</h4>
                <div className='flex items-baseline gap-1 mt-0.5'>
                  <span className='text-xs font-bold text-gray-700 group-hover:text-brand-dark transition-colors leading-none'>{milestoneLabel}</span>
                  <span className='text-[9px] text-gray-500 leading-none whitespace-nowrap'>{daysToMilestone} days left</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
