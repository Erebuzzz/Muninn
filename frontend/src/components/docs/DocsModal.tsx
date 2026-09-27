"use client";

import React, { useState } from "react";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { runeCipherDecode, elasticRecoil } from "@/lib/animations";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "walkthrough" | "architecture" | "developer">("walkthrough");
  const [simStep, setSimStep] = useState<number>(1);
  const [simText, setSimText] = useState<string>("Click 'Run Step' to start speech decoding...");

  if (!isOpen) return null;

  const handleRunSimStep = (step: number) => {
    setSimStep(step);
    const demoElement = document.getElementById("sim-decoder-box");
    if (step === 1) {
      const phrase = "Speaker A: 'We decided to switch our backend from Express to TypeScript with Hono.'";
      setSimText(phrase);
      if (demoElement) runeCipherDecode(demoElement, phrase, 700);
    } else if (step === 2) {
      const phrase = "Crystallized Claim: [DECISION #892] Migrated backend runtime to Hono for cloudflare-ready edge performance.";
      setSimText(phrase);
      if (demoElement) runeCipherDecode(demoElement, phrase, 800);
    } else if (step === 3) {
      const phrase = "Proactive Alert: 'Attention: 2 unblocked deployment tasks depend on this Hono migration.'";
      setSimText(phrase);
      if (demoElement) runeCipherDecode(demoElement, phrase, 750);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="docs-title"
      >
        {/* Top Horizon Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RavenLogo size={36} animated={true} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="docs-title" className="text-base font-bold text-white tracking-tight">
                  Muninn Codex & Interactive Walkthrough
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                  v2.0 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Living memory companion: acoustic capture, ground-truth citations, proactive resurfacing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800/80 bg-slate-900/60 px-5 gap-1 overflow-x-auto">
          {[
            { id: "walkthrough", label: "Interactive Simulation" },
            { id: "guide", label: "User Guide" },
            { id: "architecture", label: "System Flow" },
            { id: "developer", label: "Developer Specs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-mono transition border-b-2 font-medium shrink-0 ${
                activeTab === tab.id
                  ? "border-amber-400 text-amber-300 bg-slate-900/80"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed flex-1">
          {activeTab === "walkthrough" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block mb-1">
                  Guided Walkthrough Simulation
                </span>
                <p className="text-slate-300 text-xs">
                  Experience how Muninn listens to technical dialogue, isolates immutable claims, and surfaces relevant blockers in real time.
                </p>

                {/* 3 Step Controls */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { step: 1, title: "1. Acoustic Capture", desc: "Speaker turn decoded" },
                    { step: 2, title: "2. Crystallization", desc: "Ground-truth decision" },
                    { step: 3, title: "3. Resurfacing", desc: "Proactive radar fires" },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => handleRunSimStep(s.step)}
                      className={`p-2.5 rounded-lg border text-left transition font-mono ${
                        simStep === s.step
                          ? "bg-slate-800 border-amber-500 text-amber-300 shadow"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-[11px] text-white">{s.title}</div>
                      <div className="text-[9px] text-slate-400">{s.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Simulated Runic Decoder Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 border-b border-slate-900 pb-1">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      SIMULATION TERMINAL (STEP {simStep} OF 3)
                    </span>
                    <span>ELDER FUTHARK CIPHER</span>
                  </div>
                  <div id="sim-decoder-box" className="text-slate-100 min-h-[48px] leading-relaxed">
                    {simText}
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleRunSimStep(simStep < 3 ? simStep + 1 : 1)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-semibold transition"
                  >
                    {simStep < 3 ? `Run Next Step (${simStep + 1} of 3) →` : "Restart Walkthrough ↺"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  1. How to Capture Memory
                </h3>
                <p>
                  You can capture discussions through two modes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-white block mb-1">Live Capture Session</span>
                    <p className="text-[11px] text-slate-400">
                      Continuous streaming with real-time speaker diarization and audio-reactive waveform feedback. Click End Session when done to extract state.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-white block mb-1">1-Tap Quick Memo</span>
                    <p className="text-[11px] text-slate-400">
                      Record a single thought or memo in seconds. Muninn will transcribe and index decisions without requiring a meeting setup.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  2. Ground-Truth Citations
                </h3>
                <p>
                  Every claim indexed by Muninn is bound to its exact timestamp and speaker turn. When asking questions in Memory Chat, click on any citation badge to view the raw transcript snippet and verification score.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  3. Privacy & Storage Isolation
                </h3>
                <p>
                  Muninn never retains data without your consent:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Web App:</strong> Runs in ephemeral guest mode. Data remains in session storage unless you choose to sign in.</li>
                  <li><strong>Android APK:</strong> Stores your memory vault locally on your device hardware with zero mandatory cloud dependency.</li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
                <div className="text-amber-400 font-semibold mb-2">MUNINN SYSTEM TOPOLOGY</div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-loose">
                  [AudioWorklet 24kHz / Quick Memo]<br />
                  &nbsp;&nbsp;↓ Real-time Audio Stream<br />
                  [AssemblyAI Voice Gateway / STT]<br />
                  &nbsp;&nbsp;↓ Structured Turns & Diarization<br />
                  [Hono API Backend + LLM Dissection]<br />
                  &nbsp;&nbsp;↓ Claims, Entities, Citations<br />
                  [Neon Postgres + Vector Embeddings]<br />
                  &nbsp;&nbsp;↓ Topological Graph Sync<br />
                  [Interactive Living Memory Canvas & Proactive Radar]
                </div>
              </div>
            </div>
          )}

          {activeTab === "developer" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-white">GitHub Open Source Repository</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    View full source code, architecture diagrams, and release changelogs.
                  </p>
                </div>
                <a
                  href="https://github.com/Erebuzzz/Muninn"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => elasticRecoil(e.currentTarget)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold font-mono transition shrink-0 flex items-center gap-2 shadow-lg"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span>github.com/Erebuzzz/Muninn</span>
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-mono text-slate-400 font-semibold uppercase text-[11px]">Key Technical Specifications:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 block">Frontend Stack</span>
                    <span className="text-slate-300">Next.js 15, Tailwind, Anime.js, Web Audio API</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 block">Backend Runtime</span>
                    <span className="text-slate-300">TypeScript + Hono (Lightweight Edge Ready)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 block">Mobile APK</span>
                    <span className="text-slate-300">Capacitor 8 Android Tablet, Hardware Local-First</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-purple-400 block">Voice Engine</span>
                    <span className="text-slate-300">AssemblyAI Realtime 24kHz AudioWorklet</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">Muninn: Memory & Mind</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
          >
            Close Codex
          </button>
        </div>
      </div>
    </div>
  );
}
