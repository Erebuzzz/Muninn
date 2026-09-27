"use client";

import React from "react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-window w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 id="privacy-title" className="text-base font-bold text-white tracking-tight">
                Muninn Privacy Promise & Policy
              </h2>
              <p className="text-xs text-slate-400">
                Living memory with verified consent, default-discard guardrails, and local device autonomy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-400 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              1. Opt-In Capture Only
            </h3>
            <p>
              Muninn operates strictly on an opt-in basis. The system never records audio or captures transcripts passively in the background without explicit, active consent. On mobile and tablet devices, an ongoing Android foreground notification displays prominently whenever capturing is active to ensure zero silent recording.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              2. Web Ephemeral Sandbox vs. Local Tablet Hardware Storage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-orange-400 block mb-1">Web Browser Mode (Guest)</span>
                <p className="text-[11px]">
                  Unauthenticated web sessions are completely ephemeral. Data lives only in your browser tab memory. When you close the tab, guest data is cleared. Signing in is only required if you choose to permanently retain your memory graph across sessions.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-semibold text-emerald-300 block mb-1">Android Tablet APK (Local-First)</span>
                <p className="text-[11px]">
                  Sign-in is completely optional on tablet hardware. All recorded sessions, claims, and knowledge graphs remain stored securely on device storage (Android SharedPreferences). If you decide to sign in, records can sync back to your cloud vault.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              3. Privacy Review Gate & Default-Discard Policy
            </h3>
            <p>
              All extracted statements pass through a sensitivity classification model. Off-the-record utterances, sensitive personal opinions, and confidential figures are automatically quarantined into the Privacy Review Gate. Under our Default-Discard rule, quarantined items are never committed to permanent memory unless you explicitly review and approve them.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              4. Ground-Truth Provenance
            </h3>
            <p>
              Every decision, task, and observation indexed by Muninn is bound to its exact source utterance and speaker turn. Muninn never synthesizes memory out of thin air; every assertion points back to an auditable transcript turn.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              5. AI Processing & Third-Party Integrity
            </h3>
            <p>
              Speech-to-text and structured LLM extraction route through AssemblyAI LLM Gateway and Sync STT over encrypted HTTPS/TLS. Audio buffers and transcripts are processed in memory and are never sold, rented, or used to train third-party public foundation models.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <h4 className="text-xs font-semibold text-white">Developer & Contact Information</h4>
            <p className="text-[11px]">
              Engineered by <strong className="text-white">Kshitiz Kumar</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-orange-400 pt-1">
              <a
                href="https://github.com/Erebuzzz"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                GitHub: github.com/Erebuzzz
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="mailto:kshitiz23kumar@gmail.com"
                className="hover:underline flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                Email: kshitiz23kumar@gmail.com
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Effective Date: September 2026 • Living Trust Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition border border-slate-800"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
