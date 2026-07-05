import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// Allow 3 demo logins per hour per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. IP-based Rate Limiting
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
    const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_demo_login_${ip}`);

    if (!success) {
      console.warn(`[RateLimit] Demo login blocked for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Demo account creation rate limit exceeded. Only 3 demo accounts can be created per hour to prevent abuse. Please sign up with your own email to continue practicing.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const client = await clerkClient();
    
    // Generate a random 8-character string for the guest email
    const randomId = crypto.randomUUID().split('-')[0];
    const demoEmail = `guest-${randomId}@demo.nexus-ai.com`;
    const demoPassword = `Demo${crypto.randomUUID()}!`;

    // Create a verified user in Clerk
    const user = await client.users.createUser({
      emailAddress: [demoEmail],
      password: demoPassword,
      firstName: 'Guest',
      lastName: 'User',
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });

    // Generate a sign-in token (expires in 5 minutes)
    const token = await client.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    });

    return NextResponse.json({ ticket: token.token });
  } catch (error) {
    console.error('Failed to create demo user:', error);
    return NextResponse.json(
      { error: 'Failed to create demo session' },
      { status: 500 }
    );
  }
}
