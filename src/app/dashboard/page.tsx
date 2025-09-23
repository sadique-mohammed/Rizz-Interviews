"use client";
import React from "react";
import Navbar from "@/components/dashboard/navbar";
import InterviewSessionCard from "@/components/dashboard/interview-session-card";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Calendar, ChevronRight, Settings, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const recentInterviews = [
    {
      id: "1",
      type: "DSA",
      date: "2024-08-20",
      duration: "30 min",
      difficulty: "Medium",
      score: 85,
      status: "completed",
    },
  ];

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" }).format(
      new Date(iso)
    );

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.fullName || "User"}!
          </h2>
          <p className="mx-5 text-gray-600">
            Let's keep the momentum going. Practice for your next interview and ace it with
            confidence!
          </p>
        </div>
      </div>
      <InterviewSessionCard />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 ">
          {/* Recent Interviews */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Sessions
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{interview.type}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(interview.date)} • {interview.duration} • {interview.difficulty}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{interview.score}%</div>
                      <div className="text-xs text-gray-500 capitalize">{interview.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Performance Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-lg font-semibold text-gray-900">88%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interviews Completed</span>
                  <span className="text-lg font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Practice Hours</span>
                  <span className="text-lg font-semibold text-gray-900">8.5h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Interview Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Practice
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Award className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
