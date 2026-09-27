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
    <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#1c2330] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              You Left This Behind
            </h2>
            {items.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {items.length}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8b9bb4]">
            Proactive resurfacing when related entities return to discussion
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="text-xs text-[#64748b] hover:text-[#94a3b8] transition p-1"
          title="Refresh Feed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[#64748b]">
          Checking stored memory graph...
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#64748b] italic">
          No open blockers or conflicting decisions pending right now.
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
