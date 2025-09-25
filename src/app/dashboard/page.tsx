import Navbar from "@/components/dashboard/navbar";
import InterviewSessionCard from "@/components/dashboard/interview-session-card";
import RecentHistoryCard from "@/components/dashboard/recent-history-card";
import Footer from "@/components/landing/footer";

async function fetchDashboardData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  const user = data.user;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-6 mb-20">
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name || "User"}!
          </h2>
          <p className="mx-5 text-gray-600">
            Let's keep the momentum going. Practice for your next interview and ace it with
            confidence!
            <br />
            User Mail: {user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <InterviewSessionCard />
          </div>
          <div className="lg:col-span-1">
            <RecentHistoryCard interviews={data.interviews} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
