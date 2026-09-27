"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, loginDemo } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: any) {
      const msg = err?.message || "Authentication failed. Please verify your credentials.";
      // Clean up server error prefix if present
      const cleanMsg = msg.replace(/^API error \d+:\s*/, "");
      try {
        const parsed = JSON.parse(cleanMsg);
        setError(parsed.error || cleanMsg);
      } catch {
        setError(cleanMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err?.message || "Demo sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-window rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closeAuthModal}
          disabled={submitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {mode === "login" ? "Sign in to Muninn" : "Create Muninn Account"}
            </h2>
            <p className="text-xs text-slate-400">
              Living memory retained securely across devices
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-full bg-slate-900 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition ${
              mode === "login"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition ${
              mode === "register"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kshitiz23kumar@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Password or PIN (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-slate-950 px-2 text-slate-500 font-mono">Or quick inspect</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoClick}
          disabled={submitting}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition flex items-center justify-center gap-2"
        >
          <span>Curated Sample Vault (3 sessions)</span>
        </button>
      </div>
    </div>
  );
}
