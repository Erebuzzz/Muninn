"use client";

import React, { useState } from "react";
import { elasticRecoil } from "@/lib/animations";

interface FlowNode {
  id: string;
  name: string;
  element: string;
  subtitle: string;
  protocol: string;
  color: string;
  bg: string;
  border: string;
  x: number;
  y: number;
  details: string;
}

const FLOW_NODES: FlowNode[] = [
  {
    id: "acoustic",
    name: "Acoustic Stream",
    element: "AIR / AETHER",
    subtitle: "Real-time Microphone",
    protocol: "24 kHz Linear PCM AudioWorklet",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.12)",
    border: "rgba(249, 115, 22, 0.4)",
    x: 80,
    y: 130,
    details: "Zero-latency audio capture via AudioWorklet with browser background protection and local memory ring buffer.",
  },
  {
    id: "diarization",
    name: "Voice Gateway",
    element: "VOX CIPHER",
    subtitle: "Turn Diarization",
    protocol: "AssemblyAI Streaming STT",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.4)",
    x: 230,
    y: 60,
    details: "Sub-second speech-to-text with multi-speaker turn segmentation and ground-truth milliseconds start/end timestamps.",
  },
  {
    id: "dissection",
    name: "Edge Reasoning",
    element: "SOLAR FORGE",
    subtitle: "Semantic Dissection",
    protocol: "Hono Cloudflare Worker",
    color: "#ea580c",
    bg: "rgba(234, 88, 12, 0.12)",
    border: "rgba(234, 88, 12, 0.4)",
    x: 390,
    y: 130,
    details: "Isolates decisions, unblocked tasks, hypotheses, and questions. Enforces strict sensitivity gates.",
  },
  {
    id: "vault",
    name: "Memory Vault",
    element: "EARTH / OBSIDIAN",
    subtitle: "Relational Index",
    protocol: "Neon PostgreSQL + pgvector",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.4)",
    x: 540,
    y: 60,
    details: "Stores immutable claims, dependency links, and embedding vectors with zero cold-start HTTP driver.",
  },
  {
    id: "oracle",
    name: "Living Radar",
    element: "LIGHT / ODIN EYE",
    subtitle: "Proactive Surfacing",
    protocol: "Living Graph & Citations",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.4)",
    x: 690,
    y: 130,
    details: "Proactively resurfaces stale blockers and unblocked commitments with turn-by-turn provenance citation proofs.",
  },
];

export const ElementalFlowGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<FlowNode>(FLOW_NODES[0]);

  return (
    <div className="space-y-4">
      {/* SVG Living Topology Canvas */}
      <div className="relative w-full h-[260px] rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden select-none p-2 shadow-inner">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(249, 115, 22, 0.4) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 780 230">
          <defs>
            <linearGradient id="flow-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Connected Curved Energy Conduits */}
          {[0, 1, 2, 3].map((idx) => {
            const start = FLOW_NODES[idx];
            const end = FLOW_NODES[idx + 1];
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2 + (idx % 2 === 0 ? -25 : 25);
            const pathData = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

            return (
              <g key={`conduit-${idx}`}>
                {/* Static Path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="url(#flow-line-grad)"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  strokeDasharray="4 3"
                />
                {/* Active Light Energy Pulse Packet */}
                <circle r="3" fill="#f97316">
                  <animateMotion
                    path={pathData}
                    dur={`${2.8 + idx * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Elemental Gateway Nodes */}
          {FLOW_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Outer Selection Halo */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="32"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="animate-spin origin-center"
                    style={{
                      transformOrigin: `${node.x}px ${node.y}px`,
                      animationDuration: "12s",
                    }}
                  />
                )}

                {/* Node Outer Disc */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill="#090d16"
                  stroke={node.color}
                  strokeWidth={isSelected ? "2.2" : "1.2"}
                  strokeOpacity={isSelected ? "1" : "0.7"}
                />

                {/* Inner Core */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill={node.color}
                  fillOpacity={isSelected ? "0.3" : "0.15"}
                />

                {/* Gateway Label */}
                <text
                  x={node.x}
                  y={node.y + 40}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {node.name}
                </text>
                <text
                  x={node.x}
                  y={node.y + 52}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {node.element}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Gateway Detailed Telemetry Card */}
      <div
        className="p-4 rounded-xl border transition-all duration-300 shadow-md"
        style={{
          backgroundColor: selectedNode.bg,
          borderColor: selectedNode.border,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedNode.color }}
            />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {selectedNode.name} • {selectedNode.element}
            </span>
          </div>
          <span
            className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-slate-950/80 border"
            style={{
              color: selectedNode.color,
              borderColor: selectedNode.border,
            }}
          >
            {selectedNode.protocol}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {selectedNode.details}
        </p>
      </div>
    </div>
  );
};
