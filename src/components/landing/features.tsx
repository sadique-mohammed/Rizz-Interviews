'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from './section-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Shield,
  Sparkles,
  BadgeCheck,
  FileText,
  PlayCircle,
  CheckCircle2,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), {
  ssr: false,
  loading: () => <div className='animate-pulse bg-gray-100 rounded-2xl h-64' />,
});

const MotionSpan = dynamic(() => import('framer-motion').then((mod) => mod.motion.span), {
  ssr: false,
});

const MotionUl = dynamic(() => import('framer-motion').then((mod) => mod.motion.ul), {
  ssr: false,
});

const MotionLi = dynamic(() => import('framer-motion').then((mod) => mod.motion.li), {
  ssr: false,
});

const AnimatePresence = dynamic(() => import('framer-motion').then((mod) => mod.AnimatePresence), {
  ssr: false,
});

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
  bullets?: string[];
};

const TABS: Tab[] = [
  {
    id: 'ai-interview',
    label: 'AI Interview',
    icon: PlayCircle,
    title: 'Real interviews, powered by AI.',
    copy: 'Practice DSA and Web Development interviews that adapt as you answer. The AI asks, evaluates, and guides you.',
    bullets: ['DSA + Web Dev', 'Theory + Coding', 'Adaptive flow'],
  },
  {
    id: 'feedback-scoring',
    label: 'AI Feedback',
    icon: Sparkles,
    title: 'Instant feedback and points.',
    copy: 'Receive per-question points and actionable feedback instantly. Improve iteratively with targeted hints.',
    bullets: ['Per-question scoring', 'Hints when stuck', 'Final session score'],
  },
  {
    id: 'conversation',
    label: 'Conversation',
    icon: FileText,
    title: 'Full Q&A history.',
    copy: 'Every question, attempt, and AI correction is logged so you can review reasoning chains and learn from mistakes.',
    bullets: ['Attempts logged', 'AI corrections', 'Session summaries'],
  },
  {
    id: 'scoring',  
    label: 'Scoring',
    icon: BadgeCheck,
    title: 'Smart scoring rubric.',
    copy: 'Points-based scoring (0–10 per attempt). Final score is computed from best attempts per question.',
    bullets: ['Partial credit', 'Best-attempt aggregation', 'Exportable results'],
  },
];

