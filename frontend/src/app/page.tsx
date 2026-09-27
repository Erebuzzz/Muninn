"use client";

import React, { useState, useEffect, useRef } from "react";
import { VoiceStudio } from "@/components/studio/VoiceStudio";
import { ResurfacingFeed } from "@/components/resurfacing/ResurfacingFeed";
import { MemoryChat } from "@/components/chat/MemoryChat";
import { MemoryGraphView } from "@/components/graph/MemoryGraphView";
import { SensitivityModal } from "@/components/review/SensitivityModal";
import { ClaimInspector } from "@/components/provenance/ClaimInspector";
import { api } from "@/lib/api";
import { Conversation } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { localStore } from "@/lib/storage";
import { PrivacyPolicyModal } from "@/components/privacy/PrivacyPolicyModal";
import { DocsModal } from "@/components/docs/DocsModal";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { CelestialOrb } from "@/components/brand/CelestialOrb";
import { initMythicDust, elasticRecoil } from "@/lib/animations";

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isNative = typeof window !== "undefined" && localStore.isNative();

  // Initialize floating rune dust canvas
  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initMythicDust(canvasRef.current);
      return cleanup;
    }
  }, []);

  const loadData = async () => {
    try {
      const sessionList = await api.listSessions();
      setSessions(sessionList);

      const claims = await api.listClaims();
      setClaimsCount(claims.length);

      const pending = await api.getPendingReview();
      setPendingCount(pending.length);
    } catch {
      // Graceful error handling
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger, user?.id]);

  const handleExtractionFinished = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative space-y-6 pb-20">
      {/* Floating Mythic Background Particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0"
      />

      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <DocsModal isOpen={docsModalOpen} onClose={() => setDocsModalOpen(false)} />

      {/* Hero / Atmospheric Stained Glass Window Banner */}
      <div className="glass-window relative z-10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Sun Orange & Sky Caustic Horizon Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500/30 via-sky-400/50 to-orange-500/30" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-orange-500/30 text-[11px] font-mono text-orange-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              <span>MUNINN • ODIN&apos;S LIVING MIND • SOVEREIGN COGNITION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              You decide what gets heard. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-sky-300">
                We decide what is worth remembering.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Continuous conversational capture, ground-truth claim crystallization, and proactive radar for unresolved engineering dependencies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={(e) => {
                elasticRecoil(e.currentTarget);
                setDocsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-mono font-medium border border-slate-700/80 transition flex items-center gap-2 shadow"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Interactive Codex
            </button>
            <button
              onClick={(e) => {
                elasticRecoil(e.currentTarget);
                loginDemo();
              }}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-mono font-semibold transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <RavenLogo size={16} animated={false} glow={false} />
              Explore Sample Vault
            </button>
          </div>
        </div>
      </div>

      {/* Storage & Privacy Status Bar */}
      <div className="glass-window relative z-10 rounded-xl p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {isNative ? "Tablet Storage: Hardware Local-First" : "Web Guest Sandbox: Ephemeral Memory"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-sky-500/30">
                {isNative ? "Device Local" : "Temporary Tab"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isNative
                ? "Captured discussions stay safely on this device. Sign-in is optional for cross-device cloud sync."
                : "Stored in memory session. Zero server persistence until you sign in."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            Privacy
          </button>
          {!user && (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 text-xs font-mono font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition"
            >
              Sign In (Optional)
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Overview Bar - Frosted Glass Panels */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            {sessions.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Captured dialogues
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Crystallized Claims
          </div>
          <div className="text-xl font-bold font-mono text-orange-400 mt-1">
            {claimsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Decisions, tasks, states
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Sensitivity Gate
          </div>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                pendingCount > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition"
              >
                Review Gate
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {pendingCount > 0 ? "Items awaiting consent" : "Consent intact"}
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Memory Vault
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-1.5 font-mono">
            <span>Online</span>
            <span className="text-[10px] font-mono text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40">
              Active
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Temporal graph synced
          </div>
        </div>
      </div>

      {/* Main Grid: Studio, Spatial Graph, Feed, Oracle */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Studio + Spatial Graph + Resurfacing Radar */}
        <div className="lg:col-span-7 space-y-6">
          <VoiceStudio onExtractionFinished={handleExtractionFinished} />

          <MemoryGraphView
            refreshTrigger={refreshTrigger}
            onSelectClaim={(claimId) => setInspectedClaimId(claimId)}
          />

          <ResurfacingFeed
            refreshTrigger={refreshTrigger}
            onInspectClaim={(claimId) => setInspectedClaimId(claimId)}
          />
        </div>

        {/* Right Column (5 cols): Living Oracle Chat + Past Sessions */}
        <div className="lg:col-span-5 space-y-6">
          <MemoryChat onInspectCitation={(claimId) => setInspectedClaimId(claimId)} />

          {/* Past Recorded Sessions List */}
          <div className="glass-window rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-widest">
                  Recorded Sessions
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  ({sessions.length})
                </span>
              </div>
              <span className="text-[9px] font-mono text-orange-400">TEMPORAL LOG</span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-10 text-center text-xs font-mono text-slate-500 italic">
                No past sessions recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between hover:border-orange-500/40 transition group shadow-sm"
                  >
                    <div>
                      <div className="text-slate-100 font-medium">
                        {sess.title || "Capture Session"}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {new Date(sess.started_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
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

      {/* Modals */}
      <SensitivityModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewed={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <ClaimInspector
        claimId={inspectedClaimId}
        onClose={() => setInspectedClaimId(null)}
      />

      {/* Floating Tactical Bottom Dock */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <div className="glass-window pointer-events-auto px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <RavenLogo size={22} animated={false} glow={false} />
            <span className="text-[11px] font-mono font-semibold text-slate-200 hidden sm:inline">
              MUNINN
            </span>
          </div>

          <CelestialOrb size={26} />

          <span className="text-slate-700">•</span>

          <button
            onClick={() => setDocsModalOpen(true)}
            className="text-xs font-mono text-slate-300 hover:text-orange-400 transition flex items-center gap-1.5"
          >
            <span>Codex</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="text-xs font-mono text-slate-300 hover:text-rose-300 transition flex items-center gap-1.5"
          >
            <span>Privacy Review</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
