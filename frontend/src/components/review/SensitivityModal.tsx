"use client";

import React, { useState, useEffect } from "react";
import { Claim } from "@/lib/types";
import { api } from "@/lib/api";
import { soundFX } from "@/lib/soundfx";

interface SensitivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewed?: () => void;
}

export const SensitivityModal: React.FC<SensitivityModalProps> = ({
  isOpen,
  onClose,
  onReviewed,
}) => {
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [decisions, setDecisions] = useState<{ [id: string]: "store" | "discard" }>({});
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const claims = await api.getPendingReview();
      setPendingClaims(claims);
      const initial: { [id: string]: "store" | "discard" } = {};
      claims.forEach((c) => {
        initial[c.id] = "discard"; // Privacy default is DISCARD
      });
      setDecisions(initial);
    } catch (e) {
      console.error("Failed to fetch pending review claims:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPending();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDecision = (id: string, action: "store" | "discard") => {
    setDecisions((prev) => ({ ...prev, [id]: action }));
  };

  const submitReview = async () => {
    const list = Object.entries(decisions).map(([claim_id, action]) => ({
      claim_id,
      action,
    }));

    try {
      await api.submitReview(list);
      soundFX.playClaimStored();
      if (onReviewed) onReviewed();
      onClose();
    } catch (e) {
      console.error("Failed to submit review decisions:", e);
    }
  };

  const handleDiscardAll = async () => {
    try {
      await api.discardAllPending();
      soundFX.playDiscard();
      if (onReviewed) onReviewed();
      onClose();
    } catch (e) {
      console.error("Failed to discard pending claims:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-window rounded-2xl overflow-hidden max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <h2 className="text-base font-semibold text-white">
                Consent & Sensitivity Review Gate
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Muninn flagged statements involving finances, third parties, or off-the-record phrasing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5 my-4 text-xs text-orange-200/90 leading-relaxed">
          <strong>Privacy Default:</strong> If you dismiss or ignore this prompt, flagged items are automatically <strong>discarded</strong>. Only confirmed items are permanently indexed into your memory graph.
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading pending items...
            </div>
          ) : pendingClaims.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No sensitive items currently awaiting review.
            </div>
          ) : (
            pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Flagged for Review
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(claim.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="text-slate-200 font-sans text-xs italic">
                  &ldquo;{claim.text}&rdquo;
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">
                    Type: <span className="text-white capitalize">{claim.type}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(claim.id, "discard")}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition border ${
                        decisions[claim.id] === "discard"
                          ? "bg-rose-600/20 text-rose-300 border-rose-500/50 font-medium"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => handleDecision(claim.id, "store")}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition border ${
                        decisions[claim.id] === "store"
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-medium"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      Store Permanently
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-auto">
          <button
            onClick={handleDiscardAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition font-mono"
          >
            Discard All & Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition font-mono"
            >
              Cancel
            </button>
            <button
              onClick={submitReview}
              disabled={pendingClaims.length === 0}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold text-xs transition disabled:opacity-50 font-mono shadow"
            >
              Confirm Decisions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
