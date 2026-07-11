'use client';
import { SignedOut, SignIn, SignUp } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

function AuthSkeleton() {
  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-b from-brand/5 via-white to-white'>
      <div className='w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-200'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-gray-200 rounded w-3/4 mx-auto'></div>
          <div className='space-y-4'>
            <div className='h-10 bg-gray-200 rounded'></div>
            <div className='h-10 bg-gray-200 rounded'></div>
            <div className='h-10 bg-gray-200 rounded w-1/2'></div>
          </div>
          <div className='h-12 bg-brand/20 rounded'></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthClientPage() {
  const pathname = usePathname();
  const isSignUp = pathname?.includes('sign-up');

  return (
    <Suspense fallback={<AuthSkeleton />}>
      <div className='flex items-center justify-center h-screen bg-gradient-to-b from-brand/5 via-white to-white'>
        <SignedOut>
          {isSignUp ? (
            <SignUp signInUrl="/auth" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" />
          ) : (
            <SignIn signUpUrl="/auth/sign-up" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" />
          )}
        </SignedOut>
      </div>
    </Suspense>
  );
}
