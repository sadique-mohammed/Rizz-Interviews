'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white'>
      <div className='text-center max-w-md px-6'>
        <div className='mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4'>
            <svg
              className='w-8 h-8 text-red-600'
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
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Interview Not Found</h2>
          <p className='text-gray-600 mb-6'>
            We couldn't load this interview session. It may have been deleted or you don't have
            access to it.
          </p>
        </div>
        <div className='flex gap-3 justify-center'>
          <button
            onClick={reset}
            className='inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
          >
            Try again
          </button>
          <a
            href='/history'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
          >
            Back to History
          </a>
        </div>
      </div>
    </div>
  );
}
