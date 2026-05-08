"use client";

import React, { useState } from "react";
import { Bot, Eye, Play, ChevronDown, ChevronUp } from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "reviewing";
  task: string;
  output: string;
  icon: string;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: "agent-1",
    name: "Design Reviewer",
    status: "active",
    task: "Reviewing hero section layout for accessibility compliance",
    output:
      "Found 3 issues: (1) Contrast ratio on CTA button is 3.8:1, needs 4.5:1 minimum. (2) Missing alt text on hero image. (3) Navigation links lack focus indicators. Recommendation: Update button color to #2563EB, add descriptive alt text, and add focus-visible ring styles.",
    icon: "palette",
  },
  {
    id: "agent-2",
    name: "Copy Editor",
    status: "reviewing",
    task: "Proofreading landing page copy for tone and grammar",
    output:
      "Reviewed 12 sections. Suggestions: (1) Headline could be more action-oriented — consider 'Transform Your Workflow' instead of 'A Better Workflow'. (2) Paragraph 3 has a run-on sentence. (3) CTA copy 'Submit' should be 'Get Started Free' for better conversion.",
    icon: "pen-tool",
  },
  {
    id: "agent-3",
    name: "Performance Auditor",
    status: "idle",
    task: "Waiting for new build deployment to audit",
    output:
      "Last audit: Lighthouse score 92/100. LCP: 1.8s (Good). CLS: 0.05 (Good). FID: 12ms (Good). Suggestion: Optimize hero image with next-gen format to improve LCP further.",
    icon: "gauge",
  },
  {
    id: "agent-4",
    name: "Brand Consistency",
    status: "active",
    task: "Checking color usage and typography against brand guidelines",
    output:
      "Scanning 24 components... Found 2 off-brand colors in the footer section (#6B7280 should be #71717A per brand guide). Typography: All headings correctly use Inter Bold. Body text spacing is 1.5 — matches spec.",
    icon: "shield-check",
  },
];

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  idle: "bg-blue-50 text-[#1e293b] dark:bg-white/[0.06] dark:text-neutral-400",
  reviewing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AiAgents({ id, settings }: WidgetProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunAll = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Run All Button */}
      <button
        onClick={handleRunAll}
        disabled={running}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0f172a]/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <Play className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
        {running ? "Running..." : "Run All Agents"}
      </button>

      {/* Agent Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {MOCK_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="rounded-lg border border-blue-100 p-2.5 transition-colors dark:border-neutral-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-white/[0.06]">
                  <Bot className="h-4 w-4 text-[#1e293b] dark:text-neutral-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[#0f172a] dark:text-white">
                      {agent.name}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                        statusStyles[agent.status]
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="max-w-[200px] truncate text-xs text-[#475569] dark:text-neutral-500">
                    {agent.task}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setExpandedAgent(
                    expandedAgent === agent.id ? null : agent.id
                  )
                }
                className="rounded p-1 text-[#475569] transition-colors hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
              >
                {expandedAgent === agent.id ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Expanded Output */}
            {expandedAgent === agent.id && (
              <div className="mt-2 rounded-md bg-blue-50/50 p-2 text-xs leading-relaxed text-[#0f172a] dark:bg-white/[0.03] dark:text-neutral-300">
                {agent.output}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
