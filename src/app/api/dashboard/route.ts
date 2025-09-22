import { users, interviews, questions, answerAttempts, recordings } from "@/utils/mockData";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
export async function GET() {
  //   const { isAuthenticated } = await auth();
  //   const user = await currentUser();
  //   console.log("Is Authenticated:", isAuthenticated);
  //   console.log("User:", user);
  //   if (!isAuthenticated || !user) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  // Later: replace with Clerk
  const user = { id: "u2" };

  // Find user
  const userData = users.find((u) => u.id === user.id);
  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get user's interviews
  const userInterviews = interviews.filter((i) => i.userId === user.id);

  // Nest questions + answerAttempts under each interview
  const interviewsWithDetails = userInterviews.map((interview) => {
    const qs = questions.filter((q) => q.interviewId === interview.id);
    const qsWithAttempts = qs.map((q) => ({
      ...q,
      answerAttempts: answerAttempts.filter((a) => a.questionId === q.id),
    }));

    return {
      ...interview,
      questions: qsWithAttempts,
      recordings: recordings.filter((r) => r.interviewId === interview.id),
    };
  });

  return NextResponse.json(
    {
      user: userData,
      interviews: interviewsWithDetails,
    },
    { status: 200 }
  );
}
