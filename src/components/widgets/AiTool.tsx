"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, ChevronDown } from "lucide-react";
import { type WidgetProps } from "@/types/widgets";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const MODELS = ["Claude Sonnet", "Claude Opus", "Claude Haiku"];

const CANNED_REPLIES = [
  "That's a great question! Based on the context, I'd suggest exploring a modular component architecture with clear separation of concerns. This approach will make your codebase more maintainable and testable.",
  "I can help with that. Here's what I'd recommend: start by defining your data model, then build out the API layer, and finally connect the UI components. Would you like me to go deeper on any of these steps?",
  "Interesting approach! You might want to consider using a state management solution like Zustand for this use case. It provides a simpler API compared to Redux while still offering powerful features like middleware support.",
  "Let me think about this... The optimal solution would involve caching at multiple levels: in-memory for hot data, localStorage for persistence, and a service worker for offline support. Shall I elaborate?",
];

export default function AiTool({ id, settings, onUpdateSettings }: WidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    (settings.model as string) || MODELS[0]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI response after delay
    setTimeout(() => {
      const reply =
        CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
      replyIndex.current += 1;
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  }, [input, isTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Model Selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setModelOpen(!modelOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1 text-xs font-medium text-[#0f172a] transition-colors hover:bg-blue-50 dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-neutral-300 dark:hover:bg-white/[0.06]"
        >
          {selectedModel}
          <ChevronDown className="h-3 w-3" />
        </button>
        {modelOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-blue-200 bg-[#f5f0f1] py-1 shadow-lg dark:border-neutral-500/50 dark:bg-[#111113]">
            {MODELS.map((model) => (
              <button
                key={model}
                className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-blue-50 dark:hover:bg-white/[0.06] ${
                  model === selectedModel
                    ? "font-medium text-[#0f172a] dark:text-white"
                    : "text-[#0f172a] dark:text-neutral-300"
                }`}
                onClick={() => {
                  setSelectedModel(model);
                  setModelOpen(false);
                  onUpdateSettings({ model });
                }}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-[#475569] dark:text-neutral-500">
            <div>
              <p className="font-medium">Start a conversation</p>
              <p className="mt-1 text-xs">Ask anything to get started</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#0f172a] text-white dark:bg-white dark:text-black"
                  : "bg-blue-50 font-mono text-[#0f172a] dark:bg-white/[0.05] dark:text-neutral-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-xl bg-blue-50 px-4 py-3 dark:bg-white/[0.05]">
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 dark:bg-neutral-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 dark:bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 dark:bg-neutral-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-300/30 dark:border-neutral-500/50 dark:bg-white/[0.03] dark:text-white"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="rounded-lg bg-[#0f172a] p-2 text-white transition-colors hover:bg-[#0f172a]/90 disabled:opacity-40 disabled:hover:bg-[#0f172a] dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:disabled:hover:bg-white"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
