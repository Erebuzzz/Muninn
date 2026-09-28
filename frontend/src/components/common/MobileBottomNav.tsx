"use client";

import React from "react";
import { MythicIcon } from "./MythicIcons";
import { soundFX } from "@/lib/soundfx";

export type MobileTab = "studio" | "graph" | "vault" | "radar";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  sessionsCount?: number;
  resurfacingCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  sessionsCount = 0,
  resurfacingCount = 0,
}) => {
  const tabs: Array<{
    id: MobileTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: "studio",
      label: "Oracle",
      icon: <MythicIcon.Oracle size={18} />,
    },
    {
      id: "graph",
      label: "Constellation",
      icon: <MythicIcon.Constellation size={18} />,
    },
    {
      id: "vault",
      label: "Living Vault",
      icon: <MythicIcon.Temporal size={18} />,
      badge: sessionsCount,
    },
    {
      id: "radar",
      label: "Radar",
      icon: <MythicIcon.Radar size={18} />,
      badge: resurfacingCount > 0 ? resurfacingCount : undefined,
    },
  ];

  const handleSelect = (tab: MobileTab) => {
    try {
      soundFX.playTurnDetected();
    } catch {
      // Audio fallback
    }
    onChangeTab(tab);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-1.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-2xl transition-all"
    >
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-orange-500 dark:text-orange-400 font-semibold bg-orange-500/10 dark:bg-orange-500/15"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-orange-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
