import Navbar from '@/components/dashboard/navbar';
import InterviewSessionCard from '@/components/dashboard/interview-session-card';
import RecentHistoryCard from '@/components/dashboard/recent-history-card';
import Footer from '@/components/landing/footer';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function fetchDashboardData() {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  const origin = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_BASE_URL;
  const url = new URL('/api/dashboard', origin);

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  if (res.status === 401) {
    redirect('/auth');
  }

  if (res.status === 404) {
    return { user: null, interviews: [] };
  }

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return res.json();
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  const user = data?.user ?? null;
  const interviews = Array.isArray(data?.interviews) ? data.interviews : [];

  return (
    <>
      <Navbar />
      <div className='mx-auto max-w-7xl px-6 py-6 mb-20'>
        <div className='mb-20'>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>
            {user?.name ? `Welcome back, ${user.name}!` : 'Welcome to Nexus!'}
          </h2>
          <p className='mx-5 text-gray-600'>
            {user?.name
              ? "Let's keep the momentum going. Practice for your next interview and ace it with confidence!"
              : "You're all set. Start your first practice session and we'll track your progress here."}
            {user?.email ? (
              <>
                <br />
                User Mail: {user.email}
              </>
            ) : null}
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          <div className='lg:col-span-2'>
            <InterviewSessionCard />
          </div>
          <div className='lg:col-span-1'>
            <RecentHistoryCard interviews={interviews} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
