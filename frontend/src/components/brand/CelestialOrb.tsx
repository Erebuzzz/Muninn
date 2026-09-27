"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useTheme } from "@/lib/themeContext";
import { elasticRecoil, triggerTacticalShockwave } from "@/lib/animations";

interface CelestialOrbProps {
  size?: number;
  interactive?: boolean;
  className?: string;
}

export const CelestialOrb: React.FC<CelestialOrbProps> = ({
  size = 44,
  interactive = true,
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();
  const orbRef = useRef<HTMLButtonElement | null>(null);
  const raysRef = useRef<SVGSVGElement | null>(null);
  const coreRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let raysAnim: any = null;
    let coreAnim: any = null;

    try {
      if (raysRef.current) {
        raysAnim = animate(raysRef.current, {
          rotate: theme === "helios" ? 360 : -360,
          duration: theme === "helios" ? 22000 : 38000,
          ease: "linear",
          loop: true,
        });
      }

      if (coreRef.current) {
        coreAnim = animate(coreRef.current, {
          scale: theme === "helios" ? [0.96, 1.05] : [0.97, 1.03],
          duration: theme === "helios" ? 2400 : 3400,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        });
      }
    } catch {
      // Fallback
    }

    return () => {
      raysAnim?.pause();
      coreAnim?.pause();
    };
  }, [theme]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    elasticRecoil(orbRef.current);
    triggerTacticalShockwave(
      orbRef.current,
      theme === "nyx" ? "rgba(249, 115, 22, 0.7)" : "rgba(139, 92, 246, 0.6)"
    );
    toggleTheme();
  };

  const isNyx = theme === "nyx";

  return (
    <button
      ref={orbRef}
      onClick={handleClick}
      aria-label={isNyx ? "Switch to Helios (Sun Light Mode)" : "Switch to Nyx (Moon Dark Mode)"}
      title={isNyx ? "Nyx Mode: Eclipsed Moonlight (Click for Helios Sun)" : "Helios Mode: Radiant Sunlight (Click for Nyx Moon)"}
      className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 outline-none select-none transition-all duration-500 group ${
        interactive ? "cursor-pointer" : "pointer-events-none"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Celestial Halo */}
      <div
        className={`absolute inset-[-6px] rounded-full blur-md transition-all duration-700 pointer-events-none ${
          isNyx
            ? "bg-violet-600/20 group-hover:bg-violet-500/30"
            : "bg-orange-500/25 group-hover:bg-orange-500/40"
        }`}
      />

      {/* Rotating Solar / Lunar Corona Rays */}
      <svg
        ref={raysRef}
        viewBox="0 0 100 100"
        className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none overflow-visible transition-opacity duration-700"
      >
        {isNyx ? (
          /* Nyx: Delicate Starlight Asterisms & Lunar Runes */
          <g stroke="#818cf8" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 4">
            <circle cx="50" cy="50" r="44" fill="none" />
            <line x1="50" y1="2" x2="50" y2="10" />
            <line x1="50" y1="90" x2="50" y2="98" />
            <line x1="2" y1="50" x2="10" y2="50" />
            <line x1="90" y1="50" x2="98" y2="50" />
            <line x1="16" y1="16" x2="22" y2="22" />
            <line x1="78" y1="78" x2="84" y2="84" />
            <line x1="16" y1="84" x2="22" y2="78" />
            <line x1="78" y1="22" x2="84" y2="16" />
          </g>
        ) : (
          /* Helios: Sun Corona Radiant Spikes */
          <g stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.6">
            <circle cx="50" cy="50" r="44" fill="none" strokeDasharray="2 3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = Number((50 + 38 * Math.cos(rad)).toFixed(2));
              const y1 = Number((50 + 38 * Math.sin(rad)).toFixed(2));
              const x2 = Number((50 + (i % 2 === 0 ? 47 : 43) * Math.cos(rad)).toFixed(2));
              const y2 = Number((50 + (i % 2 === 0 ? 47 : 43) * Math.sin(rad)).toFixed(2));
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" />;
            })}
          </g>
        )}
      </svg>

      {/* Core Orb Surface */}
      <svg
        ref={coreRef}
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Moon Gradient */}
          <radialGradient id="nyx-moon" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          {/* Sun Gradient */}
          <radialGradient id="helios-sun" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="35%" stopColor="#fdba74" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>

        {isNyx ? (
          /* Eclipsed Moon Sphere */
          <g>
            <circle cx="50" cy="50" r="34" fill="url(#nyx-moon)" />
            {/* Soft Lunar Craters */}
            <circle cx="42" cy="38" r="5" fill="#94a3b8" fillOpacity="0.35" />
            <circle cx="62" cy="48" r="7" fill="#94a3b8" fillOpacity="0.25" />
            <circle cx="48" cy="64" r="4" fill="#94a3b8" fillOpacity="0.3" />
            {/* Eclipsed Shadow Arc */}
            <path
              d="M 50,16 A 34,34 0 0,0 50,84 A 26,34 0 0,1 50,16 Z"
              fill="#090d16"
              fillOpacity="0.75"
            />
            {/* Radiant Crescent Rim Highlight */}
            <path
              d="M 50,16 A 34,34 0 0,1 84,50"
              stroke="#38bdf8"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ) : (
          /* Radiant Helios Sun Sphere */
          <g>
            <circle cx="50" cy="50" r="34" fill="url(#helios-sun)" />
            {/* Solar Flare Highlights */}
            <circle cx="42" cy="38" r="8" fill="#fff7ed" fillOpacity="0.5" />
            <circle cx="58" cy="58" r="5" fill="#c2410c" fillOpacity="0.35" />
            {/* Golden Solar Rim */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="#fed7aa"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
          </g>
        )}
      </svg>
    </button>
  );
};
