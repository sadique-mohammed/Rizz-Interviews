'use client';

import Link from 'next/link';
import Image from 'next/image';
import DemoLoginButton from './demo-login-button';

export default function Navbar() {
  return (
    <header className='sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-gray-100 animate-fade-in-down'>
      <div className='mx-auto max-w-7xl py-4 px-6 md:px-12'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='font-bold text-lg tracking-tight text-gray-900'>
            <Image
              src='/favicon.svg'
              alt='RizzInterviews Logo'
              width={32}
              height={32}
              className='inline-block mr-2'
            />
            RizzInterviews
          </Link>

          <div className='hidden md:flex items-center gap-6'>
            {/* {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </a>
            ))} */}
          </div>

          <div className='flex items-center gap-3'>
            <DemoLoginButton className='hidden md:inline-flex' />
            <Link
              href='/auth/sign-in'
              className='hidden md:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 hover:text-brand transition-all duration-200'
            >
              Log In
            </Link>
            <Link
              href='/auth/sign-up'
              className='inline-flex items-center justify-center rounded-xl px-10 py-2 text-sm font-semibold btn-invert transition-all duration-200'
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
