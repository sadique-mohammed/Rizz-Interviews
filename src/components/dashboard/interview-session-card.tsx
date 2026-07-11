'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Code,
  Globe,
  Target,
  Loader2,
  AlertTriangle,
  Clock,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clearInterviewStorage, cleanupOrphanedStorage, cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActiveSession {
  id: string;
  domain: string;
  difficulty: string;
  duration: number;
  startedAt: string;
}

interface InterviewSessionCardProps {
  activeSession?: ActiveSession | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const interviewTypes = [
  {
    id: 'DSA',
    name: 'Data Structures & Algorithms',
    icon: Code,
    description: 'Arrays, Strings, Trees, Graphs etc.',
  },
  {
    id: 'Web Dev',
    name: 'Web Development',
    icon: Globe,
    description: 'React, APIs, Performance, etc.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeAgo(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getRemainingTime(startedAt: string, durationMinutes: number): string {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const remaining = durationMinutes * 60000 - elapsed;
  if (remaining <= 0) return 'expired';
  const mins = Math.floor(remaining / 60000);
  return `${mins} min remaining`;
}

// ─── Abandon Confirmation Modal ──────────────────────────────────────────────

interface AbandonModalProps {
  session: ActiveSession;
  onKeep: () => void;
  onConfirmAbandon: () => void;
  isAbandoning: boolean;
}

function AbandonModal({
  session,
  isOpen,
  onKeep,
  onConfirmAbandon,
  isAbandoning,
}: AbandonModalProps & { isOpen: boolean }) {
  const [render, setRender] = React.useState(isOpen);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRender(true);
      // Wait for React to render the DOM node, then trigger transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMounted(true));
      });
    } else {
      setMounted(false);
      // Wait for `--modal-close-dur` (150ms) + buffer before unmounting
      const timer = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKeep();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onKeep]);

  if (!render) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      role='dialog'
      aria-modal='true'
      aria-label='Abandon session confirmation'
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm t-modal-backdrop',
          mounted && 'is-open',
        )}
        onClick={onKeep}
        role='button'
        tabIndex={-1}
        aria-label='Close dialog'
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onKeep();
        }}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-[90vw] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl t-modal-content',
          mounted && 'is-open',
        )}
      >
        <div className='mb-2 flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900'>Abandon this session?</h3>
        </div>

        <p className='mb-6 text-sm leading-relaxed text-gray-600'>
          Your <span className='font-medium text-gray-800'>{session.domain}</span> (
          <span className='capitalize'>{session.difficulty}</span>) session from{' '}
          <span className='font-medium text-gray-800'>{getTimeAgo(session.startedAt)}</span> will be
          marked as abandoned. Progress won&apos;t be saved.
        </p>

        <div className='flex items-center justify-end gap-3'>
          <Button
            variant='outline'
            onClick={onKeep}
            disabled={isAbandoning}
            className='cursor-pointer rounded-lg border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            Keep session
          </Button>
          <Button
            onClick={onConfirmAbandon}
            disabled={isAbandoning}
            className='btn-destructive-soft cursor-pointer rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50'
          >
            {isAbandoning ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Abandoning…
              </>
            ) : (
              'Abandon and start new'
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Active Session Banner ───────────────────────────────────────────────────

interface ActiveSessionBannerProps {
  session: ActiveSession;
  onResume: () => void;
  onAbandon: () => void;
}

function ActiveSessionBanner({ session, onResume, onAbandon }: ActiveSessionBannerProps) {
  return (
    <div className='surface-brand-soft animate-fade-in-up rounded-xl p-4'>
      <div className='flex items-start gap-3'>
        <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/12'>
          <Clock className='h-4 w-4 text-brand' />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h4 className='text-sm font-semibold text-brand-dark'>Unfinished session</h4>
            <span className='inline-flex items-center rounded-full bg-brand/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand'>
              in progress
            </span>
          </div>
          <p className='mt-1 text-sm text-gray-700'>
            <span className='font-medium'>{session.domain}</span>
            {' · '}
            <span className='capitalize'>{session.difficulty}</span>
            {' · started '}
            {getTimeAgo(session.startedAt)}
            {' · '}
            {getRemainingTime(session.startedAt, session.duration)}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button
            onClick={onResume}
            size='sm'
            className='btn-brand cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white hover:scale-[1.02] active:scale-[0.98]'
          >
            <ArrowRight className='mr-1.5 h-3.5 w-3.5' />
            Resume
          </Button>
          <Button
            onClick={onAbandon}
            variant='outline'
            size='sm'
            className='btn-brand-soft cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-[0.98]'
          >
            <XCircle className='mr-1 h-3.5 w-3.5' />
            Abandon
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InterviewSessionCard({ activeSession = null }: InterviewSessionCardProps) {
  const router = useRouter();

  const [selectedType, setSelectedType] = React.useState('DSA');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('easy');
  const [selectedDuration, setSelectedDuration] = React.useState('15');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAbandonModal, setShowAbandonModal] = React.useState(false);
  const [isAbandoning, setIsAbandoning] = React.useState(false);
  const [localActiveSession, setLocalActiveSession] = React.useState(activeSession);

  // Sync prop changes and clean up orphaned localStorage keys
  React.useEffect(() => {
    setLocalActiveSession(activeSession);
    cleanupOrphanedStorage(activeSession?.id || null);
  }, [activeSession]);

  const isLocked = !!localActiveSession;

  const handleStartInterview = async () => {
    if (isLoading || isLocked) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: selectedType,
          difficulty: selectedDifficulty,
          duration: selectedDuration,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409 && errorData?.sessionId) {
          toast.info('Resuming your existing interview session...');
          router.push(`/interview/${errorData.sessionId}`);
          return;
        }
        toast.error(errorData?.error ?? 'Failed to start interview. Please try again.');
        return;
      }

      const data = await res.json();
      router.push(`/interview/${data.id}`);
    } catch (error) {
      console.error('Error starting interview session:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = () => {
    if (!localActiveSession) return;
    toast.info('Resuming your existing interview session...');
    router.push(`/interview/${localActiveSession.id}`);
  };

  const handleConfirmAbandon = async () => {
    if (!localActiveSession || isAbandoning) return;
    setIsAbandoning(true);

    try {
      const res = await fetch(`/api/interviews/${localActiveSession.id}/abandon`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData?.error ?? 'Failed to abandon session.');
        return;
      }

      toast.success('Session abandoned. You can start a new one.');
      clearInterviewStorage(localActiveSession.id);
      setLocalActiveSession(null);
      setShowAbandonModal(false);
    } catch (error) {
      console.error('Error abandoning session:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsAbandoning(false);
    }
  };

  return (
    <>
      <Card className='surface-brand h-full border'>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <Target className='h-5 w-5 text-brand' />
            <CardTitle className='text-lg font-semibold text-gray-900'>
              Start New Interview Session
            </CardTitle>
          </div>
          <CardDescription className='text-gray-600'>
            Configure your interview parameters and begin your practice session
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Active session banner */}
          {localActiveSession && (
            <ActiveSessionBanner
              session={localActiveSession}
              onResume={handleResume}
              onAbandon={() => setShowAbandonModal(true)}
            />
          )}

          {/* Form — disabled when there's an active session */}
          <div className={isLocked ? 'pointer-events-none opacity-40 select-none' : ''}>
            {isLocked && (
              <p className='mb-4 text-sm font-medium text-brand-dark'>
                Finish or abandon your active session first.
              </p>
            )}

            <div>
              <label className='text-sm font-medium text-gray-700 mb-3 block'>Interview Type</label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {interviewTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      role='button'
                      tabIndex={isLocked ? -1 : 0}
                      aria-pressed={selectedType === type.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedType === type.id
                          ? 'border-brand bg-brand/8 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-brand/30 hover:shadow-xs'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedType(type.id);
                        }
                      }}
                    >
                      <div className='flex items-start space-x-3'>
                        <div
                          className={`p-2 rounded-md transition-colors ${
                            selectedType === type.id ? 'bg-brand/12' : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              selectedType === type.id ? 'text-brand' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900 text-sm'>{type.name}</h3>
                          <p className='text-xs text-gray-500 mt-1'>{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
              <div>
                <label
                  htmlFor='difficulty'
                  className='text-sm font-medium text-gray-700 mb-2 block'
                >
                  Difficulty Level
                </label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger id='difficulty' className='w-full cursor-pointer'>
                    <SelectValue placeholder='Select difficulty' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='easy' className='cursor-pointer'>
                      Easy
                    </SelectItem>
                    <SelectItem value='medium' className='cursor-pointer'>
                      Medium
                    </SelectItem>
                    <SelectItem value='hard' className='cursor-pointer'>
                      Hard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor='duration' className='text-sm font-medium text-gray-700 mb-2 block'>
                  Session Duration
                </label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger id='duration' className='w-full cursor-pointer'>
                    <SelectValue placeholder='Select duration' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value='1'
                      className='cursor-pointer bg-brand/8 font-semibold text-brand focus:bg-brand/14 focus:text-brand-dark'
                    >
                      1 min (Testing)
                    </SelectItem>
                    <SelectItem value='15' className='cursor-pointer'>
                      15 minutes
                    </SelectItem>
                    <SelectItem value='30' className='cursor-pointer'>
                      30 minutes
                    </SelectItem>
                    <SelectItem value='45' className='cursor-pointer'>
                      45 minutes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='pt-4 border-t border-gray-100 mt-6'>
              <Button
                onClick={handleStartInterview}
                disabled={isLoading || isLocked}
                className='btn-brand cursor-pointer rounded-lg p-4 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Play className='h-4 w-4' />
                )}
                {isLoading ? 'Starting...' : 'Start Interview'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abandon confirmation modal */}
      {localActiveSession && (
        <AbandonModal
          session={localActiveSession}
          isOpen={showAbandonModal}
          onKeep={() => setShowAbandonModal(false)}
          onConfirmAbandon={handleConfirmAbandon}
          isAbandoning={isAbandoning}
        />
      )}
    </>
  );
}
