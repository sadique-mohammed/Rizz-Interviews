'use client';

import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id='contact'
      className='bg-neutral-950 text-neutral-100 border-t border-neutral-800 border-t-gradient'
    >
      <div className='mx-auto max-w-7xl py-12 px-6 md:px-12'>
        <div className='flex flex-col md:flex-row items-center md:items-start justify-between gap-6'>
          <div className='text-center md:text-left'>
            <div className='font-bold text-lg text-gradient'>Nexus AI</div>
            <p className='mt-2 text-sm text-neutral-400'>© 2025 Nexus AI. All rights reserved.</p>
          </div>
          <div className='flex items-center gap-6'>
            {[
              { href: '#features', label: 'Features' },
              { href: '#how', label: 'How it Works' },
              { href: '#contact', label: 'Contact' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className='text-sm text-neutral-300 hover:text-white transition-colors'
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className='flex items-center gap-4'>
            <a
              href='https://linkedin.com'
              target='_blank'
              rel='noreferrer'
              aria-label='LinkedIn'
              className='text-neutral-300 hover:text-white transition-colors'
            >
              <Linkedin className='h-5 w-5' />
            </a>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noreferrer'
              aria-label='Twitter'
              className='text-neutral-300 hover:text-white transition-colors'
            >
              <Twitter className='h-5 w-5' />
            </a>
            <a
              href='https://github.com'
              target='_blank'
              rel='noreferrer'
              aria-label='GitHub'
              className='text-neutral-300 hover:text-white transition-colors'
            >
              <Github className='h-5 w-5' />
            </a>
          </div>
        </div>
      </div>
      <script src='https://elfsightcdn.com/platform.js' async></script>
      <div
        className='elfsight-app-c8a685b7-ca54-4fd3-9eda-0f22fb2e9203'
        data-elfsight-app-lazy
      ></div>
    </footer>
  );
}
