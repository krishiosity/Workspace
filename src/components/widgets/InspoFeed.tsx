"use client";

import React, { useState, useMemo } from "react";
import { Search, Bookmark } from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

interface InspoImage {
  id: number;
  seed: number;
  title: string;
  category: string;
}

const MOCK_IMAGES: InspoImage[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  seed: 100 + i * 7,
  title: [
    "Minimal Dashboard UI",
    "Gradient Card Design",
    "Dark Mode Layout",
    "Typography System",
    "Icon Set Preview",
    "Color Palette Grid",
    "Mobile App Concept",
    "Landing Page Hero",
    "Onboarding Flow",
    "Data Viz Charts",
    "Profile Card Design",
    "Notification Panel",
  ][i],
  category: ["UI", "Branding", "Mobile", "Web", "Typography", "Icons"][i % 6],
}));

export default function InspoFeed({ id, settings }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (!searchQuery) return MOCK_IMAGES;
    const q = searchQuery.toLowerCase();
    return MOCK_IMAGES.filter(
      (img) =>
        img.title.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569] dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Search inspiration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-blue-200 bg-blue-50/50 py-1.5 pl-8 pr-3 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-300/30 dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-white dark:placeholder-neutral-500"
        />
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 gap-2 [column-fill:_balance]">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="relative mb-2 break-inside-avoid overflow-hidden rounded-lg"
            onMouseEnter={() => setHoveredId(img.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${img.seed}/300/${
                200 + (img.id % 3) * 60
              }`}
              alt={img.title}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 flex flex-col justify-end rounded-lg bg-gradient-to-t from-black/70 to-transparent p-2 transition-opacity duration-200 ${
                hoveredId === img.id ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-xs font-medium text-white">{img.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
                  {img.category}
                </span>
                <button className="rounded-full bg-white/20 p-1 text-white transition-colors hover:bg-white/40">
                  <Bookmark className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-[#475569] dark:text-neutral-500">
          No results found
        </div>
      )}
    </div>
  );
}
