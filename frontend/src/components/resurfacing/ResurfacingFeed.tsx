"use client";

import React, { useEffect, useState } from "react";
import { ResurfacingItem } from "@/lib/types";
import { api } from "@/lib/api";
import { ResurfacingCard } from "./ResurfacingCard";

import { MythicIcon } from "@/components/common/MythicIcons";

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
    <div className="glass-window p-6 relative overflow-hidden rounded-2xl shadow-2xl">
      {/* Decorative Norse Runes Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MythicIcon.Radar size={18} className="text-orange-400" />
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
            Continuous radar scanning temporal constellation for unblocked dependencies, open questions, and conflicting decisions
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="text-xs text-slate-400 hover:text-orange-400 transition p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
          title="Refresh Radar"
        >
          <MythicIcon.Refresh size={14} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
