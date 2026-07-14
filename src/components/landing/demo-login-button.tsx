'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DemoLoginButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const handleDemoLogin = async () => {
    if (!isLoaded) return;

    // If user is already signed in, just redirect — don't create a new demo account
    if (isSignedIn) {
      router.push('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/demo-login', { method: 'POST' });
      const data = await res.json();

      if (data.ticket) {
        const result = await signIn.create({
          strategy: 'ticket',
          ticket: data.ticket,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          router.push('/dashboard');
        } else {
          throw new Error('Failed to complete sign in flow');
        }
      } else {
        throw new Error(data.error || 'Failed to create demo session');
      }
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to start demo session. Please try again.';
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDemoLogin}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold btn-invert hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className='w-4 h-4 animate-spin mr-2' />
          Authenticating...
        </>
      ) : (
        'Try Live Demo'
      )}
    </button>
  );
}
