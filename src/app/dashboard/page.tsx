// app/dashboard/page.tsx
import { UserButton } from "@clerk/nextjs";
export default async function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="p-8 text-xl">🚀 Welcome to your Dashboard</div>
      <UserButton />
    </div>
  );
}
