import dynamic from "next/dynamic";
import { type WidgetDefinition, type WidgetProps } from "@/types/widgets";
import { type ComponentType } from "react";

const widgetRegistry: Map<string, WidgetDefinition> = new Map();

function lazyWidget(
  loader: () => Promise<{ default: ComponentType<WidgetProps> }>
) {
  return dynamic(loader, {
    loading: () => (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
      </div>
    ),
    ssr: false,
  });
}

// Register all widgets
widgetRegistry.set("inspo-feed", {
  type: "inspo-feed",
  name: "Inspo Feed",
  description: "Browse inspiration from design feeds",
  icon: "Image",
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  component: lazyWidget(
    () => import("@/components/widgets/InspoFeed")
  ),
});

widgetRegistry.set("ai-tool", {
  type: "ai-tool",
  name: "AI Tool",
  description: "Chat with AI assistants",
  icon: "Bot",
  defaultSize: { w: 3, h: 5 },
  minSize: { w: 2, h: 3 },
  component: lazyWidget(
    () => import("@/components/widgets/AiTool")
  ),
});

widgetRegistry.set("product-preview", {
  type: "product-preview",
  name: "Sketch",
  description: "Freehand drawing canvas with shapes and colors",
  icon: "Eye",
  defaultSize: { w: 3, h: 5 },
  minSize: { w: 2, h: 3 },
  component: lazyWidget(
    () => import("@/components/widgets/ProductPreview")
  ),
});

widgetRegistry.set("add-widget", {
  type: "add-widget",
  name: "Add Widget",
  description: "Add new widgets to your dashboard",
  icon: "Plus",
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 2 },
  component: lazyWidget(
    () => import("@/components/dashboard/AddWidgetPanel")
  ),
});

widgetRegistry.set("ai-agents", {
  type: "ai-agents",
  name: "AI Agents",
  description: "Manage AI agent reviewers",
  icon: "Users",
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 2 },
  component: lazyWidget(
    () => import("@/components/widgets/AiAgents")
  ),
});

widgetRegistry.set("notes", {
  type: "notes",
  name: "Notes",
  description: "Quick notes and scratchpad",
  icon: "StickyNote",
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  component: lazyWidget(
    () => import("@/components/widgets/Notes")
  ),
});

widgetRegistry.set("agent-review", {
  type: "agent-review",
  name: "Agent Review",
  description: "View logs of agents working across different models",
  icon: "Terminal",
  defaultSize: { w: 4, h: 4 },
  minSize: { w: 3, h: 3 },
  component: lazyWidget(
    () => import("@/components/widgets/AgentReview")
  ),
});

widgetRegistry.set("timer", {
  type: "timer",
  name: "Timer",
  description: "Pomodoro and countdown timer",
  icon: "Timer",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  component: lazyWidget(
    () => import("@/components/widgets/TimerWidget")
  ),
});

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return widgetRegistry.get(type);
}

export function getAllWidgetDefinitions(): WidgetDefinition[] {
  return Array.from(widgetRegistry.values());
}

export function getAddableWidgetDefinitions(): WidgetDefinition[] {
  return Array.from(widgetRegistry.values()).filter(
    (w) => w.type !== "add-widget"
  );
}

export default widgetRegistry;
