"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  GripHorizontal,
  Minimize2,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type WidgetShellProps } from "@/types/widgets";

export default function WidgetShell({
  id,
  title,
  children,
  onRemove,
  onMaximize,
  onCollapse,
  onTitleChange,
  isCollapsed,
  isMaximized,
  headerExtra,
}: WidgetShellProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleDoubleClick = useCallback(() => {
    setEditingTitle(true);
  }, []);

  const commitTitle = useCallback(() => {
    setEditingTitle(false);
    if (localTitle !== title && onTitleChange) {
      onTitleChange(id, localTitle);
    }
  }, [localTitle, title, id, onTitleChange]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commitTitle();
      } else if (e.key === "Escape") {
        setLocalTitle(title);
        setEditingTitle(false);
      }
    },
    [commitTitle, title]
  );

  // Escape key exits maximized mode
  useEffect(() => {
    if (!isMaximized) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onMaximize(id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isMaximized, id, onMaximize]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.altKey) {
        e.stopPropagation();
        onMaximize(id);
      }
    },
    [id, onMaximize]
  );

  return (
    <div
      onClick={handleClick}
      className={`
        flex h-full flex-col overflow-hidden rounded-2xl border
        border-blue-200 bg-[#f5f0f1] shadow-sm
        transition-all duration-300 hover:shadow-md hover:shadow-blue-900/[0.06]
        dark:border-neutral-500/50 dark:bg-[#111113] dark:hover:shadow-black/20
        ${isMaximized ? "fixed inset-0 z-50 !h-auto !rounded-none shadow-2xl" : ""}
      `}
    >
      {/* Title Bar - Drag Handle */}
      <div
        className="widget-drag-handle flex shrink-0 cursor-grab items-center gap-2 border-b border-blue-100 bg-blue-50/40 px-3 py-2 active:cursor-grabbing dark:border-neutral-500/30 dark:bg-white/[0.02]"
      >
        <GripHorizontal className="h-4 w-4 shrink-0 text-[#475569] dark:text-neutral-500" />

        {editingTitle ? (
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            className="min-w-0 flex-1 rounded bg-[#f5f0f1] px-1 text-sm font-medium text-[#0f172a] outline-none ring-1 ring-blue-400 dark:bg-neutral-800 dark:text-white dark:ring-neutral-400"
            autoFocus
          />
        ) : (
          <span
            className="min-w-0 flex-1 truncate text-sm font-medium text-[#0f172a] dark:text-neutral-300"
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          >
            {localTitle}
          </span>
        )}

        {headerExtra && (
          <div className="flex shrink-0 items-center gap-1">{headerExtra}</div>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={() => onCollapse(id)}
            className="rounded-md p-1 text-[#475569] transition-all hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => onMaximize(id)}
            className="rounded-md p-1 text-[#475569] transition-all hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => onRemove(id)}
            className="rounded-md p-1 text-[#475569] transition-all hover:bg-red-50 hover:text-red-400 dark:text-neutral-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Remove widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="relative min-h-0 flex-1 overflow-y-auto p-4">
          {children}
        </div>
      )}

      {/* Resize Grip Indicator */}
      {!isCollapsed && !isMaximized && (
        <div className="pointer-events-none absolute bottom-1 right-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="text-[#64748b] dark:text-neutral-600"
          >
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <circle cx="5" cy="9" r="1.5" fill="currentColor" />
            <circle cx="9" cy="5" r="1.5" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
