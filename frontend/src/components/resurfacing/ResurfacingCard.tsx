"use client";

import React from "react";
import { ResurfacingItem } from "@/lib/types";

interface ResurfacingCardProps {
  item: ResurfacingItem;
  onDismiss: (id: string) => void;
  onInspectClaim?: (claimId: string) => void;
}

export const ResurfacingCard: React.FC<ResurfacingCardProps> = ({
  item,
  onDismiss,
  onInspectClaim,
}) => {
  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "blocked_now_unblocked":
        return {
          label: "Blocked Task Unblocked",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "reopened_question":
        return {
          label: "Reopened Question",
          className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        };
      case "conflicting_decision":
        return {
          label: "Conflicting Decision",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };
      case "stale_and_relevant":
      default:
        return {
          label: "Unfinished Prior Work",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
    }
  };

  const badge = getReasonBadge(item.reason);

  return (
    <div className="bg-[#141923] border border-[#222c3e] hover:border-amber-500/40 rounded-xl p-4 transition shadow-sm relative group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
        <button
          onClick={() => onDismiss(item.id)}
          className="text-[#64748b] hover:text-[#94a3b8] text-xs p-1 rounded transition"
          title="Dismiss note"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-[#e2e8f0] leading-relaxed mb-3">
        {item.message}
      </p>

      {item.subject_claim_text && (
        <div className="text-[11px] font-mono text-[#8b9bb4] bg-[#0c0f15] border border-[#1a212d] p-2 rounded mb-3">
          <span className="text-[#5a6a84]">Linked claim: </span>
          &ldquo;{item.subject_claim_text}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1c2330]">
        <span className="text-[#64748b] font-mono text-[10px]">
          {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>

        {item.subject_claim_id && onInspectClaim && (
          <button
            onClick={() => onInspectClaim(item.subject_claim_id!)}
            className="text-amber-400 hover:text-amber-300 font-medium transition flex items-center gap-1"
          >
            Inspect Provenance
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
