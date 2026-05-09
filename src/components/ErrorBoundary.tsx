"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div>
              <p className="text-sm font-medium text-red-500 dark:text-red-400">
                Widget crashed
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-[#0f172a] hover:bg-blue-100 dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/10"
              >
                Retry
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
