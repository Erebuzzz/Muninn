"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useTheme } from "@/lib/themeContext";

export function MythicCursor() {
  const { theme } = useTheme();
  const isSun = theme === "helios";

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Disable on mobile/touch screens
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("[role='button']") ||
          target.classList.contains("cursor-pointer")
        );
        setIsHovered(isInteractive);
      }
    };

    const onMouseDown = () => {
      if (ringRef.current) {
        animate(ringRef.current, {
          scale: [1, 1.8],
          opacity: [0.8, 0],
          duration: 400,
          ease: "outExpo",
        });
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth trailing physics loop for the celestial ring
    let animationFrameId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.22);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.22);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isHovered]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Central Reticle Nucleus: Amber Sunfire Dot (Helios) vs Pearl Starlight Dot (Nyx) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] -ml-1 -mt-1 w-2 h-2 rounded-full transition-colors duration-300 ${
          isSun
            ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
            : "bg-sky-200 shadow-[0_0_8px_#38bdf8]"
        }`}
        style={{ willChange: "transform" }}
      />

      {/* Trailing Celestial Ring: Radiant Sun (Helios) vs Crescent Moon (Nyx) */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -ml-5 -mt-5 w-10 h-10 rounded-full transition-[opacity] duration-200 flex items-center justify-center ${
          isSun
            ? "drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]"
            : "drop-shadow-[0_0_12px_rgba(129,140,248,0.4)]"
        }`}
        style={{ willChange: "transform" }}
      >
        {isSun ? (
          /* Radiant Sun Reticle for Helios Mode */
          <svg
            viewBox="0 0 40 40"
            className={`w-full h-full transition-transform duration-300 ${isHovered ? "scale-125 rotate-45" : "scale-100 rotate-0"}`}
          >
            {/* Outer Solar Orbit Ring */}
            <circle
              cx="20"
              cy="20"
              r="10"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.2"
              strokeOpacity="0.75"
              strokeDasharray="3 2"
            />
            {/* Inner Sunfire Core */}
            <circle
              cx="20"
              cy="20"
              r="6.5"
              fill="#f59e0b"
              fillOpacity="0.25"
              stroke="#fbbf24"
              strokeWidth="1"
            />
            {/* 8 Solar Corona Radiant Spikes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 20 + 11 * Math.cos(rad);
              const y1 = 20 + 11 * Math.sin(rad);
              const x2 = 20 + (deg % 90 === 0 ? 17 : 14) * Math.cos(rad);
              const y2 = 20 + (deg % 90 === 0 ? 17 : 14) * Math.sin(rad);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f97316"
                  strokeWidth={deg % 90 === 0 ? 1.5 : 1.1}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        ) : (
          /* Celestial Moon Reticle for Nyx Mode */
          <svg
            viewBox="0 0 40 40"
            className={`w-full h-full transition-transform duration-300 ${isHovered ? "scale-125" : "scale-100"}`}
          >
            {/* Starlight Constellation Orbit Ring */}
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="none"
              stroke="#818cf8"
              strokeWidth="1"
              strokeOpacity="0.55"
              strokeDasharray="2 3"
            />
            {/* Crescent Moon Arc */}
            <path
              d="M 20,8 A 12,12 0 0,0 20,32 A 8.5,12 0 0,1 20,8 Z"
              fill="#38bdf8"
              fillOpacity="0.35"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Delicate Starlight Asterism Notches */}
            <line x1="20" y1="4" x2="20" y2="7" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="20" y1="33" x2="20" y2="36" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="4" y1="20" x2="7" y2="20" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="33" y1="20" x2="36" y2="20" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
            {/* Twinkling Starlight Sparks */}
            <circle cx="26" cy="14" r="1.1" fill="#e0e7ff" />
            <circle cx="14" cy="25" r="0.8" fill="#c7d2fe" />
          </svg>
        )}
      </div>
    </>
  );
}
