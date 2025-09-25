"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, History } from "lucide-react";
import { useRouter } from "next/navigation";

type Interview = {
  id: string;
  domain: string;
  difficulty: string;
  startedAt: string;
  endedAt: string | null;
  duration: number;
  totalScore: number | null;
  status: string;
};

export default function RecentHistoryCard() {
  const [recentInterviews, setRecentInterviews] = React.useState<Interview[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const fetchInterviews = async () => {
      const res = await fetch("http://localhost:3000/api/dashboard");
      const data = await res.json();

      if (data.interviews && Array.isArray(data.interviews)) {
        const lastTwo = data.interviews
          .sort(
            (a: Interview, b: Interview) =>
              new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          )
          .slice(0, 2);
        setRecentInterviews(lastTwo);
      }
    };

    fetchInterviews();
  }, []);

  const handleInterviewClick = (id: string) => {
    router.push(`/history/?id=${id}`);
  };

  const handleViewAllClick = () => {
    router.push("/history");
  };

  return (
    <Card className="border-2 border-blue-100 bg-blue-50/30 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Sessions</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Your latest practice results and feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentInterviews.length > 0 ? (
          <div className="space-y-2">
            {recentInterviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => handleInterviewClick(interview.id)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer bg-gray-50/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (interview.totalScore ?? 0) >= 90
                          ? "bg-green-100"
                          : (interview.totalScore ?? 0) >= 75
                          ? "bg-blue-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <span
                        className={`text-base font-semibold ${
                          (interview.totalScore ?? 0) >= 90
                            ? "text-green-700"
                            : (interview.totalScore ?? 0) >= 75
                            ? "text-blue-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {interview.totalScore ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{interview.domain}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(interview.startedAt).toLocaleDateString()} • {interview.duration}{" "}
                      min • {interview.difficulty}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllClick}
                className="text-blue-600 hover:text-blue-700 cursor-pointer hover:bg-blue-50"
              >
                View All
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-center text-gray-500">No recent interview sessions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
