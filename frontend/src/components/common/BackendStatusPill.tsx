"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { elasticRecoil } from "@/lib/animations";

interface BackendStatusPillProps {
  onReconnected?: () => void;
  className?: string;
}

export const BackendStatusPill: React.FC<BackendStatusPillProps> = ({
  onReconnected,
  className = "",
}) => {
  const [online, setOnline] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = api.subscribeStatus((status) => {
      setOnline(status);
    });
    // Check initial health
    api.checkHealth();
    return unsubscribe;
  }, []);

  const handleReconnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    elasticRecoil(e.currentTarget);
    setChecking(true);
    try {
      const isUp = await api.checkHealth();
      if (isUp && onReconnected) {
        onReconnected();
      }
    } finally {
      setChecking(false);
    }
  };

  const isEdge =
    typeof window !== "undefined" &&
    ((process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) ||
      (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"));

  const onlineText = isEdge ? "Edge API Online" : "Local API Online";
  const onlineTitle = isEdge
    ? "Cloudflare Worker Edge API Online (muninn-api.kshitiz23kumar.workers.dev)"
    : "Local Backend API Online (Port 8000)";

  const offlineText = isEdge ? "Edge API Offline" : "API Offline";
  const offlineTitle = isEdge
    ? "Cloudflare Worker Edge API Unreachable"
    : "Backend Server Disconnected on Port 8000";

  if (online) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 shadow-sm ${className}`}
        title={onlineTitle}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{onlineText}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/60 text-[10px] font-mono text-orange-300 shadow-md shadow-orange-500/10 ${className}`}
      title={offlineTitle}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
        <span>{offlineText}</span>
      </div>
      <button
        onClick={handleReconnect}
        disabled={checking}
        className="px-1.5 py-0.5 rounded bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold transition disabled:opacity-50"
      >
        {checking ? "Checking..." : "Reconnect ↻"}
      </button>
    </div>
  );
};
