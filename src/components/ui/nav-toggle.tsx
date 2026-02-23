'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MotionSpan = dynamic(() => import('framer-motion').then((mod) => mod.motion.span), {
  ssr: false,
});

const INTERVIEW_HREF = '/interview';

const navLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: INTERVIEW_HREF, label: 'Start Interview' },
  { href: '/history', label: 'History' },
];

interface NavToggleProps {
  onInterviewClick?: () => void;
  selectedValueOverride?: string;
  interviewHref?: string;
}

export default function NavToggle({
  onInterviewClick,
  selectedValueOverride,
  interviewHref,
}: NavToggleProps) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedValue = React.useMemo(() => {
    if (selectedValueOverride) return selectedValueOverride;
    const match = navLinks.find((l) => l.href !== INTERVIEW_HREF && pathname.startsWith(l.href));
    return match?.href ?? '/dashboard';
  }, [pathname, selectedValueOverride]);

  const handleChange = (value: string) => {
    if (value === INTERVIEW_HREF) {
      if (interviewHref) {
        router.push(interviewHref);
        return;
      }
      onInterviewClick?.();
      return;
    }
    router.push(value);
  };

  return (
    <nav className='hidden md:block'>
      <Tabs value={selectedValue} onValueChange={handleChange}>
        <TabsList className='relative flex h-10 w-full grid-cols-3 flex-row items-start gap-1 overflow-x-auto rounded-full bg-input/50 p-1 tracking-normal leading-5 no-scrollbar'>
          {navLinks.map((link) => (
            <TabsTrigger
              key={link.href}
              value={link.href}
              className={cn(
                'relative isolate h-full cursor-pointer rounded-full px-3 text-sm font-medium transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=active]:text-gray-900',
              )}
            >
              {selectedValue === link.href && (
                <MotionSpan
                  layoutId='nav-pill'
                  className='absolute inset-0 z-0 rounded-full bg-white shadow-sm'
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className='relative z-10 px-10'>{link.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
}
