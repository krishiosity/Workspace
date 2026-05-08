"use client";

import React, { useState, useMemo } from "react";
import { Search, Image, Bot, Eye, Share2, Users, StickyNote, Timer, Plus } from "lucide-react";
import { type WidgetProps } from "@/types/widgets";
import { getAddableWidgetDefinitions } from "@/lib/widget-registry";
import { useDashboardStore } from "@/lib/store";

const iconMap: Record<string, React.ReactNode> = {
  Image: <Image className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  Eye: <Eye className="h-5 w-5" />,
  Share2: <Share2 className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  StickyNote: <StickyNote className="h-5 w-5" />,
  Timer: <Timer className="h-5 w-5" />,
  Plus: <Plus className="h-5 w-5" />,
};

export default function AddWidgetPanel({ id, settings }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const addWidget = useDashboardStore((s) => s.addWidget);
  const widgets = useMemo(() => getAddableWidgetDefinitions(), []);

  const filtered = useMemo(() => {
    if (!searchQuery) return widgets;
    const q = searchQuery.toLowerCase();
    return widgets.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
    );
  }, [searchQuery, widgets]);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569] dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-blue-200 bg-blue-50/50 py-1.5 pl-8 pr-3 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-blue-300 focus:ring-1 focus:ring-blue-300/30 dark:border-neutral-500/30 dark:bg-white/[0.04] dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-400/50"
        />
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-2 gap-2 overflow-y-auto">
        {filtered.map((widget) => (
          <button
            key={widget.type}
            onClick={() => addWidget(widget.type, widget.defaultSize)}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-blue-200 p-3 text-[#1e293b] transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-[#0f172a] dark:border-neutral-500/30 dark:text-neutral-500 dark:hover:border-neutral-400/50 dark:hover:bg-white/[0.03] dark:hover:text-neutral-300"
          >
            {iconMap[widget.icon] || <Plus className="h-5 w-5" />}
            <span className="text-xs font-medium">{widget.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
