"use client";

import type React from "react";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

const brandItems = [
  {
    name: "Birdwatch",
    Icon: function OwlLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 18c3 0 6-3 6-6s-3-6-6-6-6 3-6 6 3 6 6 6z" />
            <circle cx="10.5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="13.5" cy="12" r="1.5" fill="currentColor" />
            <path d="M8 8l4 3 4-3" />
          </g>
          <path d="M30 5h12" stroke="currentColor" strokeWidth="1.6" />
          <path d="M30 12h12" stroke="currentColor" strokeWidth="1.6" />
          <path d="M30 19h12" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    },
  },
  {
    name: "OpenCare",
    Icon: function CrossLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M10 6v12" />
            <path d="M4 12h12" />
          </g>
          <rect
            x="22"
            y="6"
            width="18"
            height="12"
            rx="6"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    },
  },
  {
    name: "treantly",
    Icon: function LeafLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <path
            d="M6 18c5-8 10-10 16-10 6 0 11 2 16 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M22 8c0 6-3 10-10 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="36" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    },
  },
  {
    name: "thoughtly",
    Icon: function ThoughtLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <path
            d="M6 12c0-4.418 3.582-8 8-8h10a8 8 0 010 16H14c-4.418 0-8-3.582-8-8z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="36" cy="16.5" r="1.5" fill="currentColor" />
          <circle cx="40" cy="18.5" r="1" fill="currentColor" />
        </svg>
      );
    },
  },
  {
    name: "Randall Reilly",
    Icon: function KnotLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <rect
            x="14"
            y="6"
            width="12"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M12 12h8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    },
  },
  {
    name: "FinChat",
    Icon: function ChatLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <path
            d="M8 18l2.5-3H26a6 6 0 000-12H12a6 6 0 000 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M32 10h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    },
  },
  {
    name: "Propel Impact",
    Icon: function StampLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <rect x="6" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <rect
            x="26"
            y="6"
            width="16"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    },
  },
  {
    name: "indeed",
    Icon: function DotLogo(props: React.SVGProps<SVGSVGElement>) {
      return (
        <svg
          viewBox="0 0 48 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6"
          {...props}
        >
          <circle cx="10" cy="12" r="3" fill="currentColor" />
          <path
            d="M18 7h20M18 12h16M18 17h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    },
  },
];

function Logo({ label, Icon }: { label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }) {
  return (
    <div
      aria-label={label}
      title={label}
      className={cn(
        "group shrink-0 rounded-xl border bg-white/90 backdrop-blur-sm",
        "border-gray-200/70 px-4 py-2 md:px-5 md:py-3 shadow-sm hover:shadow-lg",
        "grayscale hover:grayscale-0 transition-all duration-500",
        "hover:scale-105 transform"
      )}
    >
      <Icon
        className="h-6 w-auto text-gray-500 group-hover:text-gray-900 transition-colors duration-500"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function Rail({ reverse, speed = 10 }: { reverse?: boolean; speed?: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (reverse) {
        animationRef.current = gsap.fromTo(
          el,
          { xPercent: -50 },
          {
            xPercent: 0,
            ease: "none",
            repeat: -1,
            duration: speed,
          }
        );
      } else {
        animationRef.current = gsap.to(el, {
          xPercent: -50,
          ease: "none",
          repeat: -1,
          duration: speed,
        });
      }
    }, railRef);

    return () => ctx.revert();
  }, [reverse, speed]);

  const content = [...brandItems, ...brandItems];

  return (
    <div
      ref={railRef}
      className={cn("flex items-center gap-8 md:gap-12 min-w-max will-change-transform")}
      onMouseEnter={() => animationRef.current?.pause()}
      onMouseLeave={() => animationRef.current?.resume()}
    >
      {content.map((b, i) => (
        <Logo key={`${b.name}-${i}`} label={b.name} Icon={b.Icon} />
      ))}
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="py-14 px-6 md:px-12 bg-white">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-gray-50 to-white p-6 md:p-8"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />

          <div className="flex flex-col gap-10">
            <Rail />
            <Rail reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
