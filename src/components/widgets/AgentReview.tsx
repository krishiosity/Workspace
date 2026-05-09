"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal,
  Circle,
  Filter,
  Pause,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bug,
  FileText,
  GitPullRequest,
  Search,
  Wrench,
} from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  model: string;
  level: LogLevel;
  message: string;
}

interface ActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  icon: "search" | "file" | "pr" | "tool" | "check" | "warn" | "bug";
}

interface ModelInfo {
  provider: string;
  contextWindow: string;
  maxOutput: string;
  costTier: "low" | "medium" | "high";
  capabilities: string[];
  latency: string;
}

interface AgentProcess {
  id: string;
  name: string;
  model: string;
  status: "running" | "completed" | "error" | "queued";
  startedAt: string;
  tokensUsed: number;
  tokensLimit: number;
  description: string;
  logs: LogEntry[];
  activities: ActivityEntry[];
  modelInfo: ModelInfo;
}

const MODEL_COLORS: Record<string, string> = {
  "claude-opus-4": "text-violet-500",
  "claude-sonnet-4": "text-blue-500",
  "claude-haiku-4": "text-cyan-500",
  "gpt-4o": "text-emerald-500",
  "gemini-2.5-pro": "text-amber-500",
};

const MODEL_BG: Record<string, string> = {
  "claude-opus-4":
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "claude-sonnet-4":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "claude-haiku-4":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "gpt-4o":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "gemini-2.5-pro":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const MODEL_ACCENT: Record<string, string> = {
  "claude-opus-4": "border-violet-500/30",
  "claude-sonnet-4": "border-blue-500/30",
  "claude-haiku-4": "border-cyan-500/30",
  "gpt-4o": "border-emerald-500/30",
  "gemini-2.5-pro": "border-amber-500/30",
};

const STATUS_DOT: Record<string, string> = {
  running: "text-emerald-500 animate-pulse",
  completed: "text-neutral-400",
  error: "text-red-500",
  queued: "text-amber-400",
};

const STATUS_LABEL: Record<string, string> = {
  running:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  completed:
    "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
  error:
    "bg-red-500/10 text-red-400 border border-red-500/20",
  queued:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const COST_STYLES: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: "text-[#1e293b]",
  warn: "text-amber-400",
  error: "text-red-400",
  debug: "text-neutral-500",
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  search: <Search className="h-3 w-3" />,
  file: <FileText className="h-3 w-3" />,
  pr: <GitPullRequest className="h-3 w-3" />,
  tool: <Wrench className="h-3 w-3" />,
  check: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
  warn: <AlertTriangle className="h-3 w-3 text-amber-400" />,
  bug: <Bug className="h-3 w-3 text-red-400" />,
};

const MOCK_AGENTS: AgentProcess[] = [
  {
    id: "proc-1",
    name: "Code Review Agent",
    model: "claude-opus-4",
    status: "running",
    startedAt: "2m ago",
    tokensUsed: 14320,
    tokensLimit: 32000,
    description:
      "Reviews pull requests for security issues, code quality, and best practices. Focuses on auth-related changes.",
    modelInfo: {
      provider: "Anthropic",
      contextWindow: "200K tokens",
      maxOutput: "4,096 tokens",
      costTier: "high",
      capabilities: [
        "Deep reasoning",
        "Code analysis",
        "Security auditing",
        "Multi-file context",
      ],
      latency: "~3.2s first token",
    },
    activities: [
      {
        id: "a1",
        timestamp: "12:04:32",
        action: "Opened PR #482",
        detail: "Fetched diff with 14 changed files",
        icon: "pr",
      },
      {
        id: "a2",
        timestamp: "12:04:33",
        action: "Read src/lib/auth.ts",
        detail: "Analyzed JWT token handling logic (248 lines)",
        icon: "file",
      },
      {
        id: "a3",
        timestamp: "12:04:34",
        action: "Read src/middleware.ts",
        detail: "Checked session validation middleware",
        icon: "file",
      },
      {
        id: "a4",
        timestamp: "12:04:35",
        action: "Security flag raised",
        detail: "JWT secret loaded from env without validation",
        icon: "warn",
      },
      {
        id: "a5",
        timestamp: "12:04:36",
        action: "Searched codebase",
        detail: 'Grep for "process.env.JWT" across 132 files',
        icon: "search",
      },
      {
        id: "a6",
        timestamp: "12:04:37",
        action: "Analyzing race conditions",
        detail: "Token refresh logic under concurrent requests",
        icon: "tool",
      },
    ],
    logs: [
      {
        id: "l1",
        timestamp: "12:04:32",
        agentName: "Code Review Agent",
        model: "claude-opus-4",
        level: "info",
        message: "Starting review of PR #482 — src/lib/auth.ts",
      },
      {
        id: "l2",
        timestamp: "12:04:33",
        agentName: "Code Review Agent",
        model: "claude-opus-4",
        level: "debug",
        message: "Reading 14 files changed across 3 directories",
      },
      {
        id: "l3",
        timestamp: "12:04:35",
        agentName: "Code Review Agent",
        model: "claude-opus-4",
        level: "warn",
        message:
          "Potential security issue: JWT secret loaded from env without validation",
      },
      {
        id: "l4",
        timestamp: "12:04:37",
        agentName: "Code Review Agent",
        model: "claude-opus-4",
        level: "info",
        message: "Analyzing token refresh logic for race conditions…",
      },
    ],
  },
  {
    id: "proc-2",
    name: "Test Generator",
    model: "claude-sonnet-4",
    status: "running",
    startedAt: "45s ago",
    tokensUsed: 6800,
    tokensLimit: 16000,
    description:
      "Automatically generates unit and integration tests based on code changes. Targets edge cases and error paths.",
    modelInfo: {
      provider: "Anthropic",
      contextWindow: "200K tokens",
      maxOutput: "4,096 tokens",
      costTier: "medium",
      capabilities: [
        "Fast generation",
        "Test patterns",
        "Coverage analysis",
        "Framework-aware",
      ],
      latency: "~1.1s first token",
    },
    activities: [
      {
        id: "a7",
        timestamp: "12:05:18",
        action: "Read UserService.ts",
        detail: "Parsed class with 6 public methods",
        icon: "file",
      },
      {
        id: "a8",
        timestamp: "12:05:19",
        action: "Detected test framework",
        detail: "Jest + @testing-library/react",
        icon: "tool",
      },
      {
        id: "a9",
        timestamp: "12:05:20",
        action: "Generated 8 test cases",
        detail: "Auth flow: login, logout, refresh, expired, revoked, mfa, lockout, rate-limit",
        icon: "check",
      },
      {
        id: "a10",
        timestamp: "12:05:22",
        action: "Running test suite",
        detail: "jest --coverage on generated tests",
        icon: "tool",
      },
    ],
    logs: [
      {
        id: "l5",
        timestamp: "12:05:18",
        agentName: "Test Generator",
        model: "claude-sonnet-4",
        level: "info",
        message: "Generating unit tests for UserService class",
      },
      {
        id: "l6",
        timestamp: "12:05:20",
        agentName: "Test Generator",
        model: "claude-sonnet-4",
        level: "info",
        message: "Created 8 test cases covering auth flow edge cases",
      },
      {
        id: "l7",
        timestamp: "12:05:22",
        agentName: "Test Generator",
        model: "claude-sonnet-4",
        level: "debug",
        message: "Running jest --coverage on generated tests…",
      },
    ],
  },
  {
    id: "proc-3",
    name: "Doc Writer",
    model: "claude-haiku-4",
    status: "completed",
    startedAt: "5m ago",
    tokensUsed: 3200,
    tokensLimit: 8000,
    description:
      "Generates and updates API documentation from code comments and type definitions.",
    modelInfo: {
      provider: "Anthropic",
      contextWindow: "200K tokens",
      maxOutput: "4,096 tokens",
      costTier: "low",
      capabilities: [
        "Fast output",
        "Markdown formatting",
        "JSDoc parsing",
        "OpenAPI generation",
      ],
      latency: "~0.4s first token",
    },
    activities: [
      {
        id: "a11",
        timestamp: "12:01:00",
        action: "Scanned routes/",
        detail: "Found 12 API endpoint handlers",
        icon: "search",
      },
      {
        id: "a12",
        timestamp: "12:01:05",
        action: "Parsed type definitions",
        detail: "Extracted request/response schemas from 8 files",
        icon: "file",
      },
      {
        id: "a13",
        timestamp: "12:01:08",
        action: "Generated docs",
        detail: "12 endpoints documented with examples",
        icon: "check",
      },
      {
        id: "a14",
        timestamp: "12:01:10",
        action: "Wrote output",
        detail: "docs/api-reference.md (2.4KB)",
        icon: "file",
      },
    ],
    logs: [
      {
        id: "l8",
        timestamp: "12:01:02",
        agentName: "Doc Writer",
        model: "claude-haiku-4",
        level: "info",
        message: "Generated API docs for 12 endpoints",
      },
      {
        id: "l9",
        timestamp: "12:01:10",
        agentName: "Doc Writer",
        model: "claude-haiku-4",
        level: "info",
        message: "Completed — output written to docs/api-reference.md",
      },
    ],
  },
  {
    id: "proc-4",
    name: "Migration Planner",
    model: "gpt-4o",
    status: "running",
    startedAt: "1m ago",
    tokensUsed: 9100,
    tokensLimit: 24000,
    description:
      "Plans framework migration paths by analyzing dependencies, deprecated APIs, and providing step-by-step upgrade guides.",
    modelInfo: {
      provider: "OpenAI",
      contextWindow: "128K tokens",
      maxOutput: "4,096 tokens",
      costTier: "medium",
      capabilities: [
        "Broad knowledge",
        "Migration patterns",
        "Dependency analysis",
        "Changelog parsing",
      ],
      latency: "~0.8s first token",
    },
    activities: [
      {
        id: "a15",
        timestamp: "12:04:50",
        action: "Read package.json",
        detail: "Detected React 18.2.0, Next.js 14.1",
        icon: "file",
      },
      {
        id: "a16",
        timestamp: "12:04:52",
        action: "Scanned components/",
        detail: "Found 47 components, 3 with deprecated lifecycle methods",
        icon: "search",
      },
      {
        id: "a17",
        timestamp: "12:04:55",
        action: "Deprecation warnings",
        detail: "componentWillMount in Header, Sidebar, LegacyTable",
        icon: "warn",
      },
      {
        id: "a18",
        timestamp: "12:04:58",
        action: "Building dep graph",
        detail: "Mapping component relationships for safe migration order",
        icon: "tool",
      },
    ],
    logs: [
      {
        id: "l10",
        timestamp: "12:04:50",
        agentName: "Migration Planner",
        model: "gpt-4o",
        level: "info",
        message: "Analyzing codebase for React 18 → 19 migration paths",
      },
      {
        id: "l11",
        timestamp: "12:04:55",
        agentName: "Migration Planner",
        model: "gpt-4o",
        level: "warn",
        message: "Found 3 deprecated lifecycle methods in legacy components",
      },
      {
        id: "l12",
        timestamp: "12:04:58",
        agentName: "Migration Planner",
        model: "gpt-4o",
        level: "info",
        message: "Building dependency graph for incremental migration…",
      },
    ],
  },
  {
    id: "proc-5",
    name: "Perf Analyzer",
    model: "gemini-2.5-pro",
    status: "queued",
    startedAt: "—",
    tokensUsed: 0,
    tokensLimit: 20000,
    description:
      "Profiles application performance, identifies bottlenecks, and suggests optimizations for bundle size and runtime speed.",
    modelInfo: {
      provider: "Google",
      contextWindow: "1M tokens",
      maxOutput: "8,192 tokens",
      costTier: "medium",
      capabilities: [
        "Large context",
        "Performance profiling",
        "Bundle analysis",
        "Lighthouse integration",
      ],
      latency: "~1.5s first token",
    },
    activities: [
      {
        id: "a19",
        timestamp: "12:05:30",
        action: "Queued",
        detail: "Waiting for Test Generator to complete before profiling",
        icon: "tool",
      },
    ],
    logs: [
      {
        id: "l13",
        timestamp: "12:05:30",
        agentName: "Perf Analyzer",
        model: "gemini-2.5-pro",
        level: "info",
        message:
          "Queued — waiting for Test Generator to finish before profiling",
      },
    ],
  },
];

type ViewMode = "agents" | "unified";

function TokenBar({
  used,
  limit,
  model,
}: {
  used: number;
  limit: number;
  model: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    MODEL_COLORS[model]?.replace("text-", "bg-") ?? "bg-neutral-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-neutral-500">
        {(used / 1000).toFixed(1)}K / {(limit / 1000).toFixed(0)}K
      </span>
    </div>
  );
}

function AgentDetailPanel({
  agent,
  onBack,
}: {
  agent: AgentProcess;
  onBack: () => void;
}) {
  const [detailTab, setDetailTab] = useState<"activity" | "logs">("activity");

  return (
    <div className="flex h-full flex-col">
      {/* Detail Header */}
      <div
        className={`border-b border-blue-100 dark:border-neutral-500/30 ${MODEL_ACCENT[agent.model] ?? ""}`}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={onBack}
            className="rounded p-1 text-[#1e293b] transition-colors hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <Circle
            className={`h-2.5 w-2.5 shrink-0 fill-current ${STATUS_DOT[agent.status]}`}
          />
          <span className="text-sm font-semibold text-white">
            {agent.name}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_LABEL[agent.status]}`}
          >
            {agent.status}
          </span>
        </div>
        <p className="px-3 pb-2.5 text-xs leading-relaxed text-neutral-400">
          {agent.description}
        </p>
      </div>

      {/* Model Info Card */}
      <div className="border-b border-blue-100 px-3 py-3 dark:border-neutral-500/30">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${MODEL_BG[agent.model] ?? "bg-white/[0.06] text-neutral-400"}`}
          >
            {agent.model}
          </span>
          <span className="text-[11px] text-neutral-500">
            by {agent.modelInfo.provider}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Cpu className="h-3 w-3 text-neutral-600" />
            <span className="text-neutral-500">Context</span>
            <span className="ml-auto text-neutral-300">
              {agent.modelInfo.contextWindow}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Zap className="h-3 w-3 text-neutral-600" />
            <span className="text-neutral-500">Output</span>
            <span className="ml-auto text-neutral-300">
              {agent.modelInfo.maxOutput}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Clock className="h-3 w-3 text-neutral-600" />
            <span className="text-neutral-500">Latency</span>
            <span className="ml-auto text-neutral-300">
              {agent.modelInfo.latency}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <DollarSign className="h-3 w-3 text-neutral-600" />
            <span className="text-neutral-500">Cost</span>
            <span
              className={`ml-auto capitalize ${COST_STYLES[agent.modelInfo.costTier]}`}
            >
              {agent.modelInfo.costTier}
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {agent.modelInfo.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-neutral-400"
            >
              {cap}
            </span>
          ))}
        </div>
        {/* Token usage bar */}
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">Token usage</span>
            <span className="text-[10px] tabular-nums text-neutral-500">
              {Math.round((agent.tokensUsed / agent.tokensLimit) * 100)}%
            </span>
          </div>
          <TokenBar
            used={agent.tokensUsed}
            limit={agent.tokensLimit}
            model={agent.model}
          />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-blue-100 dark:border-neutral-500/30">
        <button
          onClick={() => setDetailTab("activity")}
          className={`flex-1 py-2 text-center text-[11px] font-medium transition-colors ${
            detailTab === "activity"
              ? "border-b-2 border-neutral-300 text-neutral-200"
              : "text-neutral-500 hover:text-neutral-400"
          }`}
        >
          <Activity className="mr-1 inline h-3 w-3" />
          Activity ({agent.activities.length})
        </button>
        <button
          onClick={() => setDetailTab("logs")}
          className={`flex-1 py-2 text-center text-[11px] font-medium transition-colors ${
            detailTab === "logs"
              ? "border-b-2 border-neutral-300 text-neutral-200"
              : "text-neutral-500 hover:text-neutral-400"
          }`}
        >
          <Terminal className="mr-1 inline h-3 w-3" />
          Logs ({agent.logs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {detailTab === "activity" ? (
          <div className="px-3 py-2">
            {agent.activities.map((act, i) => (
              <div key={act.id} className="flex gap-2.5 pb-3 last:pb-0">
                {/* Timeline line + icon */}
                <div className="flex flex-col items-center">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-neutral-400">
                    {ACTIVITY_ICONS[act.icon]}
                  </div>
                  {i < agent.activities.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-white/[0.06]" />
                  )}
                </div>
                {/* Content */}
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-200">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-neutral-600">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
                    {act.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-2">
            {agent.logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-2 py-0.5 font-mono text-[11px] leading-relaxed"
              >
                <span className="shrink-0 text-neutral-600">
                  {log.timestamp}
                </span>
                <span
                  className={`w-10 shrink-0 uppercase ${LEVEL_STYLES[log.level]}`}
                >
                  {log.level}
                </span>
                <span className="text-neutral-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentReview({ id, settings }: WidgetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("agents");
  const [filterModel, setFilterModel] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(
    new Set(["proc-1", "proc-2"])
  );
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const models = [...new Set(MOCK_AGENTS.map((a) => a.model))];

  const filteredAgents = filterModel
    ? MOCK_AGENTS.filter((a) => a.model === filterModel)
    : MOCK_AGENTS;

  const allLogs = useMemo(
    () =>
      MOCK_AGENTS.flatMap((a) => a.logs)
        .filter((l) => !filterModel || l.model === filterModel)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [filterModel]
  );

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  useEffect(() => {
    if (!paused && viewMode === "unified") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allLogs.length, paused, viewMode]);

  const activeAgent = selectedAgent
    ? MOCK_AGENTS.find((a) => a.id === selectedAgent)
    : null;

  // Detail view
  if (activeAgent) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-blue-200 bg-[#0a0a0b] dark:border-neutral-500/50">
        <AgentDetailPanel
          agent={activeAgent}
          onBack={() => setSelectedAgent(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex rounded-lg border border-blue-200 dark:border-neutral-500/50">
          <button
            onClick={() => setViewMode("agents")}
            className={`px-2 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "agents"
                ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
                : "text-[#1e293b] hover:text-[#0f172a] dark:text-neutral-400 dark:hover:text-neutral-200"
            } rounded-l-md`}
          >
            By Agent
          </button>
          <button
            onClick={() => setViewMode("unified")}
            className={`px-2 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "unified"
                ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
                : "text-[#1e293b] hover:text-[#0f172a] dark:text-neutral-400 dark:hover:text-neutral-200"
            } rounded-r-md`}
          >
            Unified Log
          </button>
        </div>

        {/* Model Filter */}
        <div className="relative">
          <select
            value={filterModel ?? ""}
            onChange={(e) => setFilterModel(e.target.value || null)}
            className="appearance-none rounded-lg border border-blue-200 bg-[#f5f0f1] py-1 pl-6 pr-6 text-[11px] text-[#0f172a] outline-none dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-neutral-300"
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#475569] dark:text-neutral-500" />
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-[#475569] dark:text-neutral-500" />
        </div>

        <div className="flex-1" />

        {/* Pause/Resume */}
        <button
          onClick={() => setPaused(!paused)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
            paused
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "text-[#1e293b] hover:bg-blue-50 dark:text-neutral-400 dark:hover:bg-white/[0.06]"
          }`}
        >
          {paused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-blue-200 bg-[#0a0a0b] dark:border-neutral-500/50">
        {viewMode === "agents" ? (
          <div className="divide-y divide-white/[0.06]">
            {filteredAgents.map((agent) => (
              <div key={agent.id}>
                {/* Agent Header */}
                <div className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/[0.03]">
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="shrink-0 rounded p-0.5 text-neutral-500 hover:text-neutral-300"
                  >
                    {expandedAgents.has(agent.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  <Circle
                    className={`h-2 w-2 shrink-0 fill-current ${STATUS_DOT[agent.status]}`}
                  />
                  <button
                    onClick={() => setSelectedAgent(agent.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="text-xs font-medium text-neutral-200 underline-offset-2 hover:underline">
                      {agent.name}
                    </span>
                  </button>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${MODEL_BG[agent.model] ?? "bg-white/[0.06] text-neutral-400"}`}
                  >
                    {agent.model}
                  </span>
                  <span className="shrink-0 text-[10px] text-neutral-600">
                    {agent.startedAt}
                  </span>
                </div>

                {/* Agent Logs */}
                {expandedAgents.has(agent.id) && (
                  <div className="border-t border-white/[0.04] bg-[#0a0a0b] px-3 py-1.5">
                    {agent.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-2 py-0.5 font-mono text-[11px] leading-relaxed"
                      >
                        <span className="shrink-0 text-neutral-600">
                          {log.timestamp}
                        </span>
                        <span
                          className={`w-10 shrink-0 uppercase ${LEVEL_STYLES[log.level]}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-neutral-300">{log.message}</span>
                      </div>
                    ))}
                    {/* Tap for more hint */}
                    <button
                      onClick={() => setSelectedAgent(agent.id)}
                      className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md bg-white/[0.03] py-1.5 text-[10px] text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-400"
                    >
                      <Info className="h-3 w-3" />
                      View agent details & activity
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Unified Log View */
          <div className="px-3 py-2">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-2 py-0.5 font-mono text-[11px] leading-relaxed"
              >
                <span className="shrink-0 text-neutral-600">{log.timestamp}</span>
                <span
                  className={`w-10 shrink-0 uppercase ${LEVEL_STYLES[log.level]}`}
                >
                  {log.level}
                </span>
                <span
                  className={`shrink-0 ${MODEL_COLORS[log.model] ?? "text-neutral-500"}`}
                >
                  [{log.agentName}]
                </span>
                <span className="text-neutral-300">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-neutral-500">
        <span>
          {MOCK_AGENTS.filter((a) => a.status === "running").length} running
          {" · "}
          {MOCK_AGENTS.filter((a) => a.status === "queued").length} queued
          {" · "}
          {MOCK_AGENTS.filter((a) => a.status === "completed").length} done
        </span>
        <span>{allLogs.length} log entries</span>
      </div>
    </div>
  );
}
