import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import NavToggle from "@/components/ui/nav-toggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/60 border-b border-gray-100">
      <div className="flex items-center justify-between mx-auto max-w-7xl py-4 px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-gray-900 flex items-center"
          >
            <Image src="/favicon.svg" alt="Nexus Logo" width={32} height={32} className="mr-2" />
            Nexus AI
          </Link>
        </div>

        <NavToggle />
        <UserButton />
      </div>
    </header>
  );
}
