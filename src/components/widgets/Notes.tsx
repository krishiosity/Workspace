"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { type WidgetProps } from "@/types/widgets";

export default function Notes({ id, settings, onUpdateSettings }: WidgetProps) {
  const [content, setContent] = useState(
    (settings.content as string) || ""
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdateSettings({ content: value });
      }, 500);
    },
    [onUpdateSettings]
  );

  return (
    <div className="flex h-full flex-col">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type your notes here..."
        className="flex-1 resize-none rounded-lg border border-blue-200 bg-blue-50/50 p-3 font-mono text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-300/30 dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-neutral-200"
      />
      <div className="mt-2 text-right text-xs text-[#475569] dark:text-neutral-500">
        {content.length} characters
      </div>
    </div>
  );
}
