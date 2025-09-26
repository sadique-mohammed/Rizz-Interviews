// src/app/auth/[[...rest]]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthClientPage from "./AuthClientPage";

export default async function AuthPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <AuthClientPage />;
}
