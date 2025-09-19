"use client";

import type React from "react";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import SectionHeader from "./section-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield,
  Sparkles,
  BadgeCheck,
  FileText,
  PlayCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
  bullets?: string[];
};

const TABS: Tab[] = [
  {
    id: "ai-interview",
    label: "AI Interview",
    icon: PlayCircle,
    title: "Real interviews, powered by AI.",
    copy: "Practice DSA and Web Development interviews that adapt as you answer. The AI asks, evaluates, and guides you.",
    bullets: ["DSA + Web Dev", "Theory + Coding", "Adaptive flow"],
  },
  {
    id: "feedback-scoring",
    label: "AI Feedback",
    icon: Sparkles,
    title: "Instant feedback and points.",
    copy: "Receive per-question points and actionable feedback instantly. Improve iteratively with targeted hints.",
    bullets: ["Per-question scoring", "Hints when stuck", "Final session score"],
  },
  {
    id: "conversation",
    label: "Conversation",
    icon: FileText,
    title: "Full Q&A history.",
    copy: "Every question, attempt, and AI correction is logged so you can review reasoning chains and learn from mistakes.",
    bullets: ["Attempts logged", "AI corrections", "Session summaries"],
  },
  {
    id: "recordings",
    label: "Recordings",
    icon: Shield,
    title: "Record and replay.",
    copy: "Optionally record sessions and auto-generate transcripts to review or share with mentors.",
    bullets: ["Optional video", "Auto transcripts", "Shareable links"],
  },
  {
    id: "scoring",
    label: "Scoring",
    icon: BadgeCheck,
    title: "Smart scoring rubric.",
    copy: "Points-based scoring (0–10 per attempt). Final score is computed from best attempts per question.",
    bullets: ["Partial credit", "Best-attempt aggregation", "Exportable results"],
  },
];

// DemoCard component
function DemoCard({ pulse = false }: { pulse?: boolean }) {
  const color = "bg-brand/10 text-brand";
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rX = useSpring(useTransform(y, [-50, 50], [6, -6]), {
    stiffness: 170,
    damping: 16,
    mass: 0.4,
  });
  const rY = useSpring(useTransform(x, [-50, 50], [-8, 8]), {
    stiffness: 170,
    damping: 16,
    mass: 0.4,
  });

  const onMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width) * 100 - 50);
    y.set(((e.clientY - rect.top) / rect.height) * 100 - 50);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: prefersReducedMotion ? 0 : rX,
        rotateY: prefersReducedMotion ? 0 : rY,
        transformPerspective: 900,
      }}
      className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-fit"
    >
      {/* shimmer sweep */}
      {pulse && !prefersReducedMotion && (
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: 1 }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}
      <div className={cn("rounded-xl p-3 w-fit", color)}>
        <span className="text-xs font-semibold">Get ready for your interview</span>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200/60 p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
            <Image src="/favicon.svg" alt="Nexus AI" width={24} height={24} className="absolute" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Nexus AI Interviewer</div>
            <div className="text-xs text-gray-500">Ready to begin your session</div>
          </div>
          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">Estimated time: 10-15 mins</div>
          <Button
            size="sm"
            className="h-8 px-4 bg-brand hover:bg-brand/90 text-white text-xs rounded-full"
          >
            Start Interview
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
        <Shield className="h-4 w-4 text-green-500" />
        <span>Secure & private session</span>
      </div>
    </motion.div>
  );
}

// Features component
export default function Features() {
  const [active, setActive] = useState<string>(TABS[0].id); // default first tab
  const activeTab = TABS.find((t) => t.id === active) || TABS[0];
  const [pulse, setPulse] = useState(false);

  // Map stats for each tab
  const tabStats: Record<string, { k: string; v: string }[]> = {
    "ai-interview": [
      { k: "DSA coverage", v: "100%" },
      { k: "Time saved", v: "10–15m" },
      { k: "Adaptive", v: "Yes" },
    ],
    "feedback-scoring": [
      { k: "Instant scoring", v: "Yes" },
      { k: "Hints provided", v: "Yes" },
      { k: "Session score", v: "0–10" },
    ],
    conversation: [
      { k: "Attempts logged", v: "All" },
      { k: "AI corrections", v: "Yes" },
      { k: "Session summaries", v: "Generated" },
    ],
    recordings: [
      { k: "Video optional", v: "Yes" },
      { k: "Transcripts", v: "Auto" },
      { k: "Shareable", v: "Yes" },
    ],
    scoring: [
      { k: "Partial credit", v: "Yes" },
      { k: "Best attempts", v: "Used" },
      { k: "Export", v: "Available" },
    ],
  };

  // Map DemoCard colors per tab
  const tabColors: Record<string, "red" | "purple" | "blue"> = {
    "ai-interview": "red",
    "feedback-scoring": "purple",
    conversation: "blue",
    recordings: "red",
    scoring: "purple",
  };

  return (
    <section id="features" className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        <SectionHeader
          eyebrow="Features"
          title="A powerhouse AI interviewer that feels natural."
          subtitle="Pick a capability to see how it works. Smooth, focused UI — no clutter, no gimmicks."
          center
        />

        {/* Pill Tabs */}
        <Tabs value={active} onValueChange={setActive} className="mt-4">
          <div className="flex justify-center">
            <TabsList className="relative flex max-w-full overflow-x-auto no-scrollbar p-2 md:p-2.5 bg-gray-100/60 backdrop-blur-sm ring-1 ring-gray-200/60 shadow-lg h-auto w-full gap-0 items-start flex-row tracking-normal leading-5 rounded-full my-2 mx-0">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className={cn(
                    "relative isolate mx-0.5 rounded-full px-3.5 md:px-4 py-1.5 md:py-2 text-gray-600 transition-all duration-200 hover:text-gray-900 hover:bg-white/50 data-[state=active]:text-gray-900"
                  )}
                >
                  {active === t.id && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 z-0 rounded-full bg-white shadow-md"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <t.icon className="h-4 w-4 text-brand" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
              >
                {/* Demo card */}
                <DemoCard pulse={pulse} />

                {/* Copy panel */}
                <motion.div
                  layout
                  className="rounded-2xl border border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex gap-3 items-center">
                    <activeTab.icon className="h-5 w-5 text-brand" />
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                      {activeTab.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{activeTab.copy}</p>

                  {activeTab.bullets?.length && (
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                      className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6"
                    >
                      {activeTab.bullets.map((b) => (
                        <motion.li
                          key={b}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: { opacity: 1, x: 0 },
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="h-4 w-4 text-brand" />
                          {b}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {tabStats[active].map((s) => (
                      <motion.div
                        key={s.k}
                        whileHover={{ y: -2 }}
                        className="rounded-xl border border-gray-200 bg-white/80 p-3 text-center"
                      >
                        <div className="text-xs text-gray-500">{s.k}</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">{s.v}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA row */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="mt-6 flex flex-wrap items-center gap-3"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="h-9 rounded-full px-4 bg-brand hover:bg-brand/90 text-white"
                        onClick={() => {
                          setPulse(false);
                          requestAnimationFrame(() => {
                            setPulse(true);
                            setTimeout(() => setPulse(false), 1150);
                          });
                        }}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        See it in action
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="h-9 rounded-full px-4 bg-transparent">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Read docs
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {TABS.map((t) => (
              <TabsContent key={t.id} value={t.id} className="sr-only" />
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
