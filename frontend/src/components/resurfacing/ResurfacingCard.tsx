"use client";

import React, { useRef, useEffect } from "react";
import { ResurfacingItem } from "@/lib/types";
import { crystallizeShard, elasticRecoil } from "@/lib/animations";

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
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardRef.current) {
      crystallizeShard(cardRef.current);
    }
  }, []);

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
          className: "bg-sky-500/10 text-sky-400 border-sky-500/30",
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
    <div
      ref={cardRef}
      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-300 shadow-sm relative group hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${badge.className}`}>
          {badge.label}
        </span>
        <button
          onClick={() => onDismiss(item.id)}
          className="text-slate-500 hover:text-rose-400 text-xs p-1 rounded transition"
          title="Dismiss notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed mb-3">
        {item.message}
      </p>

      {item.subject_claim_text && (
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg mb-3">
          <span className="text-slate-500">Linked Claim: </span>
          <span className="text-slate-300">&ldquo;{item.subject_claim_text}&rdquo;</span>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
        <span className="text-slate-500 font-mono text-[10px]">
          {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>

        {item.subject_claim_id && onInspectClaim && (
          <button
            onClick={(e) => {
              elasticRecoil(e.currentTarget);
              onInspectClaim(item.subject_claim_id!);
            }}
            className="text-amber-400 hover:text-amber-300 font-mono text-xs font-semibold transition flex items-center gap-1.5"
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
