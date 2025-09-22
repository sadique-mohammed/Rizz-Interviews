// app/interview/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InterviewType = "DSA" | "WebDev" | "SystemDesign" | "MobileDev";
type Difficulty = "Easy" | "Medium" | "Hard";
type Duration = 30 | 45 | 60 | 90;

interface InterviewOption {
  key: InterviewType;
  title: string;
  description: string;
  durationRange: string;
}

const OPTIONS: InterviewOption[] = [
  {
    key: "DSA",
    title: "Data Structures & Algorithms",
    description: "Arrays, Trees, Graphs",
    durationRange: "45–60 min",
  },
  {
    key: "WebDev",
    title: "Web Development",
    description: "React, APIs, Performance",
    durationRange: "30–45 min",
  },
  {
    key: "SystemDesign",
    title: "System Design",
    description: "Scalability, Architecture",
    durationRange: "60–90 min",
  },
  {
    key: "MobileDev",
    title: "Mobile Development",
    description: "iOS, Android, Cross-platform",
    durationRange: "45–60 min",
  },
];

export default function InterviewPage() {
  const [selectedType, setSelectedType] = useState<InterviewType>("DSA");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [duration, setDuration] = useState<Duration>(45);
  const router = useRouter();

  const startInterview = async () => {
    const payload = { type: selectedType, difficulty, duration };

    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      // redirect to interview page
      router.push(`/interview/${data.id}`);
    } else {
      console.error("Failed to start interview");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-2">⚡ Start Your Next Interview</h2>
      <p className="text-gray-600 mb-6">Choose your focus area and jump right in</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedType(opt.key)}
            className={`border rounded-lg p-4 text-left transition ${
              selectedType === opt.key ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <h3 className="font-medium">{opt.title}</h3>
            <p className="text-sm text-gray-500">{opt.description}</p>
            <p className="text-xs text-gray-400 mt-1">{opt.durationRange}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-center mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="border rounded px-2 py-1"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) as Duration)}
            className="border rounded px-2 py-1"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </div>
      </div>

      <button
        onClick={startInterview}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        ▶ Start Interview
      </button>
    </div>
  );
}
