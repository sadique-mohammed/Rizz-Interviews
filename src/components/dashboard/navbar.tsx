"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/interview", label: "Start Interview" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/60 border-b border-gray-100">
      <div className="mx-auto max-w-7xl py-4 px-6 md:px-12">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-gray-900 flex items-center"
          >
            <Image src="/favicon.svg" alt="Nexus Logo" width={32} height={32} className="mr-2" />
            Nexus AI
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <UserButton />
            {/* Hamburger Menu Button */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-gray-600 transition-transform ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-gray-600 transition-opacity ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-gray-600 transition-transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
