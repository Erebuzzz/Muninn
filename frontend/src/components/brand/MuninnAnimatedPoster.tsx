"use client";

import React, { useEffect, useRef } from "react";
import { animate, createDrawable } from "animejs";

interface MuninnAnimatedPosterProps {
  className?: string;
}

export const MuninnAnimatedPoster: React.FC<MuninnAnimatedPosterProps> = ({
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const compassRef = useRef<SVGGElement | null>(null);
  const sunOrbRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    let compassAnim: any = null;
    let orbAnim: any = null;

    try {
      // 1. Geometric Path Stroke Drawing using Anime.js createDrawable
      const drawableElements = svgRef.current.querySelectorAll(
        ".poster-drawable, .poster-wing, .poster-rune, .poster-wave"
      );
      if (drawableElements.length > 0) {
        const drawables = createDrawable(Array.from(drawableElements) as any);
        animate(drawables, {
          draw: ["0 0", "0 1"],
          duration: 2400,
          ease: "inOutExpo",
          delay: (_, i) => (i ?? 0) * 45,
        });
      }

      // 2. Slow hypnotic rotation of the Sacred Geometry Runic Compass
      if (compassRef.current) {
        compassAnim = animate(compassRef.current, {
          rotate: 360,
          duration: 55000,
          ease: "linear",
          loop: true,
        });
      }

      // 3. Gentle breathing pulse on the Celestial Sun Orb
      if (sunOrbRef.current) {
        orbAnim = animate(sunOrbRef.current, {
          scale: [0.95, 1.08],
          opacity: [0.85, 1],
          duration: 3200,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        });
      }

      // 4. Staggered fade and rise for the MUNINN typography
      const textElements = svgRef.current.querySelectorAll(".poster-title, .poster-sub, .poster-badge");
      if (textElements.length > 0) {
        animate(textElements, {
          opacity: [0, 1],
          translateY: [25, 0],
          duration: 1600,
          delay: (_, i) => 800 + (i ?? 0) * 200,
          ease: "outExpo",
        });
      }

      // 5. Raven Memory Eyes blinking/pulsing
      const eyes = svgRef.current.querySelectorAll(".poster-eye");
      if (eyes.length > 0) {
        animate(eyes, {
          scale: [0.85, 1.3],
          opacity: [0.4, 1],
          duration: 2000,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        });
      }
    } catch {
      // Graceful fallback
    }

    return () => {
      compassAnim?.pause();
      orbAnim?.pause();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        className="w-full h-full overflow-visible select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="animBgGlow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#141c2e" />
            <stop offset="45%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#03060d" />
          </radialGradient>

          <radialGradient id="animSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="25%" stopColor="#fed7aa" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="animCoreAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#03060d" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="animGoldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="animGoldRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="animCyanFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="animObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="animGoldText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <filter id="animSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Space Background */}
        <rect width="1600" height="900" fill="url(#animBgGlow)" />

        {/* Constellation Network */}
        <g opacity="0.45" stroke="#38bdf8" strokeWidth="0.8" className="poster-drawable">
          <line x1="120" y1="240" x2="280" y2="180" strokeDasharray="3 3" />
          <line x1="280" y1="180" x2="420" y2="290" />
          <line x1="420" y1="290" x2="250" y2="380" />
          <line x1="250" y1="380" x2="150" y2="520" strokeDasharray="4 4" />
          <line x1="250" y1="380" x2="380" y2="460" />
          <line x1="380" y1="460" x2="520" y2="390" />
          <line x1="420" y1="290" x2="590" y2="220" />

          <line x1="1480" y1="240" x2="1320" y2="180" strokeDasharray="3 3" />
          <line x1="1320" y1="180" x2="1180" y2="290" />
          <line x1="1180" y1="290" x2="1350" y2="380" />
          <line x1="1350" y1="380" x2="1450" y2="520" strokeDasharray="4 4" />
          <line x1="1350" y1="380" x2="1220" y2="460" />
          <line x1="1220" y1="460" x2="1080" y2="390" />
          <line x1="1180" y1="290" x2="1010" y2="220" />

          <circle cx="120" cy="240" r="3" fill="#38bdf8" />
          <circle cx="280" cy="180" r="4.5" fill="#f97316" filter="url(#animSoftGlow)" />
          <circle cx="420" cy="290" r="3.5" fill="#38bdf8" />
          <circle cx="250" cy="380" r="3" fill="#38bdf8" />
          <circle cx="150" cy="520" r="4" fill="#f97316" />
          <circle cx="380" cy="460" r="3" fill="#38bdf8" />
          <circle cx="520" cy="390" r="4.5" fill="#38bdf8" filter="url(#animSoftGlow)" />
          <circle cx="590" cy="220" r="3.5" fill="#f97316" />

          <circle cx="1480" cy="240" r="3" fill="#38bdf8" />
          <circle cx="1320" cy="180" r="4.5" fill="#f97316" filter="url(#animSoftGlow)" />
          <circle cx="1180" cy="290" r="3.5" fill="#38bdf8" />
          <circle cx="1350" cy="380" r="3" fill="#38bdf8" />
          <circle cx="1450" cy="520" r="4" fill="#f97316" />
          <circle cx="1220" cy="460" r="3" fill="#38bdf8" />
          <circle cx="1080" cy="390" r="4.5" fill="#38bdf8" filter="url(#animSoftGlow)" />
          <circle cx="1010" cy="220" r="3.5" fill="#f97316" />
        </g>

        {/* 24kHz Acoustic Waveforms */}
        <g opacity="0.38" fill="none">
          <path
            className="poster-wave"
            d="M -50,430 Q 150,370 350,440 T 750,420 T 1150,450 T 1550,380 T 1650,420"
            stroke="#38bdf8"
            strokeWidth="1.8"
          />
          <path
            className="poster-wave"
            d="M -50,450 Q 200,530 450,430 T 900,480 T 1350,420 T 1650,460"
            stroke="#f97316"
            strokeWidth="2.2"
            filter="url(#animSoftGlow)"
          />
        </g>

        {/* Central Core Aura */}
        <circle cx="800" cy="330" r="360" fill="url(#animCoreAura)" />

        {/* Hypnotic Runic Compass (Rotating via Anime.js) */}
        <g ref={compassRef} transform="translate(800, 330)">
          <circle r="290" fill="none" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="8 6" className="poster-rune" />
          <circle r="275" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.3" className="poster-rune" />
          <polygon
            className="poster-rune"
            points="0,-250 177,-177 250,0 177,177 0,250 -177,177 -250,0 -177,-177"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </g>

        {/* Pulsing Sun Orb */}
        <g ref={sunOrbRef} transform="translate(800, 130)">
          <circle r="90" fill="url(#animSunGlow)" />
          <circle r="36" fill="#fff7ed" filter="url(#animSoftGlow)" />
          <circle r="20" fill="#fef08a" />
          <line x1="0" y1="-55" x2="0" y2="-28" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="28" x2="0" y2="55" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-55" y1="0" x2="-28" y2="0" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="0" x2="55" y2="0" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* The Geometric Raven Centerpiece */}
        <g transform="translate(800, 330) scale(4.4)">
          {/* Outer Octagon Frame */}
          <polygon
            className="poster-drawable"
            points="0,-38 27,-24 38,0 27,24 0,38 -27,24 -38,0 -27,-24"
            fill="rgba(15, 23, 42, 0.4)"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />

          {/* Left Wing Base */}
          <path
            className="poster-wing"
            d="M 0,-28 L -18,-22 L -32,-12 L -40,0 L -32,4 L -22,-2 L -28,10 L -18,8 L -10,0 Z"
            fill="url(#animObsidian)"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Left Wing Faceted Feathers */}
          <path
            className="poster-wing"
            d="M 0,-28 L -16,-24 L -28,-14 L -36,0 L -28,5 L -19,-1 L -24,12 L -15,10 L -8,0 Z"
            fill="url(#animGoldLeft)"
            stroke="#fef08a"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#animSoftGlow)"
          />

          {/* Right Wing Base */}
          <path
            className="poster-wing"
            d="M 0,-28 L 18,-22 L 32,-12 L 40,0 L 32,4 L 22,-2 L 28,10 L 18,8 L 10,0 Z"
            fill="url(#animObsidian)"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Right Wing Faceted Feathers */}
          <path
            className="poster-wing"
            d="M 0,-28 L 16,-24 L 28,-14 L 36,0 L 28,5 L 19,-1 L 24,12 L 15,10 L 8,0 Z"
            fill="url(#animGoldRight)"
            stroke="#fef08a"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#animSoftGlow)"
          />

          {/* Central Knotwork Diamond */}
          <path
            className="poster-drawable"
            d="M 0,-16 L 12,-2 L 0,16 L -12,-2 Z"
            fill="url(#animObsidian)"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
            filter="url(#animSoftGlow)"
          />
          <path
            className="poster-drawable"
            d="M 0,-12 L 9,-2 L 0,12 L -9,-2 Z"
            fill="url(#animCyanFacet)"
            stroke="#f97316"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Interlocking Tail */}
          <path
            className="poster-drawable"
            d="M 0,16 L 6,26 L 0,36 L -6,26 Z"
            fill="url(#animObsidian)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Crown & Dual Beaks */}
          <path
            className="poster-drawable"
            d="M -6,-32 L 0,-36 L 6,-32 L 0,-24 Z"
            fill="#f97316"
            stroke="#fed7aa"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Memory Eyes */}
          <circle cx="-6" cy="-24" r="2.2" fill="#fff7ed" className="poster-eye" />
          <circle cx="6" cy="-24" r="2.2" fill="#fff7ed" className="poster-eye" />
        </g>

        {/* Clean Norse Typography: MUNINN */}
        <g transform="translate(800, 680)" textAnchor="middle">
          <text
            y="4"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Cinzel', 'Trajan Pro', serif"
            fontSize="78"
            fontWeight="900"
            letterSpacing="18"
            fill="#000000"
            opacity="0.8"
          >
            MUNINN
          </text>

          <text
            className="poster-title"
            y="0"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Cinzel', 'Trajan Pro', serif"
            fontSize="78"
            fontWeight="900"
            letterSpacing="18"
            fill="url(#animGoldText)"
            filter="url(#animSoftGlow)"
          >
            MUNINN
          </text>

          <line x1="-280" y1="28" x2="280" y2="28" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.6" className="poster-drawable" />

          <text
            className="poster-sub"
            y="68"
            fontFamily="monospace"
            fontSize="20"
            fontWeight="600"
            letterSpacing="6"
            fill="#e2e8f0"
          >
            A LIVING MEMORY FOR YOUR WORK
          </text>

          {/* Badges */}
          <g transform="translate(0, 115)" fontFamily="monospace" fontSize="12" letterSpacing="2.5" fontWeight="600" className="poster-badge">
            <rect x="-370" y="-16" width="220" height="32" rx="16" fill="rgba(15, 23, 42, 0.7)" stroke="#f97316" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="-352" cy="0" r="4" fill="#f97316" />
            <text x="-338" y="4" textAnchor="start" fill="#fed7aa">OPT-IN CAPTURE</text>

            <rect x="-120" y="-16" width="240" height="32" rx="16" fill="rgba(15, 23, 42, 0.7)" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="-102" cy="0" r="4" fill="#38bdf8" />
            <text x="-88" y="4" textAnchor="start" fill="#bae6fd">VERIFIABLE CLAIMS</text>

            <rect x="150" y="-16" width="240" height="32" rx="16" fill="rgba(15, 23, 42, 0.7)" stroke="#f97316" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="168" cy="0" r="4" fill="#f97316" />
            <text x="182" y="4" textAnchor="start" fill="#fed7aa">PROACTIVE MEMORY</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
