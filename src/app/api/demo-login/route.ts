import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function POST(req: Request): Promise<NextResponse> {
  try {
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
