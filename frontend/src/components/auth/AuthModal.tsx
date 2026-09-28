"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, loginDemo } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        setEmail("");
        setPassword("");
      } else if (mode === "register") {
        await register(email, password, name);
        setEmail("");
        setPassword("");
        setName("");
      } else if (mode === "forgot") {
        const res = await api.forgotPassword(email);
        if (res.recovery_token) {
          setRecoveryToken(res.recovery_token);
        }
        if (res.code) {
          setResetCode(res.code);
        } else {
          setResetCode("");
        }
        setSuccess(res.message || "A 6-digit verification code has been dispatched. Please check your inbox and enter it below.");
        setMode("reset");
      } else if (mode === "reset") {
        const res = await api.resetPassword({
          email,
          code: resetCode,
          new_password: password,
          recovery_token: recoveryToken || undefined,
        });
        setSuccess(res.message || "Password updated successfully. Please sign in.");
        setPassword("");
        setResetCode("");
        setRecoveryToken(null);
        setMode("login");
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed. Please verify your credentials.";
      const cleanMsg = msg.replace(/^API error \d+:\s*/, "");
      try {
        const parsed = JSON.parse(cleanMsg);
        setError(parsed.error || parsed.message || cleanMsg);
      } catch {
        setError(cleanMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setSuccess(null);
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
              {mode === "login"
                ? "Sign in to Muninn"
                : mode === "register"
                ? "Create Muninn Account"
                : mode === "forgot"
                ? "Reset Your Password"
                : "Enter New Credentials"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "forgot" || mode === "reset"
                ? "Recover your sovereign memory vault"
                : "Living memory retained securely across devices"}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        {mode !== "forgot" && mode !== "reset" && (
          <div className="flex rounded-full bg-slate-900 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
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
                setSuccess(null);
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
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
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
                placeholder="e.g. Alex Henderson"
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
              placeholder="engineer@company.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
            />
          </div>

          {mode === "reset" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.trim())}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono tracking-widest text-center text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Check your email inbox (and spam folder) for the 6-digit verification code.
              </p>
            </div>
          )}

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-400">
                  {mode === "reset" ? "New Password or PIN (min 6 chars)" : "Password or PIN (min 6 chars)"}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-mono text-orange-400 hover:text-orange-300 transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
                />
                <button
                  type="button"
                  onMouseEnter={() => setShowPassword(true)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  tabIndex={-1}
                  aria-label="Hover or press to view password"
                  title="Hover or press-and-hold to view password"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-400 transition cursor-pointer select-none"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : mode === "register" ? (
              "Create Account"
            ) : mode === "forgot" ? (
              "Send Verification Code"
            ) : (
              "Save New Password"
            )}
          </button>

          {(mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center text-xs font-mono text-slate-400 hover:text-white transition pt-2"
            >
              ← Back to Sign In
            </button>
          )}
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-slate-950 px-2 text-slate-500 font-mono">Or explore</span>
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
