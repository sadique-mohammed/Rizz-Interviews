import { interviews, users } from '@/utils/mockData';
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
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userInterviews = interviews
    .filter((i) => i.userId === userData.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 3);
  return NextResponse.json(userInterviews);
}
