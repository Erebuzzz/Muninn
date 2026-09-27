"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { initMythicDust, elasticRecoil } from "@/lib/animations";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initMythicDust(canvasRef.current);
      return cleanup;
    }
  }, []);

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Mythic Dust Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      />

      {/* Decorative Runes */}
      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <RavenLogo size={72} animated={true} glow={true} className="mb-6" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-amber-400 mb-4 shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>ERROR 404 • REALM UNMAPPED</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Lost in the Mists of Niflheim
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          The memory conduit you seek does not exist in Odin&apos;s living vault. Even Muninn&apos;s keen wings cannot locate this coordinate.
        </p>

        <div className="flex items-center gap-3">
          <Link
            ref={buttonRef}
            href="/"
            onClick={(e) => elasticRecoil(buttonRef.current)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold font-mono text-xs transition shadow-lg flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Return to Living Vault
          </Link>
        </div>

        <div className="mt-12 font-mono text-xs text-slate-600 tracking-widest">
          ᚠ • ᚢ • ᚦ • ᚨ • ᚱ • ᚲ • ᚷ • ᚹ
        </div>
      </div>
    </div>
  );
}
