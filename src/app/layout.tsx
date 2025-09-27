import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus",
  description:
    "Nexus – your personal AI-powered interview and career prep dashboard. Track progress, manage sessions, and stay ahead with an all-in-one platform.",
  applicationName: "Nexus",
  authors: [{ name: "Sadique", url: "https://github.com/sadique-mohammed" }],
  keywords: [
    "Nexus",
    "Interview Prep",
    "Next.js",
    "TypeScript",
    "Redux Toolkit",
    "Career Dashboard",
    "AI-powered",
    "Productivity",
    "Job Search",
    "Tech Interviews",
    "Coding Practice",
    "Mock Interviews",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <link rel="icon" href="/favicon.svg" />
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
