import StreakCard from '@/components/dashboard/streak-card';
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

  const activeSession = data?.activeSession ?? null;

  return (
    <>
      <div className='page-shell'>
        <div className='mx-auto mb-20 max-w-7xl px-6 py-10'>
          <div className='mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6'>
            <h2 className='text-2xl font-bold text-gray-900 shrink-0'>
              {user?.name ? `Welcome back, ${user.name}!` : 'Welcome to Nexus!'}
            </h2>
            <div className='w-full xl:w-auto xl:flex-1 xl:max-w-[750px]'>
              <StreakCard streakData={data?.streakData || {}} />
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
            <div className='lg:col-span-2'>
              <InterviewSessionCard activeSession={activeSession} />
            </div>
            <div className='lg:col-span-1'>
              <RecentHistoryCard interviews={interviews} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
