'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Rocket,
  Sparkles,
  Code,
  MessagesSquare,
  Scan,
  BarChart3,
  GitBranch,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import SectionHeader from './section-header';

// ─── Step Data ──────────────────────────────────────────────────────────────

type PipelineStepData = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  description: string;
};

const STEPS: PipelineStepData[] = [
  {
    icon: Rocket,
    title: 'Session Initialization',
    description:
      'Select DSA or Web Dev, set difficulty and duration. AI configures the session.',
  },
  {
    icon: Sparkles,
    title: 'Adaptive Question Generation',
    badge: 'LLM',
    description:
      'Groq generates a difficulty-calibrated problem tailored to your level.',
  },
  {
    icon: Code,
    title: 'Live Coding Environment',
    description:
      'Write your solution in the integrated editor with syntax highlighting.',
  },
  {
    icon: MessagesSquare,
    title: 'Real-Time AI Conversation',
    badge: 'streaming',
    description:
      'Chat with the interviewer for hints, clarifications, and follow-ups.',
  },
  {
    icon: Scan,
    title: 'Structured Evaluation',
    badge: 'Gemini Flash',
    description:
      'Your answer is scored across correctness, complexity, and communication.',
  },
  {
    icon: BarChart3,
    title: 'Instant Feedback Loop',
    badge: '0–10',
    description:
      'Per-question score with actionable improvements delivered immediately.',
  },
  {
    icon: GitBranch,
    title: 'Difficulty Adaptation',
    description:
      'AI adjusts — harder problems if you ace it, follow-ups if you struggle.',
  },
  {
    icon: Trophy,
    title: 'Session Analytics',
    description:
      'Complete Q&A history, score breakdown, and exportable results.',
  },
];

const METRICS = [
  { label: 'Avg Latency', value: '~1.4s' },
  { label: 'Context Window', value: '1M Tokens' },
  { label: 'Avg Score', value: '8.5/10' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function InterviewPipeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id='how-it-works'
      className='py-24 px-6 md:px-12 bg-white relative overflow-hidden'
    >
      {/* Subtle grid background — matches Features section */}
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
          eyebrow='How It Works'
          title='From question to feedback in under 3 seconds.'
          subtitle='Every interview session runs through an 8-stage pipeline — adaptive, evaluated, and instant.'
          center
        />

        {/* Pipeline container */}
        <div
          ref={sectionRef}
          className={`mx-auto max-w-2xl ${visible ? 'pipeline-visible' : ''}`}
        >
          {/* Status bar */}
          <div
            className='surface-brand rounded-xl px-5 py-3.5 flex items-center justify-between pipeline-step'
            style={{ animationDelay: '0ms' }}
          >
            <div className='flex items-center gap-2.5'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-light opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-brand-light' />
              </span>
              <span className='text-sm font-medium text-gray-700'>
                Processing interview session…
              </span>
            </div>
            <span className='badge-brand-soft text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide'>
              Gemini + Groq Orchestration
            </span>
          </div>

          {/* Metric pills */}
          <div
            className='grid grid-cols-3 gap-3 mt-4 pipeline-step'
            style={{ animationDelay: '100ms' }}
          >
            {METRICS.map((m) => (
              <div
                key={m.label}
                className='rounded-xl border border-gray-200 bg-white/80 p-3 text-center hover:-translate-y-0.5 transition-transform duration-200'
              >
                <div className='text-[10px] uppercase tracking-wider text-gray-400 font-medium'>
                  {m.label}
                </div>
                <div className='mt-1 text-lg font-bold text-gray-900'>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline steps */}
          <div className='relative mt-10'>
            {/* Connector line */}
            <div
              className='pipeline-line absolute left-[17px] top-[36px] bottom-[36px] w-[2px] hidden md:block z-0'
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,165,207,0.4), rgba(37,161,142,0.3), rgba(159,254,203,0.1))',
              }}
            />

            <div className='space-y-4 relative z-10'>
              {STEPS.map((step, i) => (
                <PipelineStepCard
                  key={step.title}
                  step={step}
                  delay={300 + i * 200}
                  checkDelay={300 + i * 200 + 150}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Step Card ──────────────────────────────────────────────────────────────

function PipelineStepCard({
  step,
  delay,
  checkDelay,
}: {
  step: PipelineStepData;
  delay: number;
  checkDelay: number;
}) {
  const Icon = step.icon;

  return (
    <div
      className='pipeline-step flex items-center gap-4 md:gap-6 relative cursor-pointer group'
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon (Left Column) */}
      <div className='relative z-20 flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white ring-[4px] ring-white shadow-sm border border-gray-100 md:flex'>
        <div className='absolute inset-0 rounded-full bg-brand/10' />
        <Icon className='relative z-10 h-4 w-4 text-brand' />
      </div>

      {/* Card (Right Column) */}
      <div className='flex-1 surface-brand-soft rounded-xl p-4 transition-all duration-300 hover:border-brand/30 hover:bg-brand/5 hover:shadow-sm flex items-center gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h4 className='text-sm font-semibold text-gray-900'>
              {step.title}
            </h4>
            {step.badge && (
              <span className='badge-brand-soft text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                {step.badge}
              </span>
            )}
          </div>
          <p className='mt-1 text-xs text-gray-500 leading-relaxed'>
            {step.description}
          </p>
        </div>

        {/* Checkmark */}
        <div
          className='pipeline-check shrink-0'
          style={{ animationDelay: `${checkDelay}ms` }}
        >
          <CheckCircle2 className='h-5 w-5 text-brand-secondary' />
        </div>
      </div>
    </div>
  );
}
