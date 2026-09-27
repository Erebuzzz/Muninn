"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { ChatResponse, CitationItem } from "@/lib/types";

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
      text: "I am Muninn. Ask me about any past decision, blocked task, or technical precedent across your recorded sessions.",
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
          text: "Encountered an issue querying memory graph. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-5 shadow-lg flex flex-col h-[460px]">
      {/* Header */}
      <div className="border-b border-[#1c2330] pb-3 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Living Memory Query
          </h2>
          <p className="text-xs text-[#8b9bb4]">
            Ground-truth retrieval with turn-by-turn provenance citations
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b24] text-amber-400 border border-[#222c3e]">
          LLM Gateway
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                m.role === "user"
                  ? "bg-amber-500 text-black font-medium"
                  : "bg-[#0c0f15] border border-[#1e2634] text-[#e2e8f0]"
              }`}
            >
              {m.text}

              {/* Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#1c2330] space-y-1.5">
                  <div className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                    Citations ({m.citations.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {m.citations.map((c) => (
                      <button
                        key={c.claim_id}
                        onClick={() => onInspectCitation && onInspectCitation(c.claim_id)}
                        className="text-left p-1.5 rounded bg-[#141923] hover:bg-[#1c2330] border border-[#222c3e] transition flex items-center justify-between group"
                      >
                        <span className="text-[11px] text-[#cbd5e1] truncate max-w-[280px]">
                          &ldquo;{c.claim_text}&rdquo;
                        </span>
                        <span className="font-mono text-[9px] text-[#64748b] group-hover:text-amber-300 ml-2">
                          [Inspect]
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
          <div className="flex items-center gap-2 text-xs text-[#64748b] italic">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Consulting knowledge graph...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-[#1c2330] flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask: Why did we pause enclosure fabrication? What is Alex working on?"
          className="flex-1 bg-[#0c0f15] border border-[#1e2634] rounded-lg px-3 py-2 text-xs text-white placeholder-[#4b5563] focus:outline-none focus:border-amber-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
};