function DemoCard({
  pulse = false,
  activeId = 'ai-interview',
}: {
  pulse?: boolean;
  activeId?: string;
}) {
  const color = 'bg-brand/10 text-brand';
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rX: 0, rY: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100 - 50;
    const py = ((e.clientY - rect.top) / rect.height) * 100 - 50;
    setTilt({
      rX: (py / 50) * -6,
      rY: (px / 50) * 8,
    });
  };

  const onLeave = () => setTilt({ rX: 0, rY: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rX}deg) rotateY(${tilt.rY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className='relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-fit cursor-pointer'
    >
      {pulse && !prefersReducedMotion && (
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer' />
      )}
      <div className={cn('rounded-xl p-3 w-fit', color)}>
        <span className='text-xs font-semibold'>Get ready for your interview</span>
      </div>
      {activeId === 'ai-interview' && (
        <div className='mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-9 w-9 rounded-md bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center'>
              <Image
                src='/favicon.svg'
                alt='Nexus AI'
                width={24}
                height={24}
                className='absolute'
              />
            </div>
            <div className='flex-1'>
              <div className='text-sm font-medium text-gray-900'>Nexus AI Interviewer</div>
              <div className='text-xs text-gray-500'>Ready to begin your session</div>
            </div>
            <div className='h-6 w-6 rounded-full bg-brand-light/20 flex items-center justify-center'>
              <div className='h-2 w-2 rounded-full bg-brand-light animate-ping' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-xs text-gray-500'>Estimated time: 10-15 mins</div>
            <Button
              size='sm'
              className='h-8 px-4 bg-brand hover:bg-brand/90 text-white text-xs rounded-full'
            >
              Start Interview
            </Button>
          </div>
        </div>
      )}

      {activeId === 'feedback-scoring' && (
        <div className='mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm'>
          <div className='flex gap-3 items-start'>
            <div className='h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5'>
              <Bot className='h-3.5 w-3.5 text-brand' />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-gray-900'>Nexus AI</span>
              <p className='text-[11px] text-gray-600 leading-relaxed'>
                Great job finding the base case. Your time complexity is{' '}
                <span className='font-mono text-brand bg-brand/10 px-1 rounded font-semibold'>
                  O(N^2)
                </span>
                . Can you optimize it using a Hash Map?
              </p>
            </div>
          </div>
        </div>
      )}

      {activeId === 'conversation' && (
        <div className='mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm flex flex-col gap-3'>
          <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
            <span className='text-xs font-semibold text-gray-900'>Session History</span>
            <span className='text-[10px] text-gray-500'>2 mins ago</span>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='bg-gray-50 rounded-lg p-2.5 text-[11px] text-gray-700 self-end max-w-[85%] border border-gray-100'>
              I think we can use a Set to track visited nodes.
            </div>
            <div className='surface-brand-soft rounded-lg p-2.5 text-[11px] text-brand-dark self-start max-w-[85%]'>
              Excellent. Implementing a visited Set correctly handles the cycles in O(1) time.
            </div>
          </div>
        </div>
      )}

      {activeId === 'recordings' && (
        <div className='mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm'>
          <div className='aspect-video rounded-lg bg-gray-900 overflow-hidden relative flex items-center justify-center group cursor-pointer shadow-inner'>
            <PlayCircle className='h-10 w-10 text-white/80 group-hover:scale-110 transition-transform duration-300' />
            <div className='absolute bottom-3 left-3 right-3 flex items-center gap-2'>
              <div className='text-[9px] text-white font-medium'>14:02</div>
              <div className='h-1 flex-1 bg-white/20 rounded-full overflow-hidden'>
                <div className='h-full bg-red-500 w-1/3 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeId === 'scoring' && (
        <div className='mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm flex items-center gap-4'>
          <div className='h-14 w-14 rounded-full border-[5px] border-brand-light flex items-center justify-center shrink-0 shadow-sm'>
            <span className='text-lg font-bold text-gray-900 tracking-tight'>8.5</span>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-bold text-gray-900'>Strong Performance</span>
            <span className='text-[11px] text-gray-500 leading-snug'>
              You passed 4/5 test cases and optimized the brute force correctly.
            </span>
          </div>
        </div>
      )}
      <div className='mt-4 flex items-center gap-2 text-[11px] text-gray-500'>
        <Shield className='h-4 w-4 text-green-500' />
        <span>Secure & private session</span>
      </div>
    </div>
  );
}

