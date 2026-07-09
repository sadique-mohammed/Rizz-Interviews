'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function EmailSignup() {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <section id='contact' className='py-24 px-6 md:px-12 relative overflow-hidden'>
      {/* Background with subtle glow */}
      <div className='absolute inset-0 bg-gray-50/50' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-brand/10 blur-[120px] rounded-full pointer-events-none' />

      <div className='mx-auto max-w-4xl relative z-10'>
        <div
          className='rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-10 md:p-16 shadow-[0_8px_40px_rgb(0,0,0,0.04)] text-center animate-fade-in-up'
          style={{ animationDelay: '0ms' }}
        >
          <h2 className='text-3xl md:text-5xl font-bold text-gray-900 tracking-tight'>
            Ready to ace your next interview?
          </h2>
          <p className='mt-5 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            Join thousands of developers who trust Nexus AI for seamless, adaptive interview
            preparation. Free practice sessions available now.
          </p>

          <div className='mt-10 max-w-md mx-auto'>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3' noValidate>
                <div className='flex-1'>
                  <label htmlFor='email' className='sr-only'>
                    Work email
                  </label>
                  <input
                    id='email'
                    type='email'
                    name='email'
                    autoComplete='email'
                    inputMode='email'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder='Enter your work email'
                    className='w-full px-2 py-2 h-10 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                    required
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'email-error' : undefined}
                  />
                  {error && (
                    <p id='email-error' className='mt-1 text-sm text-destructive' role='alert'>
                      {error}
                    </p>
                  )}
                </div>
                <Button
                  type='submit'
                  className='px-6 py-2 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors w-full sm:w-auto'
                >
                  Get Started
                </Button>
              </form>
            ) : (
              <div className='flex items-center justify-center gap-3 surface-brand-soft rounded-2xl py-4 px-6 animate-fade-in-up'>
                <CheckCircle2 className='w-6 h-6 text-brand shrink-0' />
                <div className='text-left'>
                  <h3 className='text-sm font-semibold text-gray-900'>You're on the list!</h3>
                  <p className='text-xs text-gray-600'>We'll send your invitation shortly.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
