'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import NavToggle from '@/components/ui/nav-toggle';
import InterviewDrawer from '@/components/interview/interview-drawer';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open drawer when ?startInterview=true is in the URL
  React.useEffect(() => {
    if (searchParams.get('startInterview') === 'true') {
      setIsDrawerOpen(true);
      // Clear the param so back-navigation doesn't re-trigger
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);

  return (
    <>
      <header className='sticky top-0 z-50 backdrop-blur bg-white/60 border-b border-gray-100'>
        <div className='flex items-center justify-between mx-auto max-w-7xl py-4 px-6 md:px-12'>
          <div className='flex items-center gap-4'>
            <Link
              href='/'
              className='font-bold text-lg tracking-tight text-gray-900 flex items-center'
            >
              <Image src='/favicon.svg' alt='Nexus Logo' width={32} height={32} className='mr-2' />
              Nexus AI
            </Link>
          </div>

          <NavToggle onInterviewClick={openDrawer} />
          <UserButton />
        </div>
      </header>

      <InterviewDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
}
