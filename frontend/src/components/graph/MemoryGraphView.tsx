"use client";

import React, { useState, useEffect, useRef } from "react";
import { GraphData, GraphNode, GraphEdge } from "@/lib/types";
import { api } from "@/lib/api";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { elasticRecoil } from "@/lib/animations";

interface MemoryGraphViewProps {
  onSelectClaim?: (claimId: string) => void;
  refreshTrigger?: number;
}

interface CanvasNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const MemoryGraphView: React.FC<MemoryGraphViewProps> = ({
  onSelectClaim,
  refreshTrigger,
}) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"spatial" | "grid">("spatial");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Calculate coordinates for spatial nodes in a concentric celestial constellation layout
  const spatialNodes: CanvasNode[] = React.useMemo(() => {
    const width = 800;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    const allDisplayNodes = [...entityNodes, ...filteredClaims];
    const total = allDisplayNodes.length;
    if (total === 0) return [];

    return allDisplayNodes.map((node, i) => {
      const isEntity = node.type === "entity";
      // Concentric rings: Entities in inner ring (radius 130), Claims in outer ring (radius 220)
      const ringRadius = isEntity ? 120 + (i % 2) * 20 : 210 + (i % 3) * 25;
      const angle = (i * 2 * Math.PI) / total + (isEntity ? 0 : 0.4);

      return {
        ...node,
        x: centerX + ringRadius * Math.cos(angle),
        y: centerY + ringRadius * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: isEntity ? 18 : 22,
      };
    });
  }, [entityNodes, filteredClaims]);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === "entity") {
      return {
        border: "border-sky-500/50",
        bg: "bg-sky-950/40",
        text: "text-sky-300",
        stroke: "#38bdf8",
      };
    }
    switch (node.claim_type) {
      case "decision":
        return {
          border: "border-emerald-500/50",
          bg: "bg-emerald-950/40",
          text: "text-emerald-300",
          stroke: "#10b981",
        };
      case "task":
        return {
          border: "border-orange-500/50",
          bg: "bg-orange-950/40",
          text: "text-orange-300",
          stroke: "#f97316",
        };
      case "question":
        return {
          border: "border-amber-500/50",
          bg: "bg-amber-950/40",
          text: "text-amber-300",
          stroke: "#fbbf24",
        };
      case "hypothesis":
        return {
          border: "border-purple-500/50",
          bg: "bg-purple-950/40",
          text: "text-purple-300",
          stroke: "#a855f7",
        };
      case "observation":
      default:
        return {
          border: "border-cyan-500/50",
          bg: "bg-cyan-950/40",
          text: "text-cyan-300",
          stroke: "#06b6d4",
        };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.6, Math.min(2.0, prev + delta)));
  };

  const resetViewport = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="glass-window rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative Sun Orange Caustic Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* Header with Telemetry & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800/60 gap-3">
        <div className="flex items-center gap-3">
          <RavenLogo size={28} animated={false} glow={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-widest">
                Relational Memory Constellation
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-sky-400">
                {graphData.nodes.length} NODES • {graphData.edges.length} CONDUITS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Topological knowledge graph extracted with ground-truth temporal links
            </p>
          </div>
        </div>

        {/* View Mode Toggle and Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Spatial vs Grid Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode("spatial")}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                viewMode === "spatial"
                  ? "bg-orange-500 text-slate-950 font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Spatial Constellation
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                viewMode === "grid"
                  ? "bg-orange-500 text-slate-950 font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Taxonomy Grid
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {["all", "decision", "task", "question"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`text-[10px] font-mono uppercase px-2 py-1 rounded transition border ${
                  selectedFilter === type
                    ? "bg-slate-800 text-orange-400 border-orange-500/60 font-semibold"
                    : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Synthesizing topological runic coordinates...
        </div>
      ) : graphData.nodes.length === 0 ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500 italic">
          No structured claims recorded yet. Capture speech or import a transcript to build the living memory graph.
        </div>
      ) : viewMode === "spatial" ? (
        /* SPATIAL LIVING CANVAS */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative w-full h-[460px] my-3 rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Spatial Canvas Controls Overlay */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => handleZoom(0.15)}
              className="w-7 h-7 flex items-center justify-center text-xs font-mono text-slate-300 hover:text-orange-400 hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="w-7 h-7 flex items-center justify-center text-xs font-mono text-slate-300 hover:text-orange-400 hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={resetViewport}
              className="px-2 h-7 flex items-center justify-center text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
              title="Reset Viewport"
            >
              1:1
            </button>
          </div>

          {/* Runic Grid Watermark */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.25) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Interactive Scaled & Panned Constellation Canvas */}
          <div
            className="w-[800px] h-[480px] absolute inset-0 mx-auto my-auto origin-center transition-transform duration-75"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            }}
          >
            {/* SVG Link Conduits & Core Radial Energy */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                <linearGradient id="conduit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Central Muninn Orbit Rings */}
              <circle
                cx="400"
                cy="240"
                r="120"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeDasharray="5 5"
                strokeOpacity="0.25"
              />
              <circle
                cx="400"
                cy="240"
                r="210"
                fill="none"
                stroke="#f97316"
                strokeWidth="0.8"
                strokeDasharray="6 4"
                strokeOpacity="0.25"
              />

              {/* Edge Connections between Nodes */}
              {graphData.edges.map((edge, idx) => {
                const sourceNode = spatialNodes.find((n) => n.id === edge.from);
                const targetNode = spatialNodes.find((n) => n.id === edge.to);
                if (!sourceNode || !targetNode) return null;

                // Midpoint control for quadratic curve
                const midX = (sourceNode.x + targetNode.x) / 2 + (idx % 2 === 0 ? 20 : -20);
                const midY = (sourceNode.y + targetNode.y) / 2 + (idx % 2 === 0 ? -20 : 20);

                return (
                  <g key={`${edge.from}-${edge.to}-${idx}`}>
                    <path
                      d={`M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY} ${targetNode.x} ${targetNode.y}`}
                      fill="none"
                      stroke="url(#conduit-grad)"
                      strokeWidth="1.2"
                      strokeOpacity="0.45"
                    />
                    {/* Animated Energy Pulse along the conduit */}
                    <circle r="2.5" fill="#f97316">
                      <animateMotion
                        path={`M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY} ${targetNode.x} ${targetNode.y}`}
                        dur={`${3.5 + (idx % 3)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}

              {/* Radial rays from Central Core to Entities */}
              {spatialNodes
                .filter((n) => n.type === "entity")
                .map((ent, i) => (
                  <line
                    key={`ray-${ent.id}-${i}`}
                    x1="400"
                    y1="240"
                    x2={ent.x}
                    y2={ent.y}
                    stroke="#38bdf8"
                    strokeWidth="0.75"
                    strokeOpacity="0.25"
                  />
                ))}
            </svg>

            {/* Central Odin Raven Core Hub */}
            <div
              className="absolute left-[400px] top-[240px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
              onClick={() => resetViewport()}
            >
              <RavenLogo size={46} animated={true} glow={true} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-orange-400 mt-1 font-semibold bg-slate-950/80 px-1.5 py-0.5 rounded border border-orange-500/30">
                MUNINN CORE
              </span>
            </div>

            {/* Render Nodes as Tactical Shards */}
            {spatialNodes.map((node) => {
              const colors = getNodeColor(node);
              const isClaim = node.type === "claim";
              const isEntity = node.type === "entity";

              return (
                <div
                  key={node.id}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    elasticRecoil(e.currentTarget);
                    if (isClaim && onSelectClaim) {
                      onSelectClaim(node.id.replace("claim_", ""));
                    }
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer p-2 rounded-xl border backdrop-blur-md transition-all duration-200 hover:scale-110 hover:z-30 shadow-lg ${
                    colors.border
                  } ${colors.bg} ${
                    hoveredNode?.id === node.id ? "ring-2 ring-orange-400 scale-110" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors.stroke }}
                    />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-200 max-w-[120px] truncate">
                      {node.label}
                    </span>
                  </div>
                  {isClaim && node.claim_type && (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className={`text-[8.5px] font-mono uppercase ${colors.text}`}>
                        {node.claim_type}
                      </span>
                      {node.status && (
                        <span className="text-[8px] font-mono px-1 rounded bg-slate-900 text-slate-400">
                          {node.status}
                        </span>
                      )}
                    </div>
                  )}
                  {isEntity && (
                    <span className="text-[8.5px] font-mono text-sky-400 block mt-0.5">
                      {node.entity_type}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Tooltip Inspector on Hover */}
          {hoveredNode && (
            <div className="absolute bottom-3 left-3 z-20 max-w-sm p-3 rounded-xl bg-slate-900/95 border border-orange-500/40 backdrop-blur-md shadow-2xl text-xs animate-in fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] uppercase text-orange-400 font-bold">
                  {hoveredNode.type === "claim" ? hoveredNode.claim_type : hoveredNode.entity_type}
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  ID: {hoveredNode.id}
                </span>
              </div>
              <p className="text-slate-100 font-medium leading-relaxed">
                {hoveredNode.full_text || hoveredNode.label}
              </p>
              {hoveredNode.type === "claim" && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Click to inspect citations & timeline</span>
                  <span className="text-orange-400 font-semibold">INSPECT →</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STRUCTURED TAXONOMY GRID VIEW */
        <div className="space-y-4 my-3">
          {/* Entities Row */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Recognized Entities</span>
              <span className="text-sky-400">({entityNodes.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {entityNodes.map((ent) => (
                <span
                  key={ent.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-sky-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  {ent.label}
                  <span className="text-[10px] text-slate-500">({ent.entity_type})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Claims Grid */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Claims & Decisions</span>
              <span className="text-orange-400">({filteredClaims.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredClaims.map((claim) => {
                const claimId = claim.id.replace("claim_", "");
                const colors = getNodeColor(claim);
                return (
                  <div
                    key={claim.id}
                    onClick={() => onSelectClaim && onSelectClaim(claimId)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer hover:scale-[1.01] transition shadow-sm ${colors.border} ${colors.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-200">
                        {claim.claim_type}
                      </span>
                      {claim.status && (
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                            claim.status === "blocked"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {claim.status}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-100 font-medium leading-relaxed">
                      {claim.full_text || claim.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
