import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Nexus - AI-Powered Interview Preparation Platform',
  description:
    'Nexus – your personal AI-powered interview and career prep dashboard. Track progress, manage sessions, and stay ahead with an all-in-one platform.',
  applicationName: 'Nexus',
  authors: [{ name: 'Sadique', url: 'https://github.com/sadique-mohammed' }],
  keywords: [
    'Nexus',
    'Interview Prep',
    'Next.js',
    'TypeScript',
    'Redux Toolkit',
    'Career Dashboard',
    'AI-powered',
    'Productivity',
    'Job Search',
    'Tech Interviews',
    'Coding Practice',
    'Mock Interviews',
  ],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Nexus - AI-Powered Interview Preparation',
    description:
      'Master technical interviews with AI-powered practice sessions. Track your progress and ace your next interview.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Nexus',
    images: [
      {
        url: '/interview.png',
        width: 800,
        height: 450,
        alt: 'Nexus AI Interview Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus - AI-Powered Interview Preparation',
    description: 'Master technical interviews with AI-powered practice sessions.',
    images: ['/interview.png'],
  },
  verification: {
    google: 'EiG6rZQFaYQOK6FwDYrt1wOMTo-qi5vRIIL4X1F09gU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl='/dashboard' signUpFallbackRedirectUrl='/dashboard'>
      <html lang='en' suppressHydrationWarning>
        <head>
          <link rel='icon' href='/favicon.svg' />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow'
          >
            Skip to main content
          </a>
          <main id='main-content'>{children}</main>
          <Toaster richColors position='bottom-right' />
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
