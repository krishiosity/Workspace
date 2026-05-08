"use client";

import { create } from "zustand";
import { type ActiveWidget } from "@/types/widgets";

// Define layout types locally to avoid namespace import issues with react-grid-layout
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

type Layouts = Record<string, LayoutItem[]>;

interface WidgetUIState {
  collapsed: boolean;
  maximized: boolean;
}

interface DashboardState {
  // Layout
  layouts: Layouts;
  activeWidgets: ActiveWidget[];
  widgetUIStates: Record<string, WidgetUIState>;

  // Theme
  theme: "light" | "dark";

  // Actions
  addWidget: (type: string, defaultSize: { w: number; h: number }) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layouts: Layouts) => void;
  updateWidgetSettings: (id: string, settings: Record<string, unknown>) => void;
  toggleCollapse: (id: string) => void;
  toggleMaximize: (id: string) => void;
  toggleTheme: () => void;
  resetDashboard: () => void;
}

const STORAGE_KEY = "widget-dashboard-state";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

const defaultWidgets: ActiveWidget[] = [
  { id: "inspo-1", type: "inspo-feed", settings: {} },
  { id: "ai-tool-1", type: "ai-tool", settings: {} },
  { id: "preview-1", type: "product-preview", settings: {} },
  { id: "add-widget-1", type: "add-widget", settings: {} },
  { id: "ai-agents-1", type: "ai-agents", settings: {} },
];

const defaultLayouts: Layouts = {
  lg: [
    { i: "inspo-1", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "ai-tool-1", x: 3, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
    { i: "preview-1", x: 6, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
    { i: "add-widget-1", x: 0, y: 3, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "ai-agents-1", x: 9, y: 3, w: 3, h: 2, minW: 2, minH: 2 },
  ],
  md: [
    { i: "inspo-1", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "ai-tool-1", x: 3, y: 0, w: 4, h: 5, minW: 2, minH: 3 },
    { i: "preview-1", x: 7, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
    { i: "add-widget-1", x: 0, y: 6, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "ai-agents-1", x: 3, y: 5, w: 4, h: 2, minW: 2, minH: 2 },
  ],
  sm: [
    { i: "inspo-1", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "ai-tool-1", x: 3, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
    { i: "preview-1", x: 0, y: 5, w: 3, h: 5, minW: 2, minH: 3 },
    { i: "add-widget-1", x: 0, y: 3, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "ai-agents-1", x: 3, y: 8, w: 3, h: 2, minW: 2, minH: 2 },
  ],
  xs: [
    { i: "inspo-1", x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "ai-tool-1", x: 0, y: 3, w: 4, h: 5, minW: 2, minH: 3 },
    { i: "preview-1", x: 0, y: 8, w: 4, h: 5, minW: 2, minH: 3 },
    { i: "add-widget-1", x: 0, y: 16, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "ai-agents-1", x: 0, y: 18, w: 4, h: 2, minW: 2, minH: 2 },
  ],
};

function loadState(): Partial<DashboardState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore parse errors
  }
  return null;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function persistState(state: DashboardState) {
  if (typeof window === "undefined") return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          layouts: state.layouts,
          activeWidgets: state.activeWidgets,
          widgetUIStates: state.widgetUIStates,
          theme: state.theme,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, 300);
}

export const useDashboardStore = create<DashboardState>((set, get) => {
  const saved = loadState();

  return {
    layouts: saved?.layouts ?? defaultLayouts,
    activeWidgets: saved?.activeWidgets ?? defaultWidgets,
    widgetUIStates: saved?.widgetUIStates ?? {},
    theme: (saved?.theme as "light" | "dark") ?? "light",

    addWidget: (type: string, defaultSize: { w: number; h: number }) => {
      const id = `${type}-${generateId()}`;
      set((state) => {
        const newWidget: ActiveWidget = { id, type, settings: {} };
        const newLayoutItem = {
          i: id,
          x: 0,
          y: Infinity, // react-grid-layout places at bottom
          w: defaultSize.w,
          h: defaultSize.h,
          minW: 2,
          minH: 2,
        };
        const newLayouts = { ...state.layouts };
        for (const bp of Object.keys(newLayouts)) {
          newLayouts[bp] = [...(newLayouts[bp] || []), newLayoutItem];
        }
        const newState = {
          activeWidgets: [...state.activeWidgets, newWidget],
          layouts: newLayouts,
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    removeWidget: (id: string) => {
      set((state) => {
        const newLayouts = { ...state.layouts };
        for (const bp of Object.keys(newLayouts)) {
          newLayouts[bp] = (newLayouts[bp] || []).filter(
            (item) => item.i !== id
          );
        }
        const newUIStates = { ...state.widgetUIStates };
        delete newUIStates[id];
        const newState = {
          activeWidgets: state.activeWidgets.filter((w) => w.id !== id),
          layouts: newLayouts,
          widgetUIStates: newUIStates,
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateLayout: (layouts: Layouts) => {
      set((state) => {
        const newState = { ...state, layouts };
        persistState(newState);
        return { layouts };
      });
    },

    updateWidgetSettings: (id: string, settings: Record<string, unknown>) => {
      set((state) => {
        const newWidgets = state.activeWidgets.map((w) =>
          w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
        );
        const newState = { ...state, activeWidgets: newWidgets };
        persistState(newState);
        return { activeWidgets: newWidgets };
      });
    },

    toggleCollapse: (id: string) => {
      set((state) => {
        const current = state.widgetUIStates[id] || {
          collapsed: false,
          maximized: false,
        };
        const newUIStates = {
          ...state.widgetUIStates,
          [id]: { ...current, collapsed: !current.collapsed, maximized: false },
        };
        const newState = { ...state, widgetUIStates: newUIStates };
        persistState(newState);
        return { widgetUIStates: newUIStates };
      });
    },

    toggleMaximize: (id: string) => {
      set((state) => {
        const current = state.widgetUIStates[id] || {
          collapsed: false,
          maximized: false,
        };
        const newUIStates = {
          ...state.widgetUIStates,
          [id]: {
            ...current,
            maximized: !current.maximized,
            collapsed: false,
          },
        };
        const newState = { ...state, widgetUIStates: newUIStates };
        persistState(newState);
        return { widgetUIStates: newUIStates };
      });
    },

    toggleTheme: () => {
      set((state) => {
        const newTheme: "light" | "dark" = state.theme === "light" ? "dark" : "light";
        const newState = { ...state, theme: newTheme };
        persistState(newState);
        return { theme: newTheme };
      });
    },

    resetDashboard: () => {
      set((state) => {
        const newState = {
          ...state,
          layouts: defaultLayouts,
          activeWidgets: defaultWidgets,
          widgetUIStates: {},
        };
        persistState(newState);
        return {
          layouts: defaultLayouts,
          activeWidgets: defaultWidgets,
          widgetUIStates: {},
        };
      });
    },
  };
});
