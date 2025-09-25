"use client";
import { SignedOut, SignIn, SignUp } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
export default function AuthClientPage() {
  const pathname = usePathname();
  const isSignUp = pathname?.includes("sign-up");

  return (
    <div className="flex items-center justify-center h-screen">
      <SignedOut>{isSignUp ? <SignUp /> : <SignIn />}</SignedOut>
    </div>
  );
}
