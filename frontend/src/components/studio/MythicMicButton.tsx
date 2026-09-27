"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { elasticRecoil, triggerTacticalShockwave } from "@/lib/animations";
import { soundFX } from "@/lib/soundfx";

interface MythicMicButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
  duration?: number;
  size?: number;
}

export const MythicMicButton: React.FC<MythicMicButtonProps> = ({
  isRecording,
  onToggle,
  disabled = false,
  duration = 0,
  size = 88,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const outerRuneRingRef = useRef<SVGSVGElement | null>(null);
  const innerRuneRingRef = useRef<SVGSVGElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);

  // Counter-rotating rune halos with Anime.js v4
  useEffect(() => {
    let outerAnim: any = null;
    let innerAnim: any = null;

    try {
      if (outerRuneRingRef.current) {
        outerAnim = animate(outerRuneRingRef.current, {
          rotate: -360,
          duration: isRecording ? 12000 : 36000,
          ease: "linear",
          loop: true,
        });
      }

      if (innerRuneRingRef.current) {
        innerAnim = animate(innerRuneRingRef.current, {
          rotate: 360,
          duration: isRecording ? 9000 : 28000,
          ease: "linear",
          loop: true,
        });
      }
    } catch {
      // Fallback
    }

    return () => {
      outerAnim?.pause();
      innerAnim?.pause();
    };
  }, [isRecording]);

  // Core respiration / active pulse
  useEffect(() => {
    if (!coreRef.current) return;

    if (isRecording) {
      try {
        const pulseAnim = animate(coreRef.current, {
          scale: [1, 1.12],
          duration: 900,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        });
        return () => {
          pulseAnim.pause();
        };
      } catch {
        // Fallback
      }
    }
  }, [isRecording]);

  const handleClick = () => {
    if (disabled) return;
    elasticRecoil(buttonRef.current);

    if (buttonRef.current) {
      triggerTacticalShockwave(
        buttonRef.current,
        isRecording ? "rgba(56, 189, 248, 0.6)" : "rgba(245, 158, 11, 0.8)"
      );
    }

    if (isRecording) {
      soundFX.playSessionEnd();
    } else {
      soundFX.playSessionStart();
    }

    onToggle();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const outerRunes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"];

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      {/* Outer Glow Halo */}
      <div
        className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
          isRecording
            ? "inset-[-18px] bg-amber-500/20 blur-xl scale-110"
            : "inset-[-8px] bg-sky-500/10 blur-lg scale-95"
        }`}
      />

      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled}
        aria-label={isRecording ? "Stop Recording Session" : "Start Live Memory Capture"}
        className="relative group p-0 bg-transparent border-0 outline-none cursor-pointer select-none transition-transform focus:outline-none"
        style={{ width: size, height: size }}
      >
        {/* Outer Counter-Clockwise Runic Ring */}
        <svg
          ref={outerRuneRingRef}
          viewBox="0 0 120 120"
          className="absolute inset-[-16px] w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none overflow-visible"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={isRecording ? "#f59e0b" : "#334155"}
            strokeWidth="0.8"
            strokeDasharray="4 4"
            strokeOpacity={isRecording ? "0.8" : "0.4"}
          />
          {outerRunes.map((rune, i) => {
            const angle = (i * 360) / outerRunes.length;
            const rad = (angle * Math.PI) / 180;
            const rx = 60 + 54 * Math.cos(rad);
            const ry = 60 + 54 * Math.sin(rad);
            return (
              <text
                key={i}
                x={rx}
                y={ry}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isRecording ? "#fbbf24" : "#64748b"}
                fontSize="7.5"
                fontFamily="monospace"
                className="select-none"
                opacity={isRecording ? "0.9" : "0.5"}
              >
                {rune}
              </text>
            );
          })}
        </svg>

        {/* Inner Clockwise Runic Octagonal Orbit */}
        <svg
          ref={innerRuneRingRef}
          viewBox="0 0 100 100"
          className="absolute inset-[-6px] w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none overflow-visible"
        >
          <polygon
            points="50,4 85,19 96,50 85,81 50,96 15,81 4,50 15,19"
            fill="none"
            stroke={isRecording ? "#38bdf8" : "#475569"}
            strokeWidth="1"
            strokeOpacity={isRecording ? "0.75" : "0.3"}
          />
        </svg>

        {/* Core Button Face */}
        <div
          ref={coreRef}
          className={`relative w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isRecording
              ? "bg-slate-950/90 border-amber-500 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
              : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-amber-500/60 hover:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          }`}
        >
          {isRecording ? (
            /* Active Stop / Recording State Icon */
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-sm bg-amber-400 shadow-md shadow-amber-500/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-[1px] bg-slate-950" />
              </div>
              <span className="mt-1 text-[9px] font-mono tracking-wider font-semibold text-amber-300">
                STOP
              </span>
            </div>
          ) : (
            /* Idle Raven Beak & Sacred Microphone Icon */
            <div className="flex flex-col items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:scale-110"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <span className="mt-1 text-[9px] font-mono tracking-wider text-slate-400 group-hover:text-amber-300">
                MUNINN
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Monospace Duration / State Badge */}
      {isRecording && (
        <div className="mt-3 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[10px] text-amber-300 tracking-wider">
            REC {formatDuration(duration)}
          </span>
        </div>
      )}
    </div>
  );
};
