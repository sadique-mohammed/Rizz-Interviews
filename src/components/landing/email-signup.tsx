'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
    <section id='contact' className='py-20 px-6 md:px-12 bg-gray-50'>
      <div className='mx-auto max-w-4xl text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>
            Start Practicing with Nexus Today
          </h2>
          <p className='mt-4 text-lg text-gray-600 max-w-2xl mx-auto'>
            Join thousands of developers and professionals who trust Nexus for seamless AI-powered
            interview preparation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='mt-8'
        >
          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'
              noValidate
            >
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
                  <p id='email-error' className='mt-1 text-sm text-red-600' role='alert'>
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
            <div className='max-w-md mx-auto'>
              <div className='flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-100'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>Thanks for signing up!</h3>
              <p className='mt-2 text-gray-600'>
                We'll send you an invitation to get started with Nexus soon.
              </p>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='mt-4 text-sm text-gray-500'
        >
          No credit card required • Free practice sessions • 14-day trial
        </motion.p>
      </div>
    </section>
  );
}
