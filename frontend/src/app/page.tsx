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
import Link from "next/link";
import { initAtmosphericSky, elasticRecoil } from "@/lib/animations";
import { MythicIcon } from "@/components/common/MythicIcons";

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

  // Initialize floating atmospheric sky & drifting clouds
  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initAtmosphericSky(canvasRef.current);
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
      {/* Drifting Clouds & Twinkling Celestial Sky Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-50 z-0"
      />

      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <DocsModal isOpen={docsModalOpen} onClose={() => setDocsModalOpen(false)} />

      {/* Hero / Atmospheric Stained Glass Window Banner */}
      <div className="glass-window relative z-10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Sun Orange & Sky Caustic Horizon Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500/30 via-sky-400/50 to-orange-500/30" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-orange-500/30 text-[11px] font-mono text-orange-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              <span>MUNINN • ODIN&apos;S LIVING MIND • SOVEREIGN COGNITION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              You decide what gets heard. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-sky-600 dark:from-orange-400 dark:via-orange-200 dark:to-sky-300">
                We decide what is worth remembering.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Continuous conversational capture, ground-truth claim crystallization, and proactive radar for unresolved engineering dependencies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link
              href="/docs"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-orange-400 text-xs font-mono font-medium border border-slate-700/80 transition flex items-center gap-2 shadow"
            >
              <MythicIcon.Book size={14} className="text-orange-400" />
              Interactive Codex
            </Link>
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
      <div className="glass-window relative z-10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <MythicIcon.Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                {user
                  ? `Authenticated Vault: ${user.email}`
                  : isNative
                  ? "Tablet Storage: Hardware Local-First"
                  : "Curated Sample Vault: Ephemeral Guest Sandbox"}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-sky-300 border border-sky-500/30">
                {user ? "Cloud Synced" : isNative ? "Device Local" : "Curated Demo"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {user
                ? "Your private engineering vault is synchronized to encrypted cloud retention."
                : isNative
                ? "Captured discussions stay safely on this device. Sign-in is optional for cross-device cloud sync."
                : "Curated engineering dialogues loaded. Captured sessions operate in ephemeral memory until you sign in."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-900/10 dark:bg-slate-900 hover:bg-slate-900/20 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-xl transition"
          >
            Privacy
          </button>
          {!user && (
            <button
              onClick={openAuthModal}
              className="px-4 py-1.5 text-xs font-mono font-semibold text-orange-500 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition"
            >
              Sign In (Optional)
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Overview Bar - Frosted Glass Panels */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {sessions.length}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
            Captured dialogues
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Crystallized Claims
          </div>
          <div className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {claimsCount}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
            Decisions, tasks, states
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Sensitivity Gate
          </div>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                pendingCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition"
              >
                Review Gate
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
            {pendingCount > 0 ? "Items awaiting consent" : "Consent intact"}
          </div>
        </div>

        <div className="glass-window rounded-2xl p-4 shadow-lg">
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Memory Vault
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5 font-mono">
            <span>Online</span>
            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-950/40 border border-sky-500/30 dark:border-sky-800/40">
              Active
            </span>
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
            Temporal graph synced
          </div>
        </div>
      </div>

      {/* Symmetric Dashboard Grid: 2, 2, 1 Architecture */}
      <div className="relative z-10 space-y-6">
        {/* Tier 1 (2 Panels): Voice Studio (Capture) & Living Oracle (Chat / Ground-Truth) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <VoiceStudio onExtractionFinished={handleExtractionFinished} />
          <MemoryChat onInspectCitation={(claimId) => setInspectedClaimId(claimId)} />
        </div>

        {/* Tier 2 (2 Panels): Memory Constellation (Deep Void Galaxy) & Recorded Sessions Vault */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <MemoryGraphView
            refreshTrigger={refreshTrigger}
            onSelectClaim={(claimId) => setInspectedClaimId(claimId)}
          />

          {/* Past Recorded Sessions List */}
          <div className="glass-window rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/60 mb-3">
                <div className="flex items-center gap-2">
                  <MythicIcon.Temporal size={16} className="text-orange-500" />
                  <h2 className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-widest">
                    Recorded Sessions
                  </h2>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    ({sessions.length})
                  </span>
                  {!user && (
                    <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                      CURATED SAMPLE VAULT
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-mono text-orange-600 dark:text-orange-400 tracking-wider">
                  TEMPORAL LOG
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="py-14 text-center text-xs font-mono text-slate-500 dark:text-slate-400 italic">
                  No past sessions recorded yet. Start acoustic capture or upload audio above.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs flex items-center justify-between hover:border-orange-500/50 transition group shadow-sm"
                    >
                      <div>
                        <div className="text-slate-900 dark:text-slate-100 font-medium">
                          {sess.title || "Capture Session"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                          {new Date(sess.started_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          {sess.claim_count || 0} claims
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/60 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span>Local Hardware & Memory Index</span>
              <span className="text-orange-600 dark:text-orange-400">Active Node</span>
            </div>
          </div>
        </div>

        {/* Tier 3 (1 Panel, Full-Width Multi-Column): Proactive Resurfacing Radar */}
        <div className="w-full">
          <ResurfacingFeed
            refreshTrigger={refreshTrigger}
            onInspectClaim={(claimId) => setInspectedClaimId(claimId)}
          />
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
        <div className="glass-window pointer-events-auto px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 border border-slate-300/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-300 dark:border-slate-800">
            <RavenLogo size={22} animated={false} glow={false} />
            <span className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
              MUNINN
            </span>
          </div>

          <CelestialOrb size={26} />

          <span className="text-slate-400 dark:text-slate-700">•</span>

          <Link
            href="/docs"
            className="text-xs font-mono text-slate-800 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition flex items-center gap-1.5"
          >
            <MythicIcon.Book size={13} className="text-orange-500" />
            <span>Codex Docs</span>
          </Link>

          <span className="text-slate-400 dark:text-slate-700">•</span>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="text-xs font-mono text-slate-800 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 transition flex items-center gap-1.5"
          >
            <MythicIcon.Shield size={13} className="text-rose-500" />
            <span>Privacy Review</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <span className="text-slate-400 dark:text-slate-700">•</span>

          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
