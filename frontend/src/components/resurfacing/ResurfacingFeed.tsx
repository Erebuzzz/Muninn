"use client";

import React, { useEffect, useState } from "react";
import { ResurfacingItem } from "@/lib/types";
import { api } from "@/lib/api";
import { ResurfacingCard } from "./ResurfacingCard";

interface ResurfacingFeedProps {
  onInspectClaim?: (claimId: string) => void;
  refreshTrigger?: number;
}

export const ResurfacingFeed: React.FC<ResurfacingFeedProps> = ({
  onInspectClaim,
  refreshTrigger,
}) => {
  const [items, setItems] = useState<ResurfacingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.getResurfacing();
      setItems(data);
    } catch (e) {
      console.error("Error fetching resurfacing items:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissResurfacing(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Failed to dismiss resurfacing item:", e);
    }
  };

  return (
    <div className="glass-window p-5 relative overflow-hidden">
      {/* Decorative Norse Runes Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-widest">
              Proactive Resurfacing Radar
            </h2>
            {items.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                {items.length} ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic radar alerts when related blockers or commitments reappear
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="text-xs text-slate-400 hover:text-orange-300 transition p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
          title="Refresh Radar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          Scanning temporal constellation for blockers...
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 italic">
          No open blockers or conflicting decisions pending right now. All commitments aligned.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ResurfacingCard
              key={item.id}
              item={item}
              onDismiss={handleDismiss}
              onInspectClaim={onInspectClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};
