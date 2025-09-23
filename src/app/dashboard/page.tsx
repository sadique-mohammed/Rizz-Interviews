"use client";
import React from "react";
import Navbar from "@/components/dashboard/navbar";
import InterviewSessionCard from "@/components/dashboard/interview-session-card";
import { useUserStore } from "@/store/userStore";

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  console.log("User in DashboardPage:", user);
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.fullName || "User"}!
          </h2>
          <p className="mx-5 text-gray-600">
            Let's keep the momentum going. Practice for your next interview and ace it with
            confidence!
          </p>
        </div>
        <InterviewSessionCard />
      </div>
    </>
  );
}
