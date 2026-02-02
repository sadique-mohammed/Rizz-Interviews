'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps, ReactNode } from 'react';

// Lazy load framer-motion - only loads when component is rendered
const LazyMotion = dynamic(() => import('framer-motion').then((mod) => mod.LazyMotion), {
  ssr: false,
});

const domAnimation = () => import('framer-motion').then((mod) => mod.domAnimation);

// Wrapper that provides lazy-loaded framer-motion context
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

// Re-export motion components as dynamic imports
export const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), {
  ssr: false,
});

export const MotionH1 = dynamic(() => import('framer-motion').then((mod) => mod.motion.h1), {
  ssr: false,
});

export const MotionH2 = dynamic(() => import('framer-motion').then((mod) => mod.motion.h2), {
  ssr: false,
});

export const MotionP = dynamic(() => import('framer-motion').then((mod) => mod.motion.p), {
  ssr: false,
});

export const MotionSpan = dynamic(() => import('framer-motion').then((mod) => mod.motion.span), {
  ssr: false,
});

export const MotionHeader = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.header),
  { ssr: false },
);

export const MotionUl = dynamic(() => import('framer-motion').then((mod) => mod.motion.ul), {
  ssr: false,
});

export const MotionLi = dynamic(() => import('framer-motion').then((mod) => mod.motion.li), {
  ssr: false,
});

// For AnimatePresence, we need a wrapper component
export const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false },
);

// Hook exports - these need to be used within components that are already client-side
// We export a hook that lazy-loads the actual hooks
export { useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
