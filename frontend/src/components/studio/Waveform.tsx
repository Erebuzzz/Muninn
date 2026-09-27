"use client";

import React, { useEffect, useRef } from "react";

interface WaveformProps {
  isActive: boolean;
  audioData?: number[];
  className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({ isActive, audioData, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const bars = 48;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        // Distance from center (0 to 1) for mirror harmonic curve
        const distFromCenter = Math.abs(i - bars / 2) / (bars / 2);
        const harmonicFalloff = 1 - distFromCenter * 0.45;

        let barHeight = 3;
        if (isActive) {
          const wave1 = Math.sin(step * 0.09 + i * 0.28);
          const wave2 = Math.cos(step * 0.05 + i * 0.15);
          const noise =
            audioData && audioData[i % audioData.length] !== undefined
              ? audioData[i % audioData.length] * 48
              : 0;
          barHeight = Math.max(
            4,
            (Math.abs(wave1 * 14 + wave2 * 8) + noise) * harmonicFalloff
          );
        }

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          // Mythic gradient: Amber gold crest blending into Norse sky cyan
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.95)");
          gradient.addColorStop(0.5, "rgba(251, 191, 36, 0.85)");
          gradient.addColorStop(1, "rgba(56, 189, 248, 0.65)");
        } else {
          gradient.addColorStop(0, "rgba(71, 85, 105, 0.35)");
          gradient.addColorStop(1, "rgba(51, 65, 85, 0.15)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      step++;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, audioData]);

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={420}
        height={56}
        className="w-full max-w-md rounded"
      />
    </div>
  );
};
