"use client";
import { useEffect } from "react";
import { useUser, SignedOut, SignIn, SignUp } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function AuthClientPage() {
  const { user } = useUser();
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const isSignUp = pathname?.includes("sign-up");

  useEffect(() => {
    if (user) {
      console.log("use effect from auth client");
      setUser(user);
      router.push("/dashboard");
    }
  }, [user, setUser, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <SignedOut>{isSignUp ? <SignUp /> : <SignIn />}</SignedOut>
    </div>
  );
}
