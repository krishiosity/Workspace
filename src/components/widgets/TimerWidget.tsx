"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

const PRESETS = [
  { label: "Pomodoro", seconds: 25 * 60 },
  { label: "Short Break", seconds: 5 * 60 },
  { label: "Long Break", seconds: 15 * 60 },
];

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function TimerWidget({ id, settings }: WidgetProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleToggle = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  }, [totalTime]);

  const handlePreset = useCallback((seconds: number) => {
    setIsRunning(false);
    setTimeLeft(seconds);
    setTotalTime(seconds);
  }, []);

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {/* Circular Progress */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-[#64748b] dark:text-white/[0.08]"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
            className="text-[#0f172a] dark:text-white transition-all duration-1000"
          />
        </svg>
        <span className="absolute font-mono text-2xl font-bold text-[#0f172a] dark:text-white">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className="rounded-lg bg-[#0f172a] p-2 text-white transition-colors hover:bg-[#0f172a]/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg bg-blue-50 p-2 text-[#0f172a] transition-colors hover:bg-blue-50 dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.06]"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset.seconds)}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              totalTime === preset.seconds
                ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
                : "bg-blue-50 text-[#1e293b] hover:bg-blue-50 dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.06]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
