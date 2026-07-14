import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
import { db } from '@/db';
import { users } from '@/db/schema';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `ratelimit_demo_login_${ip}`,
    );

    if (!success) {
      console.warn(`[RateLimit] Demo login blocked for IP: ${ip}`);
      return NextResponse.json(
        {
          error:
            'Demo account creation rate limit exceeded. Only 3 demo accounts can be created per hour to prevent abuse. Please sign up with your own email to continue practicing.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        },
      );
    }

    const client = await clerkClient();

    const randomId = crypto.randomUUID().split('-')[0];
    const demoEmail = `guest-${randomId}@demo.nexus-ai.com`;
    const demoPassword = `Demo${crypto.randomUUID()}!`;

    const user = await client.users.createUser({
      emailAddress: [demoEmail],
      password: demoPassword,
      firstName: 'Guest',
      lastName: 'User',
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });

    // Explicitly sync to DB so we don't rely entirely on webhooks (especially for local dev)
    try {
      await db
        .insert(users)
        .values({
          id: user.id,
          name: 'Guest User',
          email: demoEmail,
          authProvider: 'clerk',
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (dbError) {
      console.error('Failed to sync demo user to local DB:', dbError);
      // We continue since the webhook might still catch it
    }

    const token = await client.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    });

    return NextResponse.json({ ticket: token.token });
  } catch (error) {
    console.error('Failed to create demo user:', error);
    return NextResponse.json({ error: 'Failed to create demo session' }, { status: 500 });
  }
}
