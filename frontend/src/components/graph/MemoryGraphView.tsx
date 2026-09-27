"use client";

import React, { useState, useEffect } from "react";
import { GraphData, GraphNode } from "@/lib/types";
import { api } from "@/lib/api";

interface MemoryGraphViewProps {
  onSelectClaim?: (claimId: string) => void;
  refreshTrigger?: number;
}

export const MemoryGraphView: React.FC<MemoryGraphViewProps> = ({
  onSelectClaim,
  refreshTrigger,
}) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const data = await api.getGraph();
      setGraphData(data);
    } catch (e) {
      console.error("Failed to fetch graph:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [refreshTrigger]);

  const claimNodes = graphData.nodes.filter((n) => n.type === "claim");
  const entityNodes = graphData.nodes.filter((n) => n.type === "entity");

  const filteredClaims = claimNodes.filter((n) => {
    if (selectedFilter === "all") return true;
    return n.claim_type === selectedFilter;
  });

  const getNodeColor = (node: GraphNode) => {
    if (node.type === "entity") {
      return "border-blue-500/40 bg-blue-950/20 text-blue-300";
    }
    switch (node.claim_type) {
      case "decision":
        return "border-emerald-500/40 bg-emerald-950/20 text-emerald-300";
      case "task":
        return "border-amber-500/40 bg-amber-950/20 text-amber-300";
      case "question":
        return "border-orange-500/40 bg-orange-950/20 text-orange-300";
      case "hypothesis":
        return "border-purple-500/40 bg-purple-950/20 text-purple-300";
      case "observation":
      default:
        return "border-cyan-500/40 bg-cyan-950/20 text-cyan-300";
    }
  };

  return (
    <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c2330] gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Relational Memory Graph
          </h2>
          <p className="text-xs text-[#8b9bb4]">
            Structured state extracted from conversation: {graphData.nodes.length} nodes, {graphData.edges.length} relationships
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "decision", "task", "question", "observation", "hypothesis"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded transition ${
                selectedFilter === type
                  ? "bg-amber-500 text-black font-semibold"
                  : "bg-[#161b24] text-[#8b9bb4] hover:text-white border border-[#222c3e]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#64748b]">
          Rendering memory nodes...
        </div>
      ) : graphData.nodes.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#64748b] italic">
          No structured claims recorded yet. Start a session or import a transcript to build the graph.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Entities Row */}
          <div>
            <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider mb-2">
              Recognized Entities ({entityNodes.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {entityNodes.map((ent) => (
                <span
                  key={ent.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#141d2b] border border-[#233550] text-[#93c5fd] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {ent.label}
                  <span className="text-[10px] text-[#4b5563]">({ent.entity_type})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Claims Grid */}
          <div>
            <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider mb-2">
              Claims & Decisions ({filteredClaims.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredClaims.map((claim) => {
                const claimId = claim.id.replace("claim_", "");
                return (
                  <div
                    key={claim.id}
                    onClick={() => onSelectClaim && onSelectClaim(claimId)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer hover:scale-[1.01] transition shadow-sm ${getNodeColor(
                      claim
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                        {claim.claim_type}
                      </span>
                      {claim.status && (
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                          claim.status === "blocked"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {claim.status}
                        </span>
                      )}
                    </div>
                    <div className="text-white font-medium leading-relaxed">
                      {claim.full_text || claim.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relationships Explorer */}
          {graphData.edges.length > 0 && (
            <div className="pt-2 border-t border-[#1c2330]">
              <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider mb-2">
                Active Graph Edges ({graphData.edges.length})
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {graphData.edges.map((e) => (
                  <div
                    key={e.id}
                    className="p-1.5 rounded bg-[#0c0f15] border border-[#1a212d] text-[11px] flex items-center justify-between font-mono"
                  >
                    <span className="text-[#94a3b8] truncate max-w-[200px]">{e.from}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                      {e.label}
                    </span>
                    <span className="text-[#94a3b8] truncate max-w-[200px]">{e.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
