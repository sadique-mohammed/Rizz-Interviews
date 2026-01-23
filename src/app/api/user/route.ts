import { users } from '@/utils/mockData';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const userData = users.find((u) => u.email === email);
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(userData);
}
