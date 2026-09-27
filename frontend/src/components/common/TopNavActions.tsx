"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MythicIcon } from "@/components/common/MythicIcons";
import { BackendStatusPill } from "@/components/common/BackendStatusPill";
import { CelestialOrb } from "@/components/brand/CelestialOrb";
import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";

export function TopNavActions() {
  const pathname = usePathname();
  const isDocs = pathname === "/docs";

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
      {/* Dynamic Nav Pill: If on /docs -> Living Vault; else -> Codex Docs */}
      {isDocs ? (
        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono text-xs font-semibold transition flex items-center shadow-sm"
        >
          <span>Living Vault</span>
        </Link>
      ) : (
        <Link
          href="/docs"
          className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-300 dark:border-slate-800 font-mono text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <MythicIcon.Book size={14} className="text-orange-500 dark:text-orange-400" />
          <span className="hidden sm:inline">Codex Docs</span>
        </Link>
      )}

      {/* GitHub Repository Icon Link */}
      <a
        href="https://github.com/Erebuzzz/Muninn"
        target="_blank"
        rel="noreferrer"
        title="GitHub: github.com/Erebuzzz/Muninn"
        aria-label="GitHub Repository"
        className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 text-slate-700 dark:text-slate-300 transition flex items-center justify-center shadow-sm"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      </a>

      {/* Backend API Health Status */}
      <BackendStatusPill />

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 hidden sm:block" />

      {/* Celestial Orb Theme Switcher */}
      <CelestialOrb size={32} />

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800" />

      {/* Authentication Button */}
      <AuthHeaderButton />
    </div>
  );
}
