'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import InterviewSessionCard from '@/components/dashboard/interview-session-card';

interface InterviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function InterviewDrawer({ isOpen, onClose }: InterviewDrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [activeSession, setActiveSession] = React.useState<{
    id: string;
    domain: string;
    difficulty: string;
    duration: number;
    startedAt: string;
  } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Ensure portal only renders on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen || !mounted) return;

    const controller = new AbortController();

    const loadActiveSession = async () => {
      setIsCheckingSession(true);
      setLoadError('');

      try {
        const res = await fetch('/api/dashboard', {
          signal: controller.signal,
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error ?? 'Failed to load current interview state.');
        }

        const data = await res.json();
        setActiveSession(data?.activeSession ?? null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to load active session:', error);
        setActiveSession(null);
        setLoadError('Unable to verify your active interview right now. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingSession(false);
        }
      }
    };

    loadActiveSession();

    return () => {
      controller.abort();
    };
  }, [isOpen, mounted, refreshKey]);

  // Close on Escape, lock body scroll, trap focus
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && contentRef.current) {
        const elements = Array.from(contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Auto-focus first focusable element when modal opens
  React.useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    const first = contentRef.current.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      role='dialog'
      aria-modal='true'
      aria-label='Start a new interview session'
    >
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300'
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose();
        }}
        role='button'
        tabIndex={-1}
        aria-label='Close dialog'
      />

      <div
        ref={contentRef}
        className='relative z-10 w-[90vw] sm:w-[60vw] max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-white rounded-t-2xl'>
          <div className='h-1.5 w-12 rounded-full bg-gray-300' />
        </div>

        <div className='px-4 pb-8 sm:px-6'>
          {isCheckingSession ? (
            <div className='flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50'>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
                Checking for an active interview...
              </div>
            </div>
          ) : loadError ? (
            <div className='rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800'>
              <p className='font-medium'>Could not verify current interview state.</p>
              <p className='mt-1 text-amber-700'>{loadError}</p>
              <button
                type='button'
                onClick={() => {
                  setLoadError('');
                  setRefreshKey((value) => value + 1);
                }}
                className='mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700'
              >
                Retry
              </button>
            </div>
          ) : (
            <InterviewSessionCard activeSession={activeSession} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
