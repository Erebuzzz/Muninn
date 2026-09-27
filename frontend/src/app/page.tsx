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
import { useAuth } from "@/lib/authContext";
import { localStore } from "@/lib/storage";
import { PrivacyPolicyModal } from "@/components/privacy/PrivacyPolicyModal";
import { DocsModal } from "@/components/docs/DocsModal";

export default function DashboardPage() {
  const { user, openAuthModal, loginDemo } = useAuth();
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [claimsCount, setClaimsCount] = useState<number>(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [inspectedClaimId, setInspectedClaimId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isNative = typeof window !== "undefined" && localStore.isNative();

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
  }, [refreshTrigger, user?.id]);

  const handleExtractionFinished = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <DocsModal isOpen={docsModalOpen} onClose={() => setDocsModalOpen(false)} />

      {/* Auth Banner for Guest State */}
      {!user && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#11151c] to-[#11151c] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {isNative ? "Android Tablet Storage (Local-First)" : "Web Guest Sandbox (One-Time Session)"}
                </p>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {isNative ? "Stored on Device" : "Temporary Tab State"}
                </span>
              </div>
              <p className="text-xs text-[#8b9bb4] mt-0.5">
                {isNative
                  ? "All captured conversations and knowledge graphs remain stored locally on this tablet. Sign-in is optional (syncs to cloud)."
                  : "Data is kept in temporary tab memory. Sign in or register to permanently store your living memory in the cloud."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDocsModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-mono text-[#8b9bb4] hover:text-white bg-[#141a24] hover:bg-[#1a2230] border border-[#1e2634] rounded-lg transition"
            >
              Docs
            </button>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-mono text-[#8b9bb4] hover:text-white bg-[#141a24] hover:bg-[#1a2230] border border-[#1e2634] rounded-lg transition"
            >
              Privacy
            </button>
            <button
              onClick={() => loginDemo()}
              className="px-3 py-1.5 text-xs font-mono text-white bg-[#1a2230] hover:bg-[#222c3e] border border-[#2a374c] rounded-lg transition"
            >
              Explore Sample
            </button>
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0a0d12] bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

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
            Captured conversations
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
            Decisions, tasks, and state
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
            Memory Vault
          </div>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
            <span>Encrypted</span>
            <span className="text-xs font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/40">
              Active
            </span>
          </div>
          <div className="text-[10px] text-[#5a6a84] mt-0.5 font-mono">
            Verified ground-truth graph
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

      {/* Quick Access Footer Row */}
      <div className="flex items-center justify-between text-xs text-[#5a6a84] pt-2 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDocsModalOpen(true)}
            className="hover:text-white transition font-mono text-[11px]"
          >
            Documentation & Guides
          </button>
          <span>•</span>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="hover:text-white transition font-mono text-[11px]"
          >
            Privacy Promise & Policy
          </button>
        </div>
        <div className="font-mono text-[11px] text-[#475569]">
          Muninn Living Memory
        </div>
      </div>
    </div>
  );
}
