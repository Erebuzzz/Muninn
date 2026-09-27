"use client";

import React from "react";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#0e1219] border border-[#1e2634] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="docs-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1c2330] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h2 id="docs-title" className="text-base font-bold text-white tracking-tight">
                Muninn Documentation
              </h2>
              <p className="text-xs text-[#8b9bb4]">
                Living memory companion for your engineering conversations and decisions
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#8b9bb4] leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              1. What is Muninn?
            </h3>
            <p>
              Muninn is an intelligent living memory workspace. It captures conversations you choose, connects decisions, tasks, and problems inside them, and proactively alerts you when previous commitments or dependencies remain unresolved.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              2. Capture Workflows
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#141a24] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1">Live Capture Session</span>
                <p className="text-[11px]">
                  Real-time conversational capture with high-fidelity 24 kHz audio streaming and instant speaker turn-taking.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#141a24] border border-[#1e2634]">
                <span className="font-semibold text-white block mb-1">1-Tap Voice Memo</span>
                <p className="text-[11px]">
                  Sub-second quick voice notes for rapid thought capture without opening a full multi-turn session.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              3. Verifiable Provenance & Ground-Truth
            </h3>
            <p>
              Every decision, task, and hypothesis indexed in your knowledge graph is pinned to its exact timestamp and speaker turn. When asking questions in Memory Chat, every response provides verifiable citation links pointing directly back to the original source.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              4. Storage Autonomy
            </h3>
            <p>
              On web browsers, guest sessions are ephemeral and kept in temporary memory. On mobile and tablet APKs, capturing is saved directly to your local hardware storage. Cloud synchronization is opt-in and activates only when you choose to create an account.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-[#141a24] border border-[#1e2634] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-white">Open Source Codebase</h4>
              <p className="text-[11px] text-[#8b9bb4] mt-0.5">
                Explore the repository, report issues, and inspect source architecture.
              </p>
            </div>
            <a
              href="https://github.com/Erebuzzz/Muninn"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#1f2937] hover:bg-[#283548] text-xs font-medium text-white transition shrink-0 flex items-center gap-1.5 border border-[#2a374c]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span>GitHub Repository</span>
            </a>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c2330] flex items-center justify-between text-xs text-[#5a6a84]">
          <span className="font-mono text-[11px]">Muninn Living Memory System</span>
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
