"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { CelestialOrb } from "@/components/brand/CelestialOrb";
import { MythicIcon } from "@/components/common/MythicIcons";
import { ElementalFlowGraph } from "@/components/docs/ElementalFlowGraph";
import { MuninnAnimatedPoster } from "@/components/brand/MuninnAnimatedPoster";
import { runeCipherDecode, elasticRecoil } from "@/lib/animations";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [simStep, setSimStep] = useState<number>(1);
  const [simText, setSimText] = useState<string>(
    "Speaker A: 'We decided to switch our backend runtime from Express to TypeScript with Hono for edge performance.'"
  );
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const sections = [
    { id: "overview", title: "1. System Philosophy", icon: "Sparkle" as const },
    { id: "simulation", title: "2. Interactive Walkthrough", icon: "Terminal" as const },
    { id: "user-guide", title: "3. User Guide & Capture", icon: "Mic" as const },
    { id: "architecture", title: "4. Elemental Architecture", icon: "Constellation" as const },
    { id: "audioworklet", title: "5. Realtime AudioWorklet", icon: "Radar" as const },
    { id: "knowledge-graph", title: "6. Memory Constellation", icon: "Database" as const },
    { id: "resurfacing", title: "7. Proactive Resurfacing", icon: "Search" as const },
    { id: "storage-privacy", title: "8. Dual Storage Isolation", icon: "Shield" as const },
    { id: "developer-demo", title: "9. Developer Demo Walkthrough", icon: "Book" as const },
  ];

  const handleSimStep = (step: number) => {
    setSimStep(step);
    const box = document.getElementById("docs-sim-cipher");
    if (step === 1) {
      const phrase = "Speaker A: 'We decided to switch our backend runtime from Express to TypeScript with Hono for edge performance.'";
      setSimText(phrase);
      if (box) runeCipherDecode(box, phrase, 700);
    } else if (step === 2) {
      const phrase = "Crystallized Claim: [DECISION #892] Migrated backend runtime to Hono for cloudflare-ready edge performance.";
      setSimText(phrase);
      if (box) runeCipherDecode(box, phrase, 800);
    } else if (step === 3) {
      const phrase = "Proactive Radar: 'Attention: 2 unblocked deployment tasks depend on this Hono runtime migration.'";
      setSimText(phrase);
      if (box) runeCipherDecode(box, phrase, 750);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="relative space-y-6 text-slate-800 dark:text-slate-200 pb-12">
      {/* Top Context Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <RavenLogo size={22} animated={false} glow={false} />
          <h1 className="text-sm font-serif font-bold text-slate-900 dark:text-white">
            Muninn Codex
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            ARCHITECTURAL REFERENCE
          </span>
        </div>

        <a
          href="https://github.com/Erebuzzz/Muninn"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition flex items-center gap-1.5"
        >
          <span>github.com/Erebuzzz/Muninn</span>
          <MythicIcon.External size={12} />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 space-y-3 glass-window rounded-2xl p-4 shadow-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">
              Codex Index
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              9 SECTIONS
            </span>
          </div>

          <nav className="space-y-1">
            {sections.map((sec) => {
              const IconComponent = MythicIcon[sec.icon];
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2.5 ${
                    isActive
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <IconComponent size={14} className={isActive ? "text-orange-500" : "text-slate-400"} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Section 1: System Philosophy */}
            {activeSection === "overview" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Sparkle size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                      The Living Memory System
                    </h1>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                      Norse Mythology Origin: Muninn (Old Norse: &ldquo;Memory&rdquo; or &ldquo;Mind&rdquo;)
                    </p>
                  </div>
                </div>

                <MuninnAnimatedPoster className="mb-6 shadow-2xl" />

                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  <p>
                    In Norse mythology, the Allfather Odin was accompanied by two sacred ravens: <strong>Huginn</strong> (&ldquo;thought&rdquo;) and <strong>Muninn</strong> (&ldquo;memory&rdquo;). At the break of every dawn, Odin sent them soaring across the Nine Realms. At eventide, they returned to perch on his shoulders, whispering the deeds, pacts, and truths of the cosmos into his ears.
                  </p>
                  <p>
                    Modern technical teams suffer not from a lack of speech, but from the rapid decay of ephemeral conversation. Engineering discussions, architectural compromises, and product roadmaps evaporate the moment a call ends or a whiteboard is erased.
                  </p>
                  <p>
                    <strong>Muninn</strong> is engineered as a living companion that listens to dialogue, isolates ground-truth claims with second-accurate timestamps, weaves an interconnected relational memory graph, and proactively surfaces conflicting decisions and unblocked tasks before work breaks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 block mb-1">
                      1. Acoustic Diarization
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Real-time 24kHz AudioWorklet stream isolates multi-speaker turns with sub-second precision.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 block mb-1">
                      2. Immutable Citations
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Every claim links directly back to its acoustic provenance with zero hallucinated state.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                      3. Proactive Radar
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Continuous knowledge synthesis flags contradicted pacts and activates unblocked dependencies.
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* Section 2: Interactive Simulation */}
            {activeSection === "simulation" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                      <MythicIcon.Terminal size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                        Interactive Walkthrough Simulation
                      </h2>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Experience the triple-stage pipeline: Capture → Extraction → Resurfacing
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  Click through the three pipeline stages below to observe how Muninn decodes live audio turns, extracts ground-truth decisions with Elder Futhark cryptographic ciphers, and triggers proactive dependency alerts.
                </p>

                {/* 3 Step Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: 1, title: "1. Acoustic Capture", desc: "Raw AudioWorklet turn decoded" },
                    { step: 2, title: "2. Ground-Truth Claim", desc: "Structured entity isolated" },
                    { step: 3, title: "3. Proactive Resurfacing", desc: "Dependency conflict alerted" },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => handleSimStep(s.step)}
                      className={`p-3.5 rounded-xl border text-left transition font-mono ${
                        simStep === s.step
                          ? "bg-orange-500/10 dark:bg-orange-950/30 border-orange-500 text-orange-600 dark:text-orange-300 shadow"
                          : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">{s.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Simulated Cipher Box */}
                <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-2 text-orange-400">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                      SIMULATION PIPELINE STAGE {simStep} OF 3
                    </span>
                    <span>ELDER FUTHARK CIPHER DECODE</span>
                  </div>
                  <div id="docs-sim-cipher" className="text-slate-100 min-h-[56px] leading-relaxed text-sm">
                    {simText}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleSimStep(simStep < 3 ? simStep + 1 : 1)}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono text-xs font-semibold transition shadow-lg flex items-center gap-2"
                  >
                    <span>{simStep < 3 ? `Advance to Stage ${simStep + 1} →` : "Restart Simulation ↺"}</span>
                  </button>
                </div>
              </article>
            )}

            {/* Section 3: User Guide & Capture */}
            {activeSection === "user-guide" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Mic size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      End-User Capture & Operation Guide
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      How to interact with Muninn across desktop, tablet, and mobile
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Two Complementary Capture Workflows
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                        <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400 block mb-1">
                          A. Live Capture Session
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Designed for collaborative meetings, standups, and architectural pairings. Provides real-time AudioWorklet audio-reactive waveform feedback, live transcript decoding, and speaker turn segregation.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                        <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400 block mb-1">
                          B. 1-Tap Quick Memo
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Engineered for sudden epiphanies, bug notes, or immediate decisions on the move. Tap the microphone once, speak your thought, and tap stop. Muninn processes the audio chunk directly through AssemblyAI.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      Voice Agent Operating Modes: Co-Pilot vs Scribe
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                        <span className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400 block mb-1">
                          1. Co-Pilot Mode (Active Peer)
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Muninn actively collaborates in technical discussions, answering architecture questions, clarifying trade-offs, and confirming technical decisions with live spoken audio feedback.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                        <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                          2. Scribe Mode (Quiet Companion)
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Muninn operates silently in the background without interrupting, continuously buffering 24kHz audio and extracting structured claims only when the capture concludes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Granular Memory & Session Deletion
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      You retain complete sovereign control over your memory graph. You can delete an entire conversation session directly from the session header with a single click, or remove individual claims and graph nodes from the expanded session view or Claim Inspector modal. Deletions cascade cleanly across relationships, task states, resurfacing events, and orphan entities.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      Exploring Ground-Truth Citations
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Whenever you query <strong>Memory Chat</strong> (e.g., &ldquo;Why did we choose SQLite over Postgres?&rdquo;), Muninn responds with direct citation pills. Clicking any citation pill opens the <strong>Claim Inspector</strong> modal, displaying the exact raw audio transcript turn, the speaker identity, and the exact timestamp in the session.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      The Privacy & Sensitivity Gate
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Muninn automatically screens extracted claims for sensitive content such as personal credentials, passwords, or confidential customer identifiers. Such items are held in the <strong>Sensitivity Gate</strong> and will never be indexed into the searchable knowledge graph until you click <em>Approve</em>.
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* Section 4: Elemental Architecture */}
            {activeSection === "architecture" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Constellation size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Elemental Architecture & Gateway Topology
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Interactive interactive diagram of the four elemental conduits
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  Muninn organizes data ingestion and retrieval into four elemental realms: <strong>Aether</strong> (Acoustic Ingestion), <strong>Ignis</strong> (Crystallization Engine), <strong>Terra</strong> (Relational Knowledge Graph), and <strong>Aura</strong> (Proactive Resurfacing & Chat). Click on any node below to inspect its protocol details.
                </p>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 p-2 sm:p-4">
                  <ElementalFlowGraph />
                </div>
              </article>
            )}

            {/* Section 5: Realtime AudioWorklet */}
            {activeSection === "audioworklet" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Radar size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Realtime AudioWorklet Specifications
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Low-latency Web Audio API pipeline with 24kHz downsampling
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    Standard browser `MediaRecorder` generates bloated WebM containers with unpredictable boundary chunks. Muninn executes custom <strong>AudioWorklet</strong> processors on a dedicated high-priority audio rendering thread:
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                    <div className="text-orange-400 font-semibold">// Audio Processing Specifications</div>
                    <div className="text-slate-300">Sample Rate: 24,000 Hz (Optimal for AssemblyAI streaming)</div>
                    <div className="text-slate-300">Bit Depth: 16-bit Linear PCM (Signed Int16 Little-Endian)</div>
                    <div className="text-slate-300">Channel Count: 1 (Monaural with software echo cancellation)</div>
                    <div className="text-slate-300">Chunk Size: 4,096 samples (approx 170ms buffer quantum)</div>
                  </div>

                  <p>
                    Audio is downsampled directly in the worklet thread to avoid dropping frames on the main UI thread during intense user interactions or canvas rendering.
                  </p>
                </div>
              </article>
            )}

            {/* Section 6: Memory Constellation */}
            {activeSection === "knowledge-graph" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Relational Memory Constellation
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      SQLite Recursive Common Table Expressions (CTEs) & Deep Void Galaxy
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    Unlike flat key-value vector stores that lose context, Muninn persists memory as a <strong>relational knowledge graph</strong>. Each claim is typed as a <em>Decision</em>, <em>Task</em>, <em>Question</em>, <em>State</em>, or <em>Hypothesis</em> and connected through typed edges (<code>depends_on</code>, <code>contradicts</code>, <code>unblocks</code>, <code>clarifies</code>).
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs">
                    <div className="text-orange-400 mb-2 font-semibold">-- Recursive Dependency Traversal (SQLite CTE)</div>
                    <pre className="text-slate-300 overflow-x-auto">
{`WITH RECURSIVE claim_hierarchy AS (
  SELECT id, content, claim_type, 0 AS depth
  FROM claims WHERE id = ?
  UNION ALL
  SELECT c.id, c.content, c.claim_type, ch.depth + 1
  FROM claims c
  JOIN claim_relations r ON c.id = r.target_claim_id
  JOIN claim_hierarchy ch ON r.source_claim_id = ch.id
  WHERE ch.depth < 5
)
SELECT * FROM claim_hierarchy ORDER BY depth;`}
                    </pre>
                  </div>
                </div>
              </article>
            )}

            {/* Section 7: Proactive Resurfacing */}
            {activeSection === "resurfacing" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Search size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Proactive Resurfacing Engine
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Autonomous radar detecting conflicting decisions and unblocked tasks
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    Most memory systems only answer when prompted. Muninn includes an autonomous <strong>Resurfacing Radar</strong> that continuously computes topological diffs across your memory graph:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                      <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                        Contradiction Detection
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Flags when a newly crystallized decision contradicts an established prior architectural decision without explicit invalidation.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                        Unblocked Task Activations
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Automatically alerts engineers when a blocker has been marked resolved in dialogue, activating pending downstream tasks.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Section 8: Dual Storage Isolation */}
            {activeSection === "storage-privacy" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Shield size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Dual Storage & Privacy Architecture
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Ephemeral Web Guest Sandbox vs Hardware Local-First Android APK
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                  <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                        Web Browser Mode
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                        EPHEMERAL GUEST
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-xs list-disc pl-4">
                      <li>Guest sessions run strictly in <code>sessionStorage</code> and volatile memory.</li>
                      <li>Zero data is written to server databases unless you explicitly authenticate.</li>
                      <li>Closing the browser tab purges memory completely.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Android Mobile & Tablet APK
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        LOCAL HARDWARE
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-xs list-disc pl-4">
                      <li>Data is persisted locally on device flash storage via native SharedPreferences.</li>
                      <li>Operates with full zero-network offline functionality.</li>
                      <li>Cloud synchronization is strictly optional and user-controlled.</li>
                    </ul>
                  </div>
                </div>
              </article>
            )}

            {/* Section 9: Developer Demo Walkthrough */}
            {activeSection === "developer-demo" && (
              <article className="glass-window rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <MythicIcon.Book size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Developer Demo & API Reference
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Step-by-step reproduction guide and open source repository
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orange-400 font-semibold">
                      Open Source Repository & Issues
                    </span>
                    <a
                      href="https://github.com/Erebuzzz/Muninn"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                    >
                      <span>github.com/Erebuzzz/Muninn</span>
                      <MythicIcon.External size={12} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Clone the codebase, run migrations, and launch local daemons with a single command.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                    Core REST API Contracts:
                  </h3>

                  {[
                    {
                      method: "POST",
                      path: "/api/chat",
                      desc: "Query the ground-truth living oracle with conversational context and return exact citation badges.",
                      payload: '{\n  "query": "What was the final decision regarding database indexing?",\n  "history": []\n}',
                    },
                    {
                      method: "POST",
                      path: "/api/sessions/demo",
                      desc: "Seeds a complete realistic engineering dialog with 12 crystallized claims, task dependencies, and citations.",
                      payload: "{}",
                    },
                    {
                      method: "GET",
                      path: "/api/claims",
                      desc: "Lists all crystallized claims across decisions, tasks, questions, and hypotheses with verification scores.",
                      payload: "",
                    },
                  ].map((endpoint) => (
                    <div
                      key={endpoint.path}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                            {endpoint.method}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {endpoint.path}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                          className="text-[10px] text-slate-500 hover:text-orange-500 transition"
                        >
                          {copiedEndpoint === endpoint.path ? "Copied!" : "Copy Path"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                        {endpoint.desc}
                      </p>
                      {endpoint.payload && (
                        <pre className="p-3 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-300 text-[11px] overflow-x-auto border border-slate-800">
                          {endpoint.payload}
                        </pre>
                      )}
                    </div>
                  ))}
            </div>
          </article>
        )}
      </div>
    </div>
  </div>
  );
}
