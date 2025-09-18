"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// const navLinks = [
//   { href: "#features", label: "Features" },
//   { href: "#pricing", label: "Pricing" },
//   { href: "#contact", label: "Contact" },
// ];

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-gray-100"
    >
      <div className="mx-auto max-w-7xl py-4 px-6 md:px-12">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
            <Image
              src="/favicon.svg"
              alt="Nexus Logo"
              width={32}
              height={32}
              className="inline-block mr-2"
            />
            Code Nexus
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </a>
            ))} */}
          </div>

          <div className="flex items-center gap-4 border-2 rounded-md border-blue-100">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-gradient"
            >
              Sign Up/ Login
            </Link>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
