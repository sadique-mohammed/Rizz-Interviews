"use client";
import React from "react";
import Navbar from "@/components/dashboard/navbar";
import InterviewSessionCard from "@/components/dashboard/interview-session-card";
// import { useUser } from "@clerk/nextjs";
import RecentHistoryCard from "@/components/dashboard/recent-history-card";
import Loading from "@/components/dashboard/loader";
import Footer from "@/components/dashboard/footer";

type ApiUser = {
  id: string;
  name: string;
  email: string;
};

export default function DashboardPage() {
  //get user from clerk
  // const { user, isLoaded } = useUser();
  // console.log("User from Clerk:", user);
  const [user, setUser] = React.useState<ApiUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <Loading />;
  } else
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {/* Welcome back, {user?.fullName || "User"}!*/}
              Welcome back, {user?.name || "User"}!
            </h2>
            <p className="mx-5 text-gray-600">
              Let's keep the momentum going. Practice for your next interview and ace it with
              confidence!
              <br />
              {/* User Mail: {user?.emailAddresses[0].emailAddress} */}
              User Mail: {user?.email}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <InterviewSessionCard />
            </div>
            <div className="lg:col-span-1">
              <RecentHistoryCard />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
}
