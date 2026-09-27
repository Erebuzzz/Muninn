"use client";

import React, { useState } from "react";

interface BrainGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrainGraphModal({ isOpen, onClose }: BrainGraphModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mermaidSource = `flowchart TD
    %% Muninn Agent Brain Workflow Graph
    Init[Project: Muninn Living Memory] --> Spec[Spec: Opt-in, Provenance, Living Memory]
    Spec --> DB[Neon PostgreSQL with pgvector provisioned]
    Spec --> Monorepo[Monorepo Architecture: Web, Cloudflare Worker, Python Backend, Android APK]
    
    DB --> SchemaInit[Schema Applied: users with password_hash/salt, conversations, speakers, entities, claims, relationships, task_state, resurfacing_events]
    
    Monorepo --> Worker[Primary Backend: Cloudflare Workers + Hono /worker]
    Monorepo --> Backend[Alternative Backend: FastAPI /backend]
    Monorepo --> Frontend[Next.js 15 Frontend /frontend]
    Monorepo --> Android[Capacitor Android Shell /frontend/android]

    Worker --> W_Driver[@neondatabase/serverless: Zero cold-start HTTP driver]
    Worker --> W_Auth[Auth Service: Web Crypto PBKDF2 100k iters + Hono JWT HS256]
    Worker --> W_LLMGateway[LLM Gateway: strict json_schema, json-repair, cache_control, fallbacks: gemini-2.5-flash & claude-haiku]
    Worker --> W_SyncSTT[Sync STT Service: POST sync.assemblyai.com for sub-second quick voice notes]
    Worker --> W_Services[services: AuthService, VoiceAgentService, ExtractionService, ResurfacingService, ContextEngineService, SyncSTTService]
    Worker --> W_Routes[routes: auth, sessions with quick-note, claims, review, graph, resurfacing, chat]
    Worker --> W_Verified[Verified: Typecheck clean, dry-run bundle 91 KiB, live endpoints on port 8000]

    Backend --> BE_DB[app/db: async SQLAlchemy models and session with SSL]
    Backend --> BE_Services[app/services: VoiceAgent, Extraction, Resurfacing, ContextEngine]
    Backend --> BE_API[app/api: sessions, claims, review, graph, resurfacing, chat]
    Backend --> BE_Tests[tests: test_extraction, test_resurfacing: 4/4 passing]

    Frontend --> FE_Auth[components/auth: AuthModal, AuthHeaderButton, AuthProvider with Capacitor Preferences]
    Frontend --> FE_Audio[public/pcm-processor.js: 24kHz AudioWorklet]
    Frontend --> FE_Studio[components/studio: VoiceStudio with Live Session & Quick Memo Sync STT]
    Frontend --> FE_Resurfacing[components/resurfacing: ResurfacingFeed and Card]
    Frontend --> FE_Review[components/review: SensitivityModal: default discard]
    Frontend --> FE_Provenance[components/provenance: ClaimInspector with CTE chains]
    Frontend --> FE_Chat[components/chat: MemoryChat with ground-truth citations]
    Frontend --> FE_Graph[components/graph: MemoryGraphView interactive explorer]
    Frontend --> FE_Sound[lib/soundfx.ts: Web Audio API tactile cues]
    Frontend --> FE_Storage[lib/storage.ts: Local-First Drafts, Offline Queue, and Auth Token Store]

    Android --> AND_Service[RecordingForegroundService: Android Foreground Service]
    Android --> AND_Plugin[ForegroundRecordingPlugin: Capacitor Native Bridge]
    Android --> AND_Prefs[Capacitor Preferences Plugin: Android SharedPreferences Token Retention]
    Android --> AND_Notification[Ongoing Notification: Low-Memory Killer Protection]
    Android --> AND_AVD[AVD Emulator: MuninnTablet Pixel Tablet on Android 34]
    Android --> AND_Build[Gradle AssembleDebug: app-debug.apk 4.45 MB]
    Android --> AND_Verified[AVD Live Verification: Claim Extraction, Provenance Inspector, Resurfacing Feed]

    W_Verified --> ReadyState[Status: Monorepo Enhanced with Self-Contained Auth, LLM Gateway Resilience & Sync STT]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#0e1219] border border-[#1e2634] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1c2330] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Muninn Agent Brain Graph
              </h2>
              <p className="text-xs text-[#8b9bb4]">
                Architecture DAG and execution state tracking across Cloudflare Worker, Next.js, and Android
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8b9bb4] hover:text-white p-1 rounded-lg hover:bg-[#161c26] transition"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-[#141a24] border border-[#1e2634] flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white">Source File Location</p>
              <p className="text-[11px] font-mono text-amber-400 mt-0.5">d:\Muninn\brain\graph.mermaid</p>
              <p className="text-[10px] text-[#8b9bb4] mt-1">
                Updated before every agent handoff to record the exact trajectory and dependencies.
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#1f2937] hover:bg-[#283548] text-xs font-mono text-white transition shrink-0 flex items-center gap-1.5"
            >
              {copied ? "Copied!" : "Copy Mermaid"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider font-mono">
              System Nodes and Flow
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#11151c] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1 text-cyan-300">1. Edge Worker Runtime</span>
                <p className="text-[#8b9bb4] text-[11px]">
                  Cloudflare Workers running Hono with zero cold-start pooler connection to Neon PostgreSQL, Web Crypto PBKDF2 password hashing, and HS256 JWT edge token verification.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#11151c] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1 text-amber-300">2. AssemblyAI Integration</span>
                <p className="text-[#8b9bb4] text-[11px]">
                  LLM Gateway with strict JSON schema validation, automatic json-repair, prompt caching, multi-model fallback, and Sync STT for sub-second quick voice notes.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#11151c] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1 text-emerald-300">3. Frontend & Local Store</span>
                <p className="text-[#8b9bb4] text-[11px]">
                  Next.js 15 with 24kHz PCM AudioWorklet, interactive knowledge graph, ground-truth citation chat, ephemeral web guest mode, and offline queue.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#11151c] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1 text-rose-300">4. Android Tablet APK</span>
                <p className="text-[#8b9bb4] text-[11px]">
                  Native Capacitor shell with ongoing Android Foreground Service to prevent background recording termination, and SharedPreferences token retention.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider font-mono mb-2">
              Mermaid Specification
            </div>
            <pre className="p-4 rounded-xl bg-[#080b0f] border border-[#1c2330] text-[11px] font-mono text-[#8b9bb4] overflow-x-auto leading-relaxed">
              {mermaidSource}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c2330] flex items-center justify-between text-xs text-[#5a6a84]">
          <span>Developer: Kshitiz Kumar (github.com/Erebuzzz)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1f2937] hover:bg-[#283548] text-white text-xs font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
