'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand/5 via-white to-white'>
      <div className='max-w-md px-6 text-center'>
        <div className='mb-6'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
            <svg
              className='h-8 w-8 text-destructive'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900'>Interview Session Error</h2>
          <p className='mb-6 text-gray-600'>
            We couldn&apos;t load your interview session. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className='btn-brand inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold'
        >
          Try again
        </button>
      </div>
    </div>
  );
}
