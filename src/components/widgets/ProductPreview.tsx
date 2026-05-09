"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Pen,
  Square,
  Circle,
  Eraser,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

// --- Plugin system ---
interface PluginTool {
  id: string;
  name: string;
  url: string;
}

const PRESET_TOOLS: { name: string; url: string; color: string }[] = [
  { name: "Figma", url: "https://www.figma.com", color: "#a259ff" },
  { name: "Claude Design", url: "https://claude.ai", color: "#d97706" },
  { name: "Excalidraw", url: "https://excalidraw.com", color: "#6366f1" },
  { name: "tldraw", url: "https://www.tldraw.com", color: "#10b981" },
  { name: "Canva", url: "https://www.canva.com", color: "#00c4cc" },
];

// --- Sketch canvas ---
type SketchTool = "pen" | "rect" | "circle" | "eraser";

const COLORS = ["#a1a1aa", "#71717a", "#3f3f46", "#27272a", "#ef4444", "#3b82f6"];

function SketchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<SketchTool>("pen");
  const [color, setColor] = useState("#3f3f46");
  const [lineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imageData =
        canvas.width > 0 && canvas.height > 0
          ? ctx.getImageData(0, 0, canvas.width, canvas.height)
          : null;
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (imageData) ctx.putImageData(imageData, 0, 0);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const getPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const point = getPoint(e);
      setIsDrawing(true);
      if (tool === "rect" || tool === "circle") {
        setShapeStart(point);
        snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } else {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    },
    [tool, getPoint]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const point = getPoint(e);

      if (tool === "pen" || tool === "eraser") {
        ctx.strokeStyle = tool === "eraser" ? "#f4f4f5" : color;
        ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if ((tool === "rect" || tool === "circle") && shapeStart && snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over";
        if (tool === "rect") {
          ctx.strokeRect(shapeStart.x, shapeStart.y, point.x - shapeStart.x, point.y - shapeStart.y);
        } else {
          const rx = Math.abs(point.x - shapeStart.x) / 2;
          const ry = Math.abs(point.y - shapeStart.y) / 2;
          const cx = shapeStart.x + (point.x - shapeStart.x) / 2;
          const cy = shapeStart.y + (point.y - shapeStart.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
    [isDrawing, tool, color, lineWidth, shapeStart, getPoint]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setShapeStart(null);
    snapshotRef.current = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.globalCompositeOperation = "source-over";
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const tools: { key: SketchTool; icon: React.ReactNode; label: string }[] = [
    { key: "pen", icon: <Pen className="h-3 w-3" />, label: "Pen" },
    { key: "rect", icon: <Square className="h-3 w-3" />, label: "Rectangle" },
    { key: "circle", icon: <Circle className="h-3 w-3" />, label: "Circle" },
    { key: "eraser", icon: <Eraser className="h-3 w-3" />, label: "Eraser" },
  ];

  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50/50 p-0.5 dark:border-neutral-500/50 dark:bg-white/[0.03]">
          {tools.map((t) => (
            <button
              key={t.key}
              onClick={() => setTool(t.key)}
              title={t.label}
              className={`rounded-md p-1 transition-all ${
                tool === t.key
                  ? "bg-[#0f172a] text-white shadow-sm dark:bg-white dark:text-black"
                  : "text-[#475569] hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-4 w-4 rounded-full border-2 transition-transform ${
                color === c
                  ? "scale-110 border-[#0f172a] dark:border-white"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          onClick={clearCanvas}
          title="Clear"
          className="ml-auto rounded-md p-1 text-[#475569] hover:bg-red-50 hover:text-red-400 dark:text-neutral-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-lg border border-blue-200 bg-[#f5f0f1] dark:border-neutral-500/30 dark:bg-white/[0.02]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
        />
      </div>
    </div>
  );
}

// --- Embed panel for plugin tools ---
function EmbedPanel({ plugin }: { plugin: PluginTool }) {
  return (
    <div className="flex h-full flex-col">
      <iframe
        src={plugin.url}
        title={plugin.name}
        className="flex-1 rounded-lg border border-blue-200 dark:border-neutral-500/30"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

// --- Main component ---
export default function ProductPreview({ id, settings, onUpdateSettings }: WidgetProps) {
  const [activeTab, setActiveTab] = useState<string>("sketch");
  const [plugins, setPlugins] = useState<PluginTool[]>(() => {
    const saved = settings.plugins as PluginTool[] | undefined;
    return saved ?? [];
  });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
        setShowCustomForm(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAddMenu]);

  const persistPlugins = useCallback(
    (next: PluginTool[]) => {
      setPlugins(next);
      onUpdateSettings({ plugins: next });
    },
    [onUpdateSettings]
  );

  const addPlugin = useCallback(
    (name: string, url: string) => {
      const pluginId = `plugin-${Date.now()}`;
      const next = [...plugins, { id: pluginId, name, url }];
      persistPlugins(next);
      setActiveTab(pluginId);
      setShowAddMenu(false);
      setShowCustomForm(false);
      setCustomName("");
      setCustomUrl("");
    },
    [plugins, persistPlugins]
  );

  const removePlugin = useCallback(
    (pluginId: string) => {
      const next = plugins.filter((p) => p.id !== pluginId);
      persistPlugins(next);
      if (activeTab === pluginId) setActiveTab("sketch");
    },
    [plugins, activeTab, persistPlugins]
  );

  const activePlugin = plugins.find((p) => p.id === activeTab);

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="mb-2 flex items-center gap-1 overflow-x-auto">
        {/* Sketch tab */}
        <button
          onClick={() => setActiveTab("sketch")}
          className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            activeTab === "sketch"
              ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
              : "text-blue-300 hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
          }`}
        >
          <Pencil className="h-3 w-3" />
          Sketch
        </button>

        {/* Plugin tabs */}
        {plugins.map((plugin) => (
          <div key={plugin.id} className="group flex shrink-0 items-center">
            <button
              onClick={() => setActiveTab(plugin.id)}
              className={`flex items-center gap-1 rounded-l-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeTab === plugin.id
                  ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
                  : "text-[#475569] hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300"
              }`}
            >
              <ExternalLink className="h-3 w-3" />
              {plugin.name}
            </button>
            <button
              onClick={() => removePlugin(plugin.id)}
              className={`rounded-r-lg py-1 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${
                activeTab === plugin.id
                  ? "bg-[#0f172a] text-[#475569] hover:text-red-300 dark:bg-white dark:text-neutral-500 dark:hover:text-red-500"
                  : "text-[#64748b] hover:text-red-400 dark:text-neutral-600"
              }`}
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add tool button */}
        <div className="relative shrink-0" ref={addMenuRef}>
          <button
            onClick={() => {
              setShowAddMenu(!showAddMenu);
              setShowCustomForm(false);
            }}
            className="rounded-lg p-1 text-[#64748b] transition-all hover:bg-blue-50 hover:text-[#0f172a] dark:text-neutral-600 dark:hover:bg-white/[0.06] dark:hover:text-neutral-400"
            title="Plug in a tool"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          {showAddMenu && (
            <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-blue-200/80 bg-white/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-neutral-500/50 dark:bg-neutral-900/95 dark:shadow-black/40">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#475569] dark:text-neutral-500">
                Quick add
              </p>
              {PRESET_TOOLS.map((preset) => {
                const alreadyAdded = plugins.some(
                  (p) => p.name === preset.name
                );
                return (
                  <button
                    key={preset.name}
                    onClick={() => addPlugin(preset.name, preset.url)}
                    disabled={alreadyAdded}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-all ${
                      alreadyAdded
                        ? "cursor-default text-[#64748b] dark:text-neutral-600"
                        : "text-[#0f172a] hover:bg-blue-50/50 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                    {alreadyAdded && (
                      <span className="ml-auto text-[10px] text-[#475569] dark:text-neutral-600">
                        added
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="my-1 border-t border-blue-100 dark:border-neutral-500/30" />

              {!showCustomForm ? (
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-[#0f172a] hover:bg-blue-50/50 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
                >
                  <Plus className="h-3 w-3 text-[#475569] dark:text-neutral-500" />
                  Custom URL...
                </button>
              ) : (
                <div className="flex flex-col gap-1.5 px-1 py-1">
                  <input
                    type="text"
                    placeholder="Tool name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-2 py-1 text-xs text-[#0f172a] outline-none focus:border-blue-300 dark:border-neutral-500/30 dark:bg-white/[0.04] dark:text-neutral-200"
                    autoFocus
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-2 py-1 text-xs text-[#0f172a] outline-none focus:border-blue-300 dark:border-neutral-500/30 dark:bg-white/[0.04] dark:text-neutral-200"
                  />
                  {customUrl.trim() && !customUrl.trim().startsWith("https://") && (
                    <p className="text-[10px] text-red-500">URL must start with https://</p>
                  )}
                  <button
                    onClick={() => {
                      if (customName.trim() && customUrl.trim() && customUrl.trim().startsWith("https://")) {
                        addPlugin(customName.trim(), customUrl.trim());
                      }
                    }}
                    disabled={!customName.trim() || !customUrl.trim() || !customUrl.trim().startsWith("https://")}
                    className="rounded-lg bg-[#0f172a] px-2 py-1 text-xs font-medium text-white transition-all hover:bg-[#0f172a]/90 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active panel */}
      <div className="min-h-0 flex-1">
        {activeTab === "sketch" && <SketchCanvas />}
        {activePlugin && <EmbedPanel plugin={activePlugin} />}
      </div>
    </div>
  );
}
