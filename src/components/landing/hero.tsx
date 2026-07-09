'use client';

import type React from 'react';
import { Bot } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import DemoLoginButton from './demo-login-button';

// CSS-based fade-in animation for critical above-the-fold content
const fadeInUp = 'animate-fade-in-up';

export default function Hero() {
  return (
    <section className='relative overflow-hidden py-20 px-6 md:px-12 bg-white text-gray-900'>
      <div className='mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10'>
        <div>
          <h1
            className={`text-4xl md:text-5xl font-bold text-balance text-gray-900 ${fadeInUp}`}
            style={{ animationDelay: '0ms' }}
          >
            Master Your Next Interview with AI
          </h1>
          <p
            className={`mt-4 text-gray-600 max-w-xl text-pretty ${fadeInUp}`}
            style={{ animationDelay: '50ms' }}
          >
            Practice with our AI interviewer, get real-time feedback, and build confidence for
            technical interviews. From coding challenges to behavioral questions, we've got you
            covered.
          </p>

          <div
            className={`mt-8 flex flex-col items-start gap-4 w-full sm:w-auto ${fadeInUp}`}
            style={{ animationDelay: '100ms' }}
          >
            <div className='flex flex-row items-center gap-3 w-full sm:w-auto'>
              <Link
                href='/dashboard'
                className='flex-1 sm:flex-none w-full inline-flex items-center justify-center rounded-xl px-6 sm:px-10 py-2 text-sm font-semibold btn-invert hover:shadow-lg transition-all duration-200'
              >
                Get Started
              </Link>
              <a
                href='#features'
                className='flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-6 sm:px-10 py-2 text-sm font-semibold border border-gray-300 text-gray-900 hover:bg-gray-50 transition-all'
              >
                Learn More
              </a>
            </div>
            <div className='w-full sm:w-auto flex'>
              <DemoLoginButton className='w-full sm:w-auto px-6 sm:px-10' />
            </div>
          </div>

          <p
            className={`mt-4 text-sm text-gray-500 ${fadeInUp}`}
            style={{ animationDelay: '200ms' }}
          >
            Free practice sessions • No credit card required
          </p>
        </div>

        {/* Hero Card - Uses CSS for initial animation, vanilla JS for tilt */}
        <div
          className={`relative ${fadeInUp}`}
          style={{ animationDelay: '100ms' }}
          aria-hidden='true'
        >
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

// Interactive card with tilt effect using vanilla JS (no framer-motion)
function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rX: 0, rY: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100 - 50;
    const py = ((e.clientY - rect.top) / rect.height) * 100 - 50;
    setTilt({
      rX: (py / 50) * -8,
      rY: (px / 50) * 10,
    });
  };

  const handleLeave = () => setTilt({ rX: 0, rY: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rX}deg) rotateY(${tilt.rY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className='relative rounded-2xl overflow-hidden shadow-sm'
    >
      {/* Gradient frame */}
      <div className='bg-tech-gradient relative rounded-2xl p-[1px]'>
        <div className='rounded-[14px] bg-white border border-gray-200 overflow-hidden'>
          {/* Top meta bar */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200/80 bg-white/60 backdrop-blur-sm'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center gap-2 rounded-full bg-brand-light/20 px-2.5 py-1 text-xs font-medium text-brand-dark'>
                <span className='h-1.5 w-1.5 rounded-full bg-brand-light animate-ping' />
                Live
              </span>
              <span className='text-xs text-gray-500'>AI Interview • Web Dev</span>
            </div>
            <div className='text-xs text-gray-500'>30:42</div>
          </div>

          {/* IDE Stage */}
          <div className='relative flex flex-col md:flex-row h-[300px] md:h-[360px] bg-white/40 backdrop-blur-sm'>
            {/* Left Panel: Problem Statement */}
            <div className='w-full md:w-1/3 p-5 border-r border-gray-200/50 overflow-hidden relative flex-col hidden md:flex'>
              <div className='flex-1'>
                <h3 className='text-sm font-bold text-gray-900 mb-2'>Invert Binary Tree</h3>
                <p className='text-xs text-gray-700 leading-relaxed mb-3'>
                  Given the{' '}
                  <code className='rounded bg-brand/10 px-1.5 py-0.5 text-brand'>root</code> of a
                  binary tree, invert the tree, and return its root.
                </p>
                <div className='bg-white/80 rounded-lg p-2.5 text-[8px] xl:text-[9px] font-mono text-gray-800 leading-[1.4] border border-gray-200/60 shadow-sm whitespace-pre'>
                  {'     4           4\n'}
                  {'   /   \\  =>   /   \\\n'}
                  {'  2     7     7     2\n'}
                  {' / \\   / \\   / \\   / \\\n'}
                  {'1   3 6   9 9   6 3   1'}
                </div>
              </div>

              {/* AI bot PIP moved to bottom of left panel */}
              <div className='mt-auto pt-4 relative z-10'>
                <div className='flex items-start gap-3 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100/50 px-3 py-2.5 transform hover:-translate-y-1 transition-transform duration-300'>
                  <div className='mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-brand/20 bg-gradient-to-tr from-brand/15 to-brand-secondary/10 shadow-inner'>
                    <Bot className='h-3.5 w-3.5 text-brand' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-[9px] font-bold text-gray-900 uppercase tracking-wider'>
                      Nexus AI
                    </span>
                    <span className='text-[10px] text-gray-600 leading-snug mt-1'>
                      Elegant! Swapping the children before recursing is highly efficient.
                    </span>
                  </div>
                </div>
              </div>

              {/* Fade out bottom text to avoid overflow */}
              <div className='absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent pointer-events-none'></div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className='w-full md:w-2/3 flex flex-col bg-white/80 backdrop-blur-md relative'>
              <div className='flex px-4 py-2.5 bg-white/50 text-[11px] font-medium text-gray-400 font-mono border-b border-gray-100 shadow-sm z-10'>
                <span className='flex items-center gap-2 text-gray-500'>
                  <span className='h-2 w-2 rounded-full bg-brand/80'></span>
                  solution.py
                </span>
              </div>
              <div className='p-5 text-[11px] sm:text-xs font-mono text-gray-600 overflow-hidden leading-[1.7]'>
                <span className='text-brand-dark'>class</span>{' '}
                <span className='text-brand'>Solution</span>:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className='text-brand-dark'>def</span>{' '}
                <span className='text-brand'>invertTree</span>(
                <span className='text-brand-secondary'>self</span>, root):
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className='text-brand-dark'>if not</span> root:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className='text-brand-dark'>return</span>{' '}
                <span className='text-brand-secondary'>None</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;temp = root.left
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;root.left = root.right
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;root.right = temp
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className='text-brand-secondary'>self</span>.
                <span className='text-brand'>invertTree</span>(root.left)
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className='text-brand-secondary'>self</span>.
                <span className='text-brand'>invertTree</span>(root.right)
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className='text-brand-dark'>return</span> root
                <span className='ml-1 inline-block h-3.5 w-[1.5px] animate-pulse align-middle bg-brand'></span>
              </div>

              {/* Candidate Voice Transcription */}
              <div className='absolute left-5 bottom-5 z-10'>
                <div className='flex items-start gap-3 rounded-2xl bg-gray-900/90 backdrop-blur-md shadow-2xl border border-gray-700/50 px-4 py-3 max-w-[220px] sm:max-w-[280px]'>
                  <div className='flex gap-1 items-end h-3 shrink-0 mt-1'>
                    <span className='w-0.5 h-full bg-brand-light animate-pulse'></span>
                    <span
                      className='w-0.5 h-2/3 bg-brand-light animate-pulse'
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className='w-0.5 h-full bg-brand-light animate-pulse'
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                  <p className='text-[10px] text-gray-200 leading-[1.5]'>
                    "Time complexity is <span className='font-mono text-brand-light'>O(n)</span>{' '}
                    since every node is visited once. Space is{' '}
                    <span className='font-mono text-brand-light'>O(h)</span> for the recursive
                    stack—best case <span className='font-mono text-brand-light'>O(log n)</span>,
                    worst case <span className='font-mono text-brand-light'>O(n)</span>."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <HeroControls />
        </div>
      </div>

      {/* Subtle glow ring */}
      <div className='pointer-events-none absolute -inset-1 rounded-2xl ring-1 ring-gray-200/50' />
    </div>
  );
}

function HeroControls() {
  return (
    <div className='flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-md relative z-20'>
      <div className='flex items-center gap-2'>
        <button
          className='inline-flex items-center justify-center rounded-lg border border-gray-200/80 bg-white/50 px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all'
          aria-label='Console'
        >
          Console
        </button>
      </div>

      <div className='flex items-center gap-3'>
        <button
          className='inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors'
          aria-label='Run Code'
        >
          Run Code
        </button>
        <button
          className='inline-flex items-center gap-2 rounded-xl px-5 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10'
          aria-label='Submit Answer'
        >
          Submit
        </button>
      </div>
    </div>
  );
}
