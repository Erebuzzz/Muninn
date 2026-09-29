"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { RavenLogo } from "@/components/brand/RavenLogo";
import { CelestialOrb } from "@/components/brand/CelestialOrb";
import Link from "next/link";
import { initAtmosphericSky, elasticRecoil } from "@/lib/animations";
import { MythicIcon } from "@/components/common/MythicIcons";
import { MobileBottomNav, MobileTab } from "@/components/common/MobileBottomNav";

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("studio");
  const [mounted, setMounted] = useState(false);

  // Inline session expansion states
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<Record<string, { claims: Claim[]; raw_transcript: any }>>({});
  const [loadingSession, setLoadingSession] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isNative = typeof window !== "undefined" && localStore.isNative();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const toggleExpandSession = async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(sessionId);

    if (!sessionDetails[sessionId]) {
      try {
        setLoadingSession(sessionId);
        const detail = await api.getSession(sessionId);
        setSessionDetails((prev) => ({
          ...prev,
          [sessionId]: {
            claims: detail.claims || [],
            raw_transcript: detail.conversation?.raw_transcript || null,
          },
        }));
      } catch (err) {
        console.warn("Failed to fetch session detail:", err);
      } finally {
        setLoadingSession(null);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId);
      await api.deleteSession(sessionId);

      // Optimistically remove from state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSessionDetails((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      if (expandedSessionId === sessionId) {
        setExpandedSessionId(null);
      }
      setConfirmDeleteId(null);
      // Trigger cascade refresh for graph & claim tallies
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete session. Please try again.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (isoString: string) => {
    if (!mounted) return "";
    try {
      return new Date(isoString).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const renderRecordedSessionsList = () => (
    <div className="glass-window rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
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
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const isExpanded = expandedSessionId === sess.id;
              const detail = sessionDetails[sess.id];
              const isLoadingThis = loadingSession === sess.id;

              // Parse transcript turns
              let turns: Array<{ speaker?: string; text?: string }> = [];
              let plainTranscript = "";

              const raw = detail?.raw_transcript || sess.raw_transcript;
              if (raw) {
                let parsedRaw = raw;
                if (typeof raw === "string") {
                  try {
                    parsedRaw = JSON.parse(raw);
                  } catch {
                    plainTranscript = raw;
                  }
                }
                if (parsedRaw && Array.isArray(parsedRaw.turns)) {
                  turns = parsedRaw.turns;
                } else if (parsedRaw && typeof parsedRaw.text === "string") {
                  plainTranscript = parsedRaw.text;
                } else if (typeof parsedRaw === "string") {
                  plainTranscript = parsedRaw;
                }
              }

              const extractedClaims = detail?.claims || [];

              return (
                <div
                  key={sess.id}
                  className="rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 transition shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpandSession(sess.id)}
                    className="w-full p-3.5 text-left text-xs flex items-center justify-between hover:bg-orange-500/5 transition cursor-pointer select-none"
                  >
                    <div>
                      <div className="text-slate-900 dark:text-slate-100 font-medium flex items-center gap-2">
                        <span>{sess.title || "Capture Session"}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                        {formatDate(sess.started_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {sess.claim_count || 0} claims
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-orange-400" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Accordion: Full Dialogue & Extracted Claims */}
                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 animate-fade-in">
                      {isLoadingThis ? (
                        <div className="py-4 text-center font-mono text-[11px] text-slate-400 flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          <span>Retrieving session transcript...</span>
                        </div>
                      ) : (
                        <>
                          {/* Dialogue Turns */}
                          <div>
                            <div className="text-[10px] font-mono text-orange-400 font-semibold tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                              <MythicIcon.Oracle size={12} />
                              <span>Turn-by-Turn Dialogue</span>
                            </div>

                            {turns.length > 0 ? (
                              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                                {turns.map((t, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-orange-400/90 font-bold shrink-0 font-mono">
                                      {t.speaker || "Speaker"}:
                                    </span>
                                    <span className="text-slate-200 leading-relaxed font-sans">{t.text}</span>
                                  </div>
                                ))}
                              </div>
                            ) : plainTranscript ? (
                              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                                {plainTranscript}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] font-mono text-slate-400 italic">
                                No transcript text recorded for this session.
                              </div>
                            )}
                          </div>

                          {/* Extracted Claims */}
                          <div>
                            <div className="text-[10px] font-mono text-sky-400 font-semibold tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                              <MythicIcon.Constellation size={12} />
                              <span>Extracted Memory Claims ({extractedClaims.length})</span>
                            </div>

                            {extractedClaims.length > 0 ? (
                              <div className="space-y-1.5">
                                {extractedClaims.map((claim) => (
                                  <div
                                    key={claim.id}
                                    onClick={() => setInspectedClaimId(claim.id)}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 text-xs transition cursor-pointer flex items-start justify-between gap-2"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20">
                                          {claim.type}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-400">
                                          {claim.confidence || "unverified"}
                                        </span>
                                      </div>
                                      <p className="text-slate-200 font-medium leading-relaxed">
                                        {claim.text}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-orange-400 hover:text-orange-300 shrink-0">
                                      Inspect →
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] font-mono text-slate-400 italic">
                                Dialogue captured. No crystallized decisions or tasks identified in this recording.
                              </div>
                            )}
                          </div>

                          {/* Delete Session Action & Inline Confirmation */}
                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            {confirmDeleteId === sess.id ? (
                              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                                <div className="space-y-0.5">
                                  <div className="text-[11px] font-mono text-red-500 dark:text-red-400 font-semibold">
                                    Permanently delete this session?
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                    All associated memory claims and graph nodes will be removed.
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deletingSessionId === sess.id}
                                    onClick={() => handleDeleteSession(sess.id)}
                                    className="px-3 py-1 rounded-lg text-[10px] font-mono font-semibold text-white bg-red-600 hover:bg-red-500 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                  >
                                    {deletingSessionId === sess.id ? (
                                      <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                      </>
                                    ) : (
                                      <span>Confirm Delete</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(sess.id)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 transition flex items-center gap-1.5"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                                  </svg>
                                  <span>Delete Session</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/60 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
        <span>Local Hardware & Memory Index</span>
        <span className="text-orange-600 dark:text-orange-400">Active Node</span>
      </div>
    </div>
  );

  return (
    <div className="relative space-y-6 pb-28 md:pb-20">
      {/* Drifting Clouds & Twinkling Celestial Sky Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-50 z-0"
      />

      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <DocsModal isOpen={docsModalOpen} onClose={() => setDocsModalOpen(false)} />

      {/* Hero / Atmospheric Stained Glass Window Banner */}
      <div className="glass-window relative z-10 rounded-2xl p-5 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500/30 via-sky-400/50 to-orange-500/30" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-orange-500/30 text-[11px] font-mono text-orange-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              <span>MUNINN • ODIN&apos;S LIVING MIND • SOVEREIGN COGNITION</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              You decide what gets heard. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-sky-600 dark:from-orange-400 dark:via-orange-200 dark:to-sky-300">
                We decide what is worth remembering.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Continuous conversational capture, ground-truth claim crystallization, and proactive radar for unresolved engineering dependencies.
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 shrink-0">
            <Link
              href="/docs"
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-orange-400 text-xs font-mono font-medium border border-slate-700/80 transition flex items-center gap-2 shadow"
            >
              <MythicIcon.Book size={14} className="text-orange-400" />
              <span className="hidden sm:inline">Interactive</span> Codex
            </Link>
            <button
              onClick={(e) => {
                elasticRecoil(e.currentTarget);
                loginDemo();
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-mono font-semibold transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <RavenLogo size={16} animated={false} glow={false} />
              Sample Vault
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
                  ? "Device Storage: Hardware Local-First"
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

      {/* MOBILE ADAPTIVE VIEW (Active Tab Selection on Phone Screens < 768px) */}
      <div className="block md:hidden relative z-10 space-y-4">
        {mobileTab === "studio" && (
          <div className="space-y-4 animate-fade-in">
            <VoiceStudio onExtractionFinished={handleExtractionFinished} />
            <MemoryChat onInspectCitation={(claimId) => setInspectedClaimId(claimId)} />
          </div>
        )}

        {mobileTab === "graph" && (
          <div className="animate-fade-in">
            <MemoryGraphView
              refreshTrigger={refreshTrigger}
              onSelectClaim={(claimId) => setInspectedClaimId(claimId)}
            />
          </div>
        )}

        {mobileTab === "vault" && (
          <div className="animate-fade-in">
            {renderRecordedSessionsList()}
          </div>
        )}

        {mobileTab === "radar" && (
          <div className="animate-fade-in">
            <ResurfacingFeed
              refreshTrigger={refreshTrigger}
              onInspectClaim={(claimId) => setInspectedClaimId(claimId)}
            />
          </div>
        )}
      </div>

      {/* TABLET & DESKTOP SYMMETRIC GRID (2, 2, 1 Architecture >= 768px) */}
      <div className="hidden md:block relative z-10 space-y-6">
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

          {renderRecordedSessionsList()}
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

      {/* Mobile Dynamic Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        sessionsCount={sessions.length}
        resurfacingCount={pendingCount}
      />

      {/* Desktop Floating Tactical Dock (>= 768px) */}
      <div className="hidden md:flex fixed bottom-4 inset-x-0 z-40 justify-center pointer-events-none px-4">
        <div className="glass-window pointer-events-auto px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 border border-slate-300/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-300 dark:border-slate-800">
            <RavenLogo size={22} animated={false} glow={false} />
            <span className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">
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
        </div>
      </div>
    </div>
  );
}
