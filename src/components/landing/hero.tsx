'use client';

import type React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Bot } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
            className={`mt-8 flex items-center gap-3 ${fadeInUp}`}
            style={{ animationDelay: '100ms' }}
          >
            <Link href='/dashboard' passHref>
              <div className='inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold btn-invert hover:bg-gray-900 hover:text-white hover:shadow-lg transition-all duration-200'>
                Get Started
              </div>
            </Link>
            <a
              href='#features'
              className='inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold border border-gray-300 text-gray-900 hover:bg-gray-50 transition-all'
            >
              Learn More
            </a>
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
      <div className='relative rounded-2xl p-[1px] bg-[linear-gradient(135deg,#2563eb,#9333ea,#14b8a6)]'>
        <div className='rounded-[14px] bg-white border border-gray-200 overflow-hidden'>
          {/* Top meta bar */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200/80 bg-white/60 backdrop-blur-sm'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-500 animate-ping' />
                Live
              </span>
              <span className='text-xs text-gray-500'>AI Interview • Web Dev</span>
            </div>
            <div className='text-xs text-gray-500'>30:42</div>
          </div>

          {/* Video stage */}
          <div className='relative'>
            <Image
              src='/interview.png'
              alt='Professional candidate participating in live AI-powered technical interview session'
              width={800}
              height={450}
              priority
              className='block w-full h-[300px] md:h-[360px] object-cover bg-gray-100'
            />

            {/* Candidate name */}
            <div className='absolute left-4 bottom-4 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-xs text-gray-700 shadow-sm'>
              Candidate
            </div>

            {/* AI bot PIP */}
            <div className='absolute right-4 bottom-4'>
              <div className='flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur shadow-lg border border-gray-200 px-3 py-2'>
                <div className='h-9 w-9 rounded-full bg-gray-100 grid place-items-center border border-gray-200'>
                  <Bot className='h-5 w-5 text-gray-600' />
                </div>
                {/* Voice bars - CSS animation */}
                <div className='flex items-end gap-1'>
                  <span
                    className='w-1.5 h-4 rounded bg-[#2563eb] animate-voice-bar'
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className='w-1.5 h-5 rounded bg-[#9333ea] animate-voice-bar'
                    style={{ animationDelay: '200ms' }}
                  />
                  <span
                    className='w-1.5 h-4 rounded bg-[#14b8a6] animate-voice-bar'
                    style={{ animationDelay: '300ms' }}
                  />
                  <span
                    className='w-1.5 h-5 rounded bg-[#2563eb] animate-voice-bar'
                    style={{ animationDelay: '500ms' }}
                  />
                </div>
                <span className='text-xs text-gray-600'>Nexus AI</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <HeroControls />
        </div>
      </div>

      {/* Subtle glow ring */}
      <div className='pointer-events-none absolute -inset-1 rounded-2xl ring-1 ring-gray-200' />
    </div>
  );
}

function HeroControls() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className='flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white'>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => setMicOn((v) => !v)}
          className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic className='h-4 w-4' /> : <MicOff className='h-4 w-4 text-red-600' />}
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {camOn ? <Video className='h-4 w-4' /> : <VideoOff className='h-4 w-4 text-yellow-600' />}
        </button>
        <button
          className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          aria-label='Open hints'
        >
          <MessageSquare className='h-4 w-4' />
        </button>
      </div>

      <button
        className='inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700'
        aria-label='End interview'
      >
        <PhoneOff className='h-4 w-4' />
        End
      </button>
    </div>
  );
}
