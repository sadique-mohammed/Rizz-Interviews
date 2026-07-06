'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-brand/5 via-white to-white'>
      <div className='text-center max-w-md px-6'>
        <div className='mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4'>
            <svg
              className='w-8 h-8 text-destructive'
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
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Something went wrong!</h2>
          <p className='text-gray-600 mb-6'>
            We encountered an error while loading your dashboard. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className='btn-brand inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg'
        >
          Try again
        </button>
      </div>
    </div>
  );
}
