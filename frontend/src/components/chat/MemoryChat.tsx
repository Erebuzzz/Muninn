"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { ChatResponse, CitationItem } from "@/lib/types";
import { elasticRecoil } from "@/lib/animations";

interface MemoryChatProps {
  onInspectCitation?: (claimId: string) => void;
}

export const MemoryChat: React.FC<MemoryChatProps> = ({ onInspectCitation }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; citations?: CitationItem[] }[]
  >([
    {
      role: "assistant",
      text: "I am Muninn, raven of memory and thought. Inquire regarding any historical decision, blocked task, or architectural precedent across your recorded sessions.",
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const resp: ChatResponse = await api.queryChat(userText);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: resp.answer,
          citations: resp.citations,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Encountered an issue querying memory vault. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-window p-5 flex flex-col h-[480px] relative overflow-hidden">
      {/* Decorative Norse Runes Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* Header */}
      <div className="border-b border-slate-800/60 pb-3 mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-widest">
              Ground-Truth Oracle
            </h2>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-orange-400">
              CITATIONS VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query past discussions with turn-by-turn timestamp provenance
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
          Reasoning Active
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-xl p-3.5 leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-orange-500 text-slate-950 font-medium"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200"
              }`}
            >
              {m.text}

              {/* Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="font-mono text-[9px] text-orange-400 uppercase tracking-wider font-semibold">
                    Temporal Citations ({m.citations.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {m.citations.map((c) => (
                      <button
                        key={c.claim_id}
                        onClick={(e) => {
                          elasticRecoil(e.currentTarget);
                          if (onInspectCitation) onInspectCitation(c.claim_id);
                        }}
                        className="text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/40 transition flex items-center justify-between group"
                      >
                        <span className="text-[11px] text-slate-300 truncate max-w-[260px]">
                          &ldquo;{c.claim_text}&rdquo;
                        </span>
                        <span className="font-mono text-[9px] text-orange-400/80 group-hover:text-orange-300 shrink-0 ml-2">
                          [Inspect] →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
            Traversing relational memory graph...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-slate-800/60 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask: Why did we pause enclosure fabrication? What is Alex working on?"
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-sans"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          onClick={(e) => elasticRecoil(e.currentTarget)}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold font-mono text-xs transition shadow disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
};
