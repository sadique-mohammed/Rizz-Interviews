import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { UserInsert } from '@/types/user';

// Zod schema for webhook payload validation
const clerkUserSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email_addresses: z.array(
    z.object({
      id: z.string(),
      email_address: z.email(),
    }),
  ),
  primary_email_address_id: z.string(),
  image_url: z.string().nullable(),
  last_sign_in_at: z.number().nullable(),
});

// Zod schema for session event - contains user_id to fetch user data
const clerkSessionSchema = z.object({
  user_id: z.string(),
});

// Helper function to sync user to database
async function syncUserToDatabase(userData: UserInsert & { updatedAt: Date }) {
  await db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      where: eq(users.clerkId, userData.clerkId),
    });

    if (existingUser) {
      // Update existing user
      await tx.update(users).set(userData).where(eq(users.clerkId, userData.clerkId));
      console.log(`[Webhook] Updated user: ${userData.email}`);
    } else {
      // Insert new user
      await tx.insert(users).values(userData);
      console.log(`[Webhook] Created user: ${userData.email}`);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature for security
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    console.log(`[Webhook] Event received: ${eventType}`);

    // Handle user creation and updates
    if (eventType === 'user.created' || eventType === 'user.updated') {
      // Validate payload with Zod
      const validationResult = clerkUserSchema.safeParse(evt.data);

      if (!validationResult.success) {
        console.error('[Webhook] Invalid payload:', validationResult.error);
        return NextResponse.json(
          { error: 'Invalid webhook payload', details: validationResult.error },
          { status: 400 },
        );
      }

      const {
        id: clerkId,
        first_name,
        last_name,
        email_addresses,
        primary_email_address_id,
        image_url,
        last_sign_in_at,
      } = validationResult.data;

      // Get primary email
      const primaryEmail = email_addresses.find((email) => email.id === primary_email_address_id);

      if (!primaryEmail) {
        console.error('[Webhook] No primary email found for user:', clerkId);
        return NextResponse.json({ error: 'No primary email address found' }, { status: 400 });
      }

      // Prepare typed user data
      const userData: UserInsert & { updatedAt: Date } = {
        clerkId,
        name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
        email: primaryEmail.email_address,
        imageUrl: image_url || null,
        authProvider: 'clerk',
        lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : null,
        updatedAt: new Date(),
      };

      await syncUserToDatabase(userData);

      return NextResponse.json(
        { success: true, message: 'User synced successfully' },
        { status: 200 },
      );
    }

    // Handle session.created - Sync user if they don't exist in our DB yet
    // This handles users created before webhook was set up
    if (eventType === 'session.created') {
      const sessionResult = clerkSessionSchema.safeParse(evt.data);

      if (!sessionResult.success) {
        console.error('[Webhook] Invalid session payload:', sessionResult.error);
        return NextResponse.json({ error: 'Invalid session payload' }, { status: 400 });
      }

      const { user_id: clerkId } = sessionResult.data;

      // Check if user already exists in our database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      if (existingUser) {
        // User already synced, just update lastSignInAt
        await db
          .update(users)
          .set({ lastSignInAt: new Date(), updatedAt: new Date() })
          .where(eq(users.clerkId, clerkId));

        console.log(`[Webhook] Updated sign-in time for: ${existingUser.email}`);
        return NextResponse.json(
          { success: true, message: 'User sign-in recorded' },
          { status: 200 },
        );
      }

      // User doesn't exist - fetch from Clerk Backend API and create
      console.log(`[Webhook] User not in DB, fetching from Clerk: ${clerkId}`);

      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);

      if (!clerkUser) {
        console.error('[Webhook] User not found in Clerk:', clerkId);
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }

      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      );

      if (!primaryEmail) {
        console.error('[Webhook] No primary email for user:', clerkId);
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      const userData: UserInsert & { updatedAt: Date } = {
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        email: primaryEmail.emailAddress,
        imageUrl: clerkUser.imageUrl || null,
        authProvider: 'clerk',
        lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : new Date(),
        updatedAt: new Date(),
      };

      await syncUserToDatabase(userData);

      return NextResponse.json(
        { success: true, message: 'User created from session' },
        { status: 200 },
      );
    }

    // Handle user deletion - Keep user data for business/compliance reasons
    if (eventType === 'user.deleted') {
      const { id: clerkId } = evt.data as { id: string };

      console.log(`[Webhook] User deleted in Clerk: ${clerkId} - Keeping data for records`);

      // NOTE: We intentionally do NOT delete the user from our database
      // to preserve interview history, answers, and recordings for business analytics
      // and potential compliance requirements. The clerkId will no longer be valid
      // but historical data remains intact.

      return NextResponse.json(
        { success: true, message: 'User deletion acknowledged, data preserved' },
        { status: 200 },
      );
    }

    // Handle unsupported event types gracefully
    console.log(`[Webhook] Unhandled event type: ${eventType}`);
    return NextResponse.json(
      { success: true, message: 'Event acknowledged but not processed' },
      { status: 200 },
    );
  } catch (err) {
    const error = err as Error;
    console.error('[Webhook] Error processing webhook:', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
