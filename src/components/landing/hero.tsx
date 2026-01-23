'use client';

import type React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  // Card tilt
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rX = useSpring(useTransform(ty, [-50, 50], [8, -8]), {
    stiffness: 180,
    damping: 16,
    mass: 0.4,
  });
  const rY = useSpring(useTransform(tx, [-50, 50], [-10, 10]), {
    stiffness: 180,
    damping: 16,
    mass: 0.4,
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100 - 50;
    const py = ((e.clientY - rect.top) / rect.height) * 100 - 50;
    tx.set(px);
    ty.set(py);
  };
  const handleLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  // Magnetic CTA
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mxs = useSpring(mx, { stiffness: 300, damping: 20, mass: 0.4 });
  const mys = useSpring(my, { stiffness: 300, damping: 20, mass: 0.4 });

  return (
    <section className='relative overflow-hidden py-20 px-6 md:px-12 bg-white text-gray-900'>
      <div className='mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10'>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl md:text-5xl font-bold text-balance text-gray-900'
          >
            Master Your Next Interview with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className='mt-4 text-gray-600 max-w-xl text-pretty'
          >
            Practice with our AI interviewer, get real-time feedback, and build confidence for
            technical interviews. From coding challenges to behavioral questions, we've got you
            covered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='mt-8 flex items-center gap-3'
          >
            {/* Magnetic CTA wrapper */}
            <div className='relative'>
              <Link href='/auth' passHref>
                <motion.div
                  className='inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold btn-invert will-change-transform'
                  whileHover={{
                    scale: prefersReducedMotion ? 1 : 1.01,
                    backgroundColor: 'rgb(17, 24, 39)',
                    color: '#ffffff',
                    boxShadow: '0 6px 16px rgba(17,24,39,0.12)',
                  }}
                  style={{ x: mxs, y: mys }}
                >
                  Get Started
                </motion.div>
              </Link>
            </div>
            <a
              href='#features'
              className=' inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold border border-gray-300 text-gray-900 hover:bg-gray-50 transition-all'
            >
              Learn More
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mt-4 text-sm text-gray-500'
          >
            Free practice sessions • No credit card required
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='relative'
          aria-hidden='true'
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{
              rotateX: prefersReducedMotion ? 0 : rX,
              rotateY: prefersReducedMotion ? 0 : rY,
              transformPerspective: 900,
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
                      <div className='flex items-end gap-1'>
                        {/* Voice bars */}
                        <motion.span
                          className='w-1.5 h-4 rounded bg-[#2563eb] origin-bottom'
                          animate={{ scaleY: [1, 2, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.1,
                            ease: 'easeInOut',
                          }}
                        />
                        <motion.span
                          className='w-1.5 h-5 rounded bg-[#9333ea] origin-bottom'
                          animate={{ scaleY: [1, 2, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.3,
                            ease: 'easeInOut',
                            delay: 0.2,
                          }}
                        />
                        <motion.span
                          className='w-1.5 h-4 rounded bg-[#14b8a6] origin-bottom'
                          animate={{ scaleY: [1, 2, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.1,
                            ease: 'easeInOut',
                            delay: 0.3,
                          }}
                        />
                        <motion.span
                          className='w-1.5 h-5 rounded bg-[#2563eb] origin-bottom'
                          animate={{ scaleY: [1, 2, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.3,
                            ease: 'easeInOut',
                            delay: 0.5,
                          }}
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

            {/* Soft light sweep on hover */}
            {!prefersReducedMotion && (
              <motion.div
                className='pointer-events-none absolute -inset-1 rounded-2xl'
                initial={false}
                animate={{
                  background:
                    'radial-gradient(600px 200px at var(--x,50%) -10%, rgba(37,99,235,0.12), transparent 40%)',
                }}
              />
            )}
          </motion.div>

          {/* Subtle glow ring remains */}
          <div className='pointer-events-none absolute -inset-1 rounded-2xl ring-1 ring-gray-200' />
        </motion.div>
      </div>
    </section>
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
