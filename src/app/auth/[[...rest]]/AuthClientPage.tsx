// app/auth/[[...rest]]/AuthClientPage.tsx
"use client";

import { usePathname } from "next/navigation";
import { SignIn, SignUp, SignedOut } from "@clerk/nextjs";

export default function AuthClientPage() {
  const pathname = usePathname();
  const isSignUp = pathname?.includes("sign-up");

  return (
    <div className="flex items-center justify-center h-screen">
      <SignedOut>{isSignUp ? <SignUp /> : <SignIn />}</SignedOut>
    </div>
  );
}
