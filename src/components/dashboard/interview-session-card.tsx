"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Code, Globe, Target, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InterviewSessionCard() {
  const router = useRouter();

  const [selectedType, setSelectedType] = React.useState("dsa");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("easy");
  const [selectedDuration, setSelectedDuration] = React.useState("15");

  const handleStartInterview = () => {
    const params = new URLSearchParams({
      type: selectedType,
      difficulty: selectedDifficulty,
      duration: selectedDuration,
    });
    console.log("Starting interview with params:", params.toString());
    router.push(`/interview?${params.toString()}`);
  };
  return (
    <Card className="border-2 border-blue-100 bg-blue-50/30 h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            Start New Interview Session
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Configure your interview parameters and begin your practice session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Interview Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedType === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-md ${
                        selectedType === type.id ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          selectedType === type.id ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{type.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="text-sm font-medium text-gray-700 mb-2 block">
              Difficulty Level
            </label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger id="difficulty" className="w-full cursor-pointer">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy" className="cursor-pointer">
                  Easy
                </SelectItem>
                <SelectItem value="medium" className="cursor-pointer">
                  Medium
                </SelectItem>
                <SelectItem value="hard" className="cursor-pointer">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">
              Session Duration
            </label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger id="duration" className="w-full cursor-pointer">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15" className="cursor-pointer">
                  15 minutes
                </SelectItem>
                <SelectItem value="30" className="cursor-pointer">
                  30 minutes
                </SelectItem>
                <SelectItem value="45" className="cursor-pointer">
                  45 minutes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button
            onClick={handleStartInterview}
            variant="outline"
            className="p-4 rounded-lg border cursor-pointer transition-colors border-gray-200 hover:border-blue-500 hover:bg-blue-50"
          >
            <Play className="h-4 w-4" />
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
const interviewTypes = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    icon: Code,
    description: "Arrays, Strings, Trees, Graphs etc.",
    estimatedTime: "25-30 min",
  },
  {
    id: "webdev",
    name: "Web Development",
    icon: Globe,
    description: "React, APIs, Performance, etc.",
    estimatedTime: "30-45 min",
  },
  {
    id: "system-design",
    name: "System Design",
    icon: Target,
    description: "Scalability, Architecture, Trade-offs, etc.",
    estimatedTime: "45-60 min",
  },
  {
    id: "behavioral",
    name: "Behavioral",
    icon: BookOpen,
    description: "Leadership, Conflict Resolution, Teamwork, etc.",
    estimatedTime: "20-30 min",
  },
];
