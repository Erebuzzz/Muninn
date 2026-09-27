"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";

export function AuthHeaderButton() {
  const { user, isLoading, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-20 h-7 bg-[#141a24] rounded-lg animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={openAuthModal}
        className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span>Sign In</span>
      </button>
    );
  }

  const displayName = user.name || user.email.split("@")[0];
  const initial = (displayName[0] || "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-[#1e2634] text-xs text-white transition"
      >
        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
          {initial}
        </span>
        <span className="max-w-[120px] truncate text-[#e6edf3]">
          {displayName}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[#8b9bb4] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#0e1219] border border-[#1e2634] rounded-xl shadow-xl py-2 z-50 animate-fade-in">
          <div className="px-3.5 py-2 border-b border-[#1c2330]">
            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-[#8b9bb4] truncate font-mono">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setDropdownOpen(false);
              openAuthModal();
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#8b9bb4] hover:text-white hover:bg-[#161c26] transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Switch Account</span>
          </button>
          <button
            onClick={() => {
              setDropdownOpen(false);
              logout();
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
