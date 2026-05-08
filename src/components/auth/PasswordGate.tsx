"use client";

import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, LayoutDashboard } from "lucide-react";

const STORAGE_KEY = "widget-dashboard-auth";
const PASSWORD = "Faith123$#@";

function hashPassword(pw: string): string {
  // Simple hash for client-side gating — not meant for production security
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const char = pw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

const VALID_HASH = hashPassword(PASSWORD);

export default function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === VALID_HASH) {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashPassword(password) === VALID_HASH) {
      localStorage.setItem(STORAGE_KEY, VALID_HASH);
      setAuthenticated(true);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e8e4e0] dark:bg-[#09090b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-[#0f172a] dark:border-neutral-600 dark:border-t-white" />
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#e8e4e0] dark:bg-[#09090b]">
      <div
        className={`w-full max-w-sm rounded-2xl border border-blue-200 bg-[#f5f0f1] p-8 shadow-xl shadow-blue-900/[0.06] dark:border-neutral-500/40 dark:bg-[#111113] dark:shadow-black/40 ${
          shaking ? "animate-shake" : ""
        }`}
      >
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f172a] shadow-lg shadow-blue-900/20 dark:bg-white">
            <LayoutDashboard className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-[#0f172a] dark:text-white">
              Sandbox
            </h1>
            <p className="mt-1 text-sm text-[#1e293b] dark:text-neutral-500">
              Enter password to continue
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569] dark:text-neutral-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              autoFocus
              className={`w-full rounded-xl border bg-blue-50/50 py-2.5 pl-10 pr-10 text-sm text-[#0f172a] outline-none transition-all placeholder:text-[#94a3b8] focus:ring-2 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-neutral-500 ${
                error
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/10 dark:border-red-500/30"
                  : "border-blue-200 focus:border-blue-400 focus:ring-blue-400/10 dark:border-neutral-500/40 dark:focus:border-neutral-400/60 dark:focus:ring-white/5"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] transition-colors hover:text-[#0f172a] dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-center text-xs text-red-500 dark:text-red-400">
              Incorrect password. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#0f172a] py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1e293b] active:bg-[#0c1220] dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:active:bg-neutral-300"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
