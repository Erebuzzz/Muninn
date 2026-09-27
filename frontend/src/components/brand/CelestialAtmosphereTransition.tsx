"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useTheme } from "@/lib/themeContext";

export function CelestialAtmosphereTransition() {
  const { transitionPhase } = useTheme();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const orbRef = useRef<HTMLDivElement | null>(null);
  const raysRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!transitionPhase) return;

    const overlay = overlayRef.current;
    const orb = orbRef.current;
    const rays = raysRef.current;
    const canvas = canvasRef.current;

    if (!overlay || !orb) return;

    if (transitionPhase === "sunrise") {
      // 1. Sunrise: Sun ascends from below horizon, golden dawn rays bloom upwards
      animate(overlay, {
        opacity: [0, 0.95, 0],
        duration: 950,
        ease: "inOutQuad",
      });

      animate(orb, {
        translateY: ["70vh", "20vh"],
        scale: [0.6, 1.4],
        opacity: [0, 1, 0],
        duration: 950,
        ease: "outCubic",
      });

      if (rays) {
        animate(rays, {
          scale: [0.4, 2.2],
          rotate: [0, 60],
          opacity: [0, 0.8, 0],
          duration: 950,
          ease: "outSine",
        });
      }

      // Draw sunrise golden particles on canvas
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          let frame = 0;
          const particles: { x: number; y: number; vy: number; r: number; alpha: number }[] = [];
          for (let i = 0; i < 40; i++) {
            particles.push({
              x: Math.random() * canvas.width,
              y: canvas.height * (0.6 + Math.random() * 0.4),
              vy: -(Math.random() * 3 + 2),
              r: Math.random() * 2.5 + 1,
              alpha: Math.random() * 0.8 + 0.2,
            });
          }

          let animId: number;
          const loop = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let p of particles) {
              p.y += p.vy;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha * (1 - frame / 55)})`;
              ctx.fill();
            }
            if (frame < 55) {
              animId = requestAnimationFrame(loop);
            }
          };
          loop();
        }
      }
    } else if (transitionPhase === "sunset") {
      // 2. Sunset: Sun dips below horizon, deep twilight violet and crimson descent
      animate(overlay, {
        opacity: [0, 0.95, 0],
        duration: 950,
        ease: "inOutQuad",
      });

      animate(orb, {
        translateY: ["18vh", "75vh"],
        scale: [1.3, 0.6],
        opacity: [1, 0.8, 0],
        duration: 950,
        ease: "inCubic",
      });

      if (rays) {
        animate(rays, {
          scale: [1.8, 0.5],
          rotate: [0, -60],
          opacity: [0.7, 0.2, 0],
          duration: 950,
          ease: "inSine",
        });
      }

      // Draw starlight emergence on canvas
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          let frame = 0;
          const stars: { x: number; y: number; r: number; alpha: number }[] = [];
          for (let i = 0; i < 50; i++) {
            stars.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height * 0.7,
              r: Math.random() * 1.8 + 0.8,
              alpha: Math.random() * 0.9 + 0.1,
            });
          }

          let animId: number;
          const loop = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const progress = frame / 55;
            for (let s of stars) {
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(199, 210, 254, ${s.alpha * Math.min(1, progress * 1.5)})`;
              ctx.shadowColor = "rgba(167, 139, 250, 0.8)";
              ctx.shadowBlur = 4;
              ctx.fill();
            }
            if (frame < 55) {
              animId = requestAnimationFrame(loop);
            }
          };
          loop();
        }
      }
    }
  }, [transitionPhase]);

  if (!transitionPhase) return null;

  const isSunrise = transitionPhase === "sunrise";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9990] pointer-events-none overflow-hidden transition-opacity"
      style={{
        background: isSunrise
          ? "radial-gradient(ellipse at 50% 100%, rgba(251, 146, 60, 0.5) 0%, rgba(254, 215, 170, 0.35) 40%, rgba(249, 115, 22, 0.15) 70%, transparent 100%)"
          : "radial-gradient(ellipse at 50% 100%, rgba(234, 88, 12, 0.4) 0%, rgba(124, 58, 237, 0.45) 45%, rgba(15, 23, 42, 0.6) 80%, rgba(5, 7, 12, 0.85) 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Radiant Sun / Moon Transition Body */}
      <div
        ref={orbRef}
        className="absolute left-1/2 -ml-24 w-48 h-48 rounded-full flex items-center justify-center pointer-events-none"
        style={{
          background: isSunrise
            ? "radial-gradient(circle, #fff7ed 0%, #fdba74 40%, #f97316 75%, transparent 100%)"
            : "radial-gradient(circle, #ffedd5 0%, #ea580c 45%, #7c3aed 80%, transparent 100%)",
          boxShadow: isSunrise
            ? "0 0 80px 30px rgba(249, 115, 22, 0.6), 0 0 160px 60px rgba(251, 146, 60, 0.3)"
            : "0 0 80px 25px rgba(124, 58, 237, 0.5), 0 0 140px 50px rgba(234, 88, 12, 0.3)",
        }}
      >
        {/* Rotating Corona Rays */}
        <div
          ref={raysRef}
          className="absolute inset-[-40px] rounded-full pointer-events-none"
          style={{
            background: isSunrise
              ? "conic-gradient(from 0deg, transparent 0deg, rgba(251, 146, 60, 0.4) 20deg, transparent 40deg, rgba(254, 215, 170, 0.5) 70deg, transparent 90deg, rgba(251, 146, 60, 0.4) 140deg, transparent 160deg, rgba(254, 215, 170, 0.5) 210deg, transparent 240deg, rgba(251, 146, 60, 0.4) 300deg, transparent 320deg)"
              : "conic-gradient(from 0deg, transparent 0deg, rgba(167, 139, 250, 0.35) 25deg, transparent 50deg, rgba(234, 88, 12, 0.3) 85deg, transparent 110deg, rgba(167, 139, 250, 0.35) 170deg, transparent 200deg, rgba(234, 88, 12, 0.3) 260deg, transparent 290deg)",
          }}
        />
      </div>
    </div>
  );
}
