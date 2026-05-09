"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Sun,
  Moon,
  RotateCcw,
  User,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { getAddableWidgetDefinitions } from "@/lib/widget-registry";
import { iconMap } from "@/lib/icon-map";
import WidgetGrid from "./WidgetGrid";

function useIsMac() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);
  return isMac;
}

export default function DashboardShell() {
  const theme = useDashboardStore((s) => s.theme);
  const toggleTheme = useDashboardStore((s) => s.toggleTheme);
  const resetDashboard = useDashboardStore((s) => s.resetDashboard);
  const addWidget = useDashboardStore((s) => s.addWidget);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const isMac = useIsMac();

  // Apply theme to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
        setPaletteSearch("");
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAddFromPalette = useCallback(
    (type: string, defaultSize: { w: number; h: number }) => {
      addWidget(type, defaultSize);
      setCommandPaletteOpen(false);
      setPaletteSearch("");
    },
    [addWidget]
  );

  const allWidgets = getAddableWidgetDefinitions();
  const filteredPaletteWidgets = paletteSearch
    ? allWidgets.filter(
        (w) =>
          w.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
          w.description.toLowerCase().includes(paletteSearch.toLowerCase())
      )
    : allWidgets;

  return (
    <div className="flex h-screen flex-col bg-[#e8e4e0] dark:bg-[#09090b]">
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#0a1628] bg-[#0f172a] px-5 py-3 dark:border-neutral-500/30 dark:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 dark:bg-white">
            <LayoutDashboard className="h-4 w-4 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white dark:text-white">
              Sandbox
            </h1>
            <p className="text-xs text-blue-300 dark:text-neutral-500">
              Creative workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add Widget Button */}
          <button
            onClick={() => {
              setCommandPaletteOpen(true);
              setPaletteSearch("");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 transition-all hover:border-white/30 hover:bg-white/10 dark:border-neutral-500/40 dark:text-neutral-400 dark:hover:border-neutral-400/60 dark:hover:bg-white/[0.05]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Widget
            <kbd className="ml-1 rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-white/50 dark:bg-white/[0.06] dark:text-neutral-500">
              {isMac ? "⌘" : "Ctrl+"}K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {/* Reset Layout */}
          <button
            onClick={resetDashboard}
            className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
            aria-label="Reset layout"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* User Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 dark:bg-white/10">
            <User className="h-4 w-4 text-white dark:text-neutral-300" />
          </div>
        </div>
      </header>

      {/* Grid Area */}
      <main className="flex-1 overflow-auto">
        <WidgetGrid />
      </main>

      {/* Command Palette Modal */}
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-[#0f172a]/30 backdrop-blur-md dark:bg-black/60"
            onClick={() => setCommandPaletteOpen(false)}
          />
          {/* Palette */}
          <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl border border-blue-200 bg-[#f5f0f1]/95 shadow-2xl shadow-blue-900/10 backdrop-blur-xl dark:border-neutral-500/40 dark:bg-[#111113]/95 dark:shadow-black/40">
            <div className="flex items-center border-b border-blue-100 px-4 dark:border-neutral-500/20">
              <Search className="h-4 w-4 shrink-0 text-[#1e293b] dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="flex-1 bg-transparent px-3 py-3 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none dark:text-white dark:placeholder-neutral-500"
                autoFocus
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="rounded p-1 text-[#475569] hover:text-[#0f172a] dark:text-neutral-500 dark:hover:text-neutral-300"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredPaletteWidgets.length === 0 && (
                <div className="py-6 text-center text-sm text-[#475569] dark:text-neutral-500">
                  No widgets found
                </div>
              )}
              {filteredPaletteWidgets.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() =>
                    handleAddFromPalette(widget.type, widget.defaultSize)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-blue-50 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0f172a] dark:bg-white/[0.06] dark:text-neutral-400">
                    {iconMap[widget.icon] || <Plus className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a] dark:text-neutral-200">
                      {widget.name}
                    </p>
                    <p className="text-xs text-[#1e293b] dark:text-neutral-500">
                      {widget.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
