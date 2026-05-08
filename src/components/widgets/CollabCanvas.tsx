"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Square,
  Circle,
  Eraser,
  Trash2,
  UserPlus,
  Copy,
  Check,
  X,
} from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

type Tool = "pen" | "rect" | "circle" | "eraser";

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
}

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
];

const FAKE_COLLABORATORS: Collaborator[] = [
  { id: "c1", name: "Alex", color: "#ec4899", cursor: { x: 0.3, y: 0.4 } },
  { id: "c2", name: "Sam", color: "#10b981", cursor: { x: 0.6, y: 0.7 } },
];

export default function CollabCanvas({ id }: WidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    FAKE_COLLABORATORS
  );
  const [shapeStart, setShapeStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save current drawing
      const imageData =
        canvas.width > 0 && canvas.height > 0
          ? ctx.getImageData(0, 0, canvas.width, canvas.height)
          : null;

      canvas.width = rect.width;
      canvas.height = rect.height;

      // Restore drawing
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Animate fake collaborator cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => ({
          ...c,
          cursor: {
            x: Math.max(0.05, Math.min(0.95, c.cursor.x + (Math.random() - 0.5) * 0.03)),
            y: Math.max(0.05, Math.min(0.95, c.cursor.y + (Math.random() - 0.5) * 0.03)),
          },
        }))
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const point = getCanvasPoint(e);
      setIsDrawing(true);
      lastPointRef.current = point;

      if (tool === "rect" || tool === "circle") {
        setShapeStart(point);
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    },
    [tool, getCanvasPoint]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const point = getCanvasPoint(e);

      if (tool === "pen" || tool === "eraser") {
        ctx.strokeStyle = tool === "eraser" ? "#f4f4f5" : color;
        ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation =
          tool === "eraser" ? "destination-out" : "source-over";
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if ((tool === "rect" || tool === "circle") && shapeStart && snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over";

        if (tool === "rect") {
          ctx.strokeRect(
            shapeStart.x,
            shapeStart.y,
            point.x - shapeStart.x,
            point.y - shapeStart.y
          );
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

      lastPointRef.current = point;
    },
    [isDrawing, tool, color, lineWidth, shapeStart, getCanvasPoint]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setShapeStart(null);
    snapshotRef.current = null;
    lastPointRef.current = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.globalCompositeOperation = "source-over";
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(
      `${window.location.origin}/canvas/${id}?join=true`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [id]);

  const tools: { key: Tool; icon: React.ReactNode; label: string }[] = [
    { key: "pen", icon: <Pen className="h-3.5 w-3.5" />, label: "Pen" },
    { key: "rect", icon: <Square className="h-3.5 w-3.5" />, label: "Rectangle" },
    { key: "circle", icon: <Circle className="h-3.5 w-3.5" />, label: "Circle" },
    { key: "eraser", icon: <Eraser className="h-3.5 w-3.5" />, label: "Eraser" },
  ];

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Top bar: collaborators + invite */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Collaborator avatars */}
          <div className="flex -space-x-2">
            {collaborators.map((c) => (
              <div
                key={c.id}
                title={c.name}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-[#111113]"
                style={{ backgroundColor: c.color }}
              >
                {c.name[0]}
              </div>
            ))}
            {/* You */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0f172a] text-[10px] font-bold text-white dark:border-[#111113] dark:bg-white dark:text-black">
              Y
            </div>
          </div>
          <span className="ml-2 text-[11px] text-[#475569] dark:text-neutral-500">
            {collaborators.length + 1} online
          </span>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-[11px] font-medium text-[#0f172a] transition-colors hover:bg-blue-50 dark:border-neutral-500/50 dark:text-neutral-300 dark:hover:bg-white/[0.06]"
        >
          <UserPlus className="h-3 w-3" />
          Invite
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50/50 p-0.5 dark:border-neutral-500/50 dark:bg-white/[0.03]">
          {tools.map((t) => (
            <button
              key={t.key}
              onClick={() => setTool(t.key)}
              title={t.label}
              className={`rounded-md p-1.5 transition-colors ${
                tool === t.key
                  ? "bg-[#0f172a] text-white shadow-sm dark:bg-white dark:text-black"
                  : "text-[#1e293b] hover:bg-blue-50 dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1">
          {COLORS.slice(0, 6).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                color === c
                  ? "scale-110 border-[#0f172a] dark:border-neutral-200"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Stroke width */}
        <input
          type="range"
          min={1}
          max={12}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="h-1 w-16 cursor-pointer accent-[#0f172a] dark:accent-white"
        />

        <button
          onClick={clearCanvas}
          title="Clear canvas"
          className="ml-auto rounded-md p-1.5 text-[#475569] transition-colors hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-lg border border-blue-200 bg-[#f5f0f1] dark:border-neutral-500/50 dark:bg-[#111113]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 ${
            tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
          }`}
        />

        {/* Collaborator cursors */}
        {collaborators.map((c) => (
          <div
            key={c.id}
            className="pointer-events-none absolute transition-all duration-700 ease-out"
            style={{
              left: `${c.cursor.x * 100}%`,
              top: `${c.cursor.y * 100}%`,
            }}
          >
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M0 0L16 12L8 12L4 20L0 0Z"
                fill={c.color}
              />
            </svg>
            <span
              className="absolute left-4 top-4 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </span>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowInvite(false)}
          />
          <div className="absolute inset-x-3 top-1/3 z-50 rounded-xl border border-blue-200 bg-[#f5f0f1] p-4 shadow-xl dark:border-neutral-500/50 dark:bg-[#111113]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0f172a] dark:text-neutral-200">
                Invite Collaborators
              </h3>
              <button
                onClick={() => setShowInvite(false)}
                className="rounded p-1 text-[#475569] hover:text-[#0f172a] dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-[#1e293b] dark:text-neutral-500">
              Share this link to let others draw on this canvas in real time.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/canvas/${id}?join=true`}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-1.5 text-xs text-[#0f172a] outline-none dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-neutral-300"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-lg bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0f172a]/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>

            {/* Online collaborators list */}
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#475569] dark:text-neutral-500">
                Online now
              </p>
              {collaborators.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name[0]}
                  </div>
                  <span className="text-xs text-[#0f172a] dark:text-neutral-300">
                    {c.name}
                  </span>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f172a] text-[10px] font-bold text-white dark:bg-white dark:text-black">
                  Y
                </div>
                <span className="text-xs text-[#0f172a] dark:text-neutral-300">
                  You
                </span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
