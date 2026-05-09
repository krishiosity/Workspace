import { type ComponentType } from "react";

export interface WidgetProps {
  id: string;
  settings: Record<string, unknown>;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  component: ComponentType<WidgetProps>;
}

export interface ActiveWidget {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

export interface WidgetShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  onMaximize: (id: string) => void;
  onCollapse: (id: string) => void;
  onTitleChange?: (id: string, title: string) => void;
  isCollapsed: boolean;
  isMaximized: boolean;
  headerExtra?: React.ReactNode;
}