export default function Features() {
  const [active, setActive] = useState<string>(TABS[0].id); // default first tab
  const activeTab = TABS.find((t) => t.id === active) || TABS[0];
  const [pulse, setPulse] = useState(false);

  const tabStats: Record<string, { k: string; v: string }[]> = {
    'ai-interview': [
      { k: 'DSA coverage', v: '100%' },
      { k: 'Time saved', v: '10–15m' },
      { k: 'Adaptive', v: 'Yes' },
    ],
    'feedback-scoring': [
      { k: 'Instant scoring', v: 'Yes' },
      { k: 'Hints provided', v: 'Yes' },
      { k: 'Session score', v: '0–10' },
    ],
    conversation: [
      { k: 'Attempts logged', v: 'All' },
      { k: 'AI corrections', v: 'Yes' },
      { k: 'Session summaries', v: 'Generated' },
    ],
    recordings: [
      { k: 'Video optional', v: 'Yes' },
      { k: 'Transcripts', v: 'Auto' },
      { k: 'Shareable', v: 'Yes' },
    ],
    scoring: [
      { k: 'Partial credit', v: 'Yes' },
      { k: 'Best attempts', v: 'Used' },
      { k: 'Export', v: 'Available' },
    ],
  };

  const tabColors: Record<string, 'red' | 'purple' | 'blue'> = {
    'ai-interview': 'red',
    'feedback-scoring': 'purple',
    conversation: 'blue',
    recordings: 'red',
    scoring: 'purple',
  };

  return (
    <section id='features' className='py-24 px-6 md:px-12 bg-white relative overflow-hidden'>
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      <div className='mx-auto max-w-7xl relative z-10'>
        <SectionHeader
          eyebrow='Features'
          title='A powerhouse AI interviewer that feels natural.'
          subtitle='Pick a capability to see how it works. Smooth, focused UI — no clutter, no gimmicks.'
          center
        />

        <Tabs value={active} onValueChange={setActive} className='mt-4'>
          <div className='flex justify-center'>
            <TabsList className='relative flex max-w-full overflow-x-auto no-scrollbar p-1 bg-input/50 h-auto w-full gap-1 items-start flex-row tracking-normal leading-5 rounded-sm my-2 mx-0'>
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className={cn(
                    'relative isolate cursor-pointer rounded-sm px-3.5 md:px-4 py-1.5 md:py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900',
                  )}
                >
                  {active === t.id && (
                    <MotionSpan
                      layoutId='tab-pill'
                      className='absolute inset-0 z-0 rounded-sm bg-white shadow-md'
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className='relative z-10 flex items-center gap-2'>
                    <t.icon className='h-4 w-4 text-brand' />
                    <span className='hidden sm:inline'>{t.label}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className='mt-10'>
            <AnimatePresence mode='wait'>
              <MotionDiv
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12'
              >
                <DemoCard pulse={pulse} activeId={active} />

                <MotionDiv
                  layout
                  className='rounded-2xl border border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300'
                >
                  <div className='flex gap-3 items-center'>
                    <activeTab.icon className='h-5 w-5 text-brand' />
                    <h3 className='text-xl md:text-2xl font-semibold text-gray-900'>
                      {activeTab.title}
                    </h3>
                  </div>
                  <p className='mt-3 text-sm text-gray-600'>{activeTab.copy}</p>

                  {activeTab.bullets?.length && (
                    <MotionUl
                      initial='hidden'
                      animate='visible'
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                      className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6'
                    >
                      {activeTab.bullets.map((b) => (
                        <MotionLi
                          key={b}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: { opacity: 1, x: 0 },
                          }}
                          transition={{ duration: 0.3 }}
                          className='flex items-center gap-2 text-sm text-gray-700'
                        >
                          <CheckCircle2 className='h-4 w-4 text-brand' />
                          {b}
                        </MotionLi>
                      ))}
                    </MotionUl>
                  )}

                  <div className='mt-6 grid grid-cols-3 gap-3'>
                    {tabStats[active].map((s) => (
                      <div
                        key={s.k}
                        className='rounded-xl border border-gray-200 bg-white/80 p-3 text-center hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer'
                      >
                        <div className='text-xs text-gray-500'>{s.k}</div>
                        <div className='mt-1 text-sm font-semibold text-gray-900'>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    className='mt-6 flex flex-wrap items-center gap-3 animate-fade-in-up'
                    style={{ animationDelay: '300ms' }}
                  >
                    <div className='hover:scale-105 active:scale-95 transition-transform'>
                      <Button
                        className='h-9 rounded-full px-4 bg-brand hover:bg-brand/90 text-white'
                        onClick={() => {
                          setPulse(false);
                          requestAnimationFrame(() => {
                            setPulse(true);
                            setTimeout(() => setPulse(false), 1150);
                          });
                        }}
                      >
                        <PlayCircle className='mr-2 h-4 w-4' />
                        See it in action
                      </Button>
                    </div>
                    <div className='hover:scale-105 active:scale-95 transition-transform'>
                      <Button variant='outline' className='h-9 rounded-full px-4 bg-transparent'>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Read docs
                      </Button>
                    </div>
                  </div>
                </MotionDiv>
              </MotionDiv>
            </AnimatePresence>

            {TABS.map((t) => (
              <TabsContent key={t.id} value={t.id} className='sr-only' />
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
