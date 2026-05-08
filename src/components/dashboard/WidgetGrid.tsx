"use client";

import React, { useMemo, useCallback } from "react";
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from "react-grid-layout";
import { useDashboardStore } from "@/lib/store";
import { getWidgetDefinition } from "@/lib/widget-registry";
import WidgetShell from "./WidgetShell";

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4 };
const ROW_HEIGHT = 80;

export default function WidgetGrid() {
  const layouts = useDashboardStore((s) => s.layouts);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const widgetUIStates = useDashboardStore((s) => s.widgetUIStates);
  const updateLayout = useDashboardStore((s) => s.updateLayout);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const toggleCollapse = useDashboardStore((s) => s.toggleCollapse);
  const toggleMaximize = useDashboardStore((s) => s.toggleMaximize);
  const updateWidgetSettings = useDashboardStore((s) => s.updateWidgetSettings);

  const { width: containerWidth, mounted, containerRef } = useContainerWidth();

  const handleLayoutChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_layout: any, allLayouts: any) => {
      // Convert readonly layouts to mutable for our store
      const mutableLayouts: Record<string, any[]> = {};
      for (const [key, value] of Object.entries(allLayouts)) {
        mutableLayouts[key] = Array.isArray(value) ? [...value] : [];
      }
      updateLayout(mutableLayouts);
    },
    [updateLayout]
  );

  const widgetElements = useMemo(() => {
    return activeWidgets.map((widget) => {
      const definition = getWidgetDefinition(widget.type);
      if (!definition) return null;

      const Component = definition.component;
      const uiState = widgetUIStates[widget.id] || {
        collapsed: false,
        maximized: false,
      };

      return (
        <div key={widget.id} className="relative">
          <WidgetShell
            id={widget.id}
            title={definition.name}
            onRemove={removeWidget}
            onMaximize={toggleMaximize}
            onCollapse={toggleCollapse}
            isCollapsed={uiState.collapsed}
            isMaximized={uiState.maximized}
          >
            <Component
              id={widget.id}
              settings={widget.settings}
              onUpdateSettings={(settings) =>
                updateWidgetSettings(widget.id, settings)
              }
            />
          </WidgetShell>
        </div>
      );
    });
  }, [
    activeWidgets,
    widgetUIStates,
    removeWidget,
    toggleMaximize,
    toggleCollapse,
    updateWidgetSettings,
  ]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-[#0f172a] dark:border-neutral-600 dark:border-t-white" />
      </div>
    );
  }

  if (activeWidgets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-2xl bg-blue-50 p-6 dark:bg-white/[0.04]">
          <svg
            className="mx-auto h-12 w-12 text-[#475569] dark:text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#0f172a] dark:text-neutral-300">
            No widgets yet
          </h3>
          <p className="mt-1 text-sm text-[#1e293b] dark:text-neutral-500">
            Press <kbd className="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-[#0f172a] dark:bg-white/[0.08] dark:text-neutral-400">Cmd+K</kbd> to add your first widget
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full">
      {containerWidth > 0 && (
        <ResponsiveGridLayout
          className="layout"
          width={containerWidth}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          onLayoutChange={handleLayoutChange}
          dragConfig={{ enabled: true, handle: ".widget-drag-handle", bounded: false, threshold: 3 }}
          resizeConfig={{ enabled: true, handles: ["se"] }}
          compactor={verticalCompactor}
          margin={[16, 16] as const}
          containerPadding={[16, 16] as const}
        >
          {widgetElements}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
