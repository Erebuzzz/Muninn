"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

export function MythicCursor() {
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

    // Smooth trailing physics loop for the starlight ring
    let animationFrameId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.22);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.22);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${isHovered ? 1.4 : 1})`;
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
      {/* Precision Central Reticle Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -ml-1 -mt-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] transition-transform duration-75"
        style={{ willChange: "transform" }}
      />

      {/* Trailing Mythic Starlight Ring & Faceted Reticle Crosshairs */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -ml-4 -mt-4 w-8 h-8 rounded-full border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-[border-color,background-color] duration-200 flex items-center justify-center ${
          isHovered ? "bg-orange-500/10 border-orange-400" : "bg-transparent"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Faceted Geometric Corner Crosshair Notches */}
        <div className="absolute -top-1 w-1 h-0.5 bg-orange-400/80" />
        <div className="absolute -bottom-1 w-1 h-0.5 bg-orange-400/80" />
        <div className="absolute -left-1 w-0.5 h-1 bg-orange-400/80" />
        <div className="absolute -right-1 w-0.5 h-1 bg-orange-400/80" />
      </div>
    </>
  );
}
