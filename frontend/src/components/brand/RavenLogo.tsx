"use client";

import React, { useEffect, useRef } from "react";
import { animate, createDrawable } from "animejs";

interface RavenLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
  glow?: boolean;
}

export const RavenLogo: React.FC<RavenLogoProps> = ({
  size = 40,
  animated = true,
  className = "",
  glow = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!animated || !svgRef.current) return;

    try {
      const paths = svgRef.current.querySelectorAll("path, polygon, circle");
      if (paths.length > 0) {
        const drawables = createDrawable(Array.from(paths) as any);
        animate(drawables, {
          draw: ["0 0", "0 1"],
          duration: 1600,
          ease: "inOutExpo",
          delay: (_, i) => (i ?? 0) * 50,
        });
      }

      const eyes = svgRef.current.querySelectorAll(".raven-eye");
      if (eyes.length > 0) {
        animate(eyes, {
          opacity: [0.35, 1],
          scale: [0.85, 1.2],
          duration: 1800,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        });
      }
    } catch {
      // Fallback
    }
  }, [animated]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-orange-500/20 blur-md pointer-events-none"
          style={{ transform: "scale(0.85)" }}
        />
      )}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        {/* Outer Sacred Geometry Ring - Sun Orange Accents */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#f97316"
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeDasharray="4 3"
        />

        {/* Inner Octagonal Runic Frame */}
        <polygon
          points="50,12 85,26 95,50 85,74 50,88 15,74 5,50 15,26"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />

        {/* Left Raven Wing - Faceted Geometric Feathers */}
        <path
          d="M 50,22 L 32,28 L 18,38 L 10,50 L 18,54 L 28,48 L 22,60 L 32,58 L 40,50 Z"
          fill="rgba(15, 23, 42, 0.7)"
          stroke="#f97316"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Right Raven Wing - Faceted Geometric Feathers */}
        <path
          d="M 50,22 L 68,28 L 82,38 L 90,50 L 82,54 L 72,48 L 78,60 L 68,58 L 60,50 Z"
          fill="rgba(15, 23, 42, 0.7)"
          stroke="#f97316"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Central Norse Knotwork Diamond & Tail Anchor */}
        <path
          d="M 50,34 L 62,48 L 50,66 L 38,48 Z"
          fill="rgba(249, 115, 22, 0.12)"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Interlocking Tail Runic Knot */}
        <path
          d="M 50,66 L 56,76 L 50,86 L 44,76 Z"
          fill="rgba(56, 189, 248, 0.15)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Central Crown / Twin Raven Crest Beaks */}
        <path
          d="M 44,18 L 50,14 L 56,18 L 50,26 Z"
          fill="#f97316"
          stroke="#fb923c"
          strokeWidth="1.2"
        />

        {/* Left Raven Sun-Orange Memory Eye */}
        <circle
          cx="44"
          cy="26"
          r="2.5"
          fill="#fb923c"
          className="raven-eye"
        />

        {/* Right Raven Sun-Orange Memory Eye */}
        <circle
          cx="56"
          cy="26"
          r="2.5"
          fill="#fb923c"
          className="raven-eye"
        />

        {/* Core Radiating Rune Conduit Lines */}
        <line x1="50" y1="34" x2="50" y2="66" stroke="#fb923c" strokeWidth="1.2" strokeOpacity="0.85" />
        <line x1="38" y1="48" x2="62" y2="48" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.85" />
      </svg>
    </div>
  );
};
