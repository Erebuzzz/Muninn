"use client";

import React, { useState, useEffect } from "react";
import { Claim, Relationship } from "@/lib/types";
import { api } from "@/lib/api";

interface ClaimInspectorProps {
  claimId: string | null;
  onClose: () => void;
  onSelectRelatedClaim?: (id: string) => void;
}

export const ClaimInspector: React.FC<ClaimInspectorProps> = ({
  claimId,
  onClose,
  onSelectRelatedClaim,
}) => {
  const [data, setData] = useState<{
    claim: Claim;
    conversation_title?: string | null;
    incoming_relationships: Relationship[];
    outgoing_relationships: Relationship[];
  } | null>(null);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!claimId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const detail = await api.getClaim(claimId);
        setData(detail);
        const deps = await api.getDependencies(claimId);
        setDependencies(deps);
      } catch (e) {
        console.error("Failed to load claim detail:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [claimId]);

  if (!claimId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-window rounded-2xl overflow-hidden max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                PROVENANCE INSPECTOR
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                ID: {claimId.substring(0, 8)}...
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white mt-1">
              Source Conversation & Dependency Chain
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {loading || !data ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Resolving claim provenance...
            </div>
          ) : (
            <>
              {/* Claim Statement */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="capitalize font-mono px-2 py-0.5 rounded-full bg-slate-950/80 text-orange-400 border border-slate-800">
                    {data.claim.type}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(data.claim.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  &ldquo;{data.claim.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Speaker: <strong className="text-white">{data.claim.speaker_tag || "Speaker A"}</strong></span>
                  <span>Confidence: <strong className="text-white">{data.claim.confidence || "unverified"}</strong></span>
                  <span>Sensitivity: <strong className="text-white">{data.claim.sensitivity}</strong></span>
                </div>
              </div>

              {/* Source Provenance */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-semibold text-white">Source Context</div>
                <div className="text-slate-400">
                  Conversation: <span className="text-orange-400">{data.conversation_title || "Direct Audio Capture"}</span>
                </div>
                {data.claim.entities.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-slate-400 text-[11px]">Linked Entities:</span>
                    {data.claim.entities.map((e) => (
                      <span
                        key={e.id}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-sky-400 border border-slate-800"
                      >
                        {e.name} ({e.type})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependency Chain */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Recursive Dependency Chain</span>
                  <span className="font-mono text-[10px] text-slate-400">PostgreSQL CTE</span>
                </div>

                {dependencies.length === 0 ? (
                  <div className="text-slate-400 italic py-2">
                    No structural links (blocks, depends on, or resolves) attached to this claim.
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {dependencies.map((dep, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="text-xs">
                          <span className="text-white">{dep.from_text}</span>
                          <span className="mx-2 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono text-[10px] border border-orange-500/20">
                            {dep.relation_type}
                          </span>
                          <span className="text-slate-300">{dep.to_text}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          Depth {dep.depth}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs transition border border-slate-800 font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
