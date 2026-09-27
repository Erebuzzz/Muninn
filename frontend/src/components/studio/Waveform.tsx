"use client";

import React, { useEffect, useRef } from "react";

interface WaveformProps {
  isActive: boolean;
  audioData?: number[];
}

export const Waveform: React.FC<WaveformProps> = ({ isActive, audioData }) => {
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

      const bars = 36;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4;
        if (isActive) {
          const wave = Math.sin(step * 0.08 + i * 0.25);
          const noise = audioData && audioData[i % audioData.length] !== undefined
            ? audioData[i % audioData.length] * 40
            : 0;
          barHeight = Math.max(6, Math.abs(wave * 22) + noise);
        }

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.9)"); // amber
          gradient.addColorStop(1, "rgba(217, 119, 6, 0.4)");
        } else {
          gradient.addColorStop(0, "rgba(75, 85, 99, 0.4)");
          gradient.addColorStop(1, "rgba(55, 65, 81, 0.2)");
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
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={360}
        height={60}
        className="w-full max-w-sm rounded"
      />
    </div>
  );
};
