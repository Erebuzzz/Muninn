"use client";

import React, { useState, useEffect } from "react";
import { VoiceStudio } from "@/components/studio/VoiceStudio";
import { ResurfacingFeed } from "@/components/resurfacing/ResurfacingFeed";
import { MemoryChat } from "@/components/chat/MemoryChat";
import { MemoryGraphView } from "@/components/graph/MemoryGraphView";
import { SensitivityModal } from "@/components/review/SensitivityModal";
import { ClaimInspector } from "@/components/provenance/ClaimInspector";
import { api } from "@/lib/api";
import { Conversation, Claim } from "@/lib/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [claimsCount, setClaimsCount] = useState<number>(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [inspectedClaimId, setInspectedClaimId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = async () => {
    try {
      const sessionList = await api.listSessions();
      setSessions(sessionList);

      const claims = await api.listClaims();
      setClaimsCount(claims.length);

      const pending = await api.getPendingReview();
      setPendingCount(pending.length);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleExtractionFinished = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#8b9bb4] uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {sessions.length}
          </div>
          <div className="text-[10px] text-[#5a6a84] mt-0.5 font-mono">
            Opt-in capture recordings
          </div>
        </div>

        <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#8b9bb4] uppercase tracking-wider">
            Indexed Claims
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {claimsCount}
          </div>
          <div className="text-[10px] text-[#5a6a84] mt-0.5 font-mono">
            Verified state & decisions
          </div>
        </div>

        <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#8b9bb4] uppercase tracking-wider">
            Privacy Review Gate
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xl font-bold ${pendingCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
              >
                Review Now
              </button>
            )}
          </div>
          <div className="text-[10px] text-[#5a6a84] mt-0.5 font-mono">
            {pendingCount > 0 ? "Flagged sensitive items" : "All clean; consent intact"}
          </div>
        </div>

        <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-4">
          <div className="text-[11px] font-mono text-[#8b9bb4] uppercase tracking-wider">
            Vector Store
          </div>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
            <span>Neon PG</span>
            <span className="text-xs font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/40">
              pgvector
            </span>
          </div>
          <div className="text-[10px] text-[#5a6a84] mt-0.5 font-mono">
            Serverless memory graph
          </div>
        </div>
      </div>

      {/* Main Grid: Studio + Feed + Memory Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Studio + Resurfacing Feed */}
        <div className="lg:col-span-7 space-y-6">
          <VoiceStudio
            onExtractionFinished={handleExtractionFinished}
          />

          <ResurfacingFeed
            refreshTrigger={refreshTrigger}
            onInspectClaim={(claimId) => setInspectedClaimId(claimId)}
          />

          <MemoryGraphView
            refreshTrigger={refreshTrigger}
            onSelectClaim={(claimId) => setInspectedClaimId(claimId)}
          />
        </div>

        {/* Right Column (5 cols): Living Chat + Recent Sessions */}
        <div className="lg:col-span-5 space-y-6">
          <MemoryChat
            onInspectCitation={(claimId) => setInspectedClaimId(claimId)}
          />

          {/* Recent Recorded Sessions */}
          <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2330] mb-3">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Recorded Sessions
              </h2>
              <span className="text-[10px] font-mono text-[#8b9bb4]">
                History ({sessions.length})
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b] italic">
                No past sessions recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-lg bg-[#0c0f15] border border-[#1e2634] text-xs flex items-center justify-between hover:border-amber-500/30 transition group"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {sess.title || "Capture Session"}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748b] mt-0.5">
                        {new Date(sess.started_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b24] text-[#94a3b8] border border-[#222c3e]">
                        {sess.claim_count || 0} claims
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sensitivity Review Modal */}
      <SensitivityModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewed={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Provenance Inspector Modal */}
      <ClaimInspector
        claimId={inspectedClaimId}
        onClose={() => setInspectedClaimId(null)}
      />
    </div>
  );
}
