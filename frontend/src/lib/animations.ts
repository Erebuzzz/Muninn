"use client";

import { animate, createDrawable } from "animejs";

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

export function getRandomRune(): string {
  return RUNES[Math.floor(Math.random() * RUNES.length)];
}

/**
 * Text decipher effect: Scrambles through Norse runic glyphs before crystallizing into true text.
 */
export function runeCipherDecode(
  target: HTMLElement | null,
  finalText: string,
  duration = 900
): void {
  if (!target) return;

  const length = finalText.length;
  if (length === 0) {
    target.textContent = "";
    return;
  }

  const steps = 18;
  const interval = duration / steps;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    const resolvedCount = Math.floor(progress * length);

    let output = "";
    for (let i = 0; i < length; i++) {
      if (finalText[i] === " " || finalText[i] === "\n") {
        output += finalText[i];
      } else if (i < resolvedCount) {
        output += finalText[i];
      } else {
        output += getRandomRune();
      }
    }

    target.textContent = output;

    if (currentStep >= steps) {
      clearInterval(timer);
      target.textContent = finalText;
    }
  }, interval);
}

/**
 * Tactical button recoil and spring bounce.
 */
export function elasticRecoil(target: HTMLElement | SVGElement | null): void {
  if (!target) return;
  try {
    animate(target, {
      scale: [0.92, 1],
      duration: 350,
      ease: "outElastic(1, .6)",
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Radial shockwave ripple effect originating from a point.
 */
export function triggerTacticalShockwave(
  parentEl: HTMLElement | null,
  color = "rgba(245, 158, 11, 0.4)"
): void {
  if (!parentEl) return;

  const ripple = document.createElement("div");
  ripple.className = "pointer-events-none absolute inset-0 rounded-full";
  ripple.style.border = `1.5px solid ${color}`;
  ripple.style.boxShadow = `0 0 16px ${color}`;
  ripple.style.transform = "scale(0.8)";
  ripple.style.opacity = "1";

  parentEl.appendChild(ripple);

  try {
    const anim = animate(ripple, {
      scale: [0.8, 1.8],
      opacity: [1, 0],
      ease: "outCubic",
      duration: 650,
    });
    anim.then(() => {
      ripple.remove();
    });
  } catch {
    setTimeout(() => ripple.remove(), 650);
  }
}

/**
 * Animate SVG stroke paths for Norse knotwork and conduit connections with Anime.js v4 createDrawable.
 */
export function drawSvgPath(
  targets: any,
  duration = 1400,
  delay = 0
): any {
  try {
    const drawables = createDrawable(targets);
    return animate(drawables, {
      draw: ["0 0", "0 1"],
      ease: "inOutQuart",
      duration,
      delay,
    });
  } catch {
    return null;
  }
}

/**
 * Memory Claim Crystallization Shard animation.
 */
export function crystallizeShard(target: HTMLElement | null): void {
  if (!target) return;
  try {
    animate(target, {
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.95, 1],
      ease: "outExpo",
      duration: 800,
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Drawer slide animations.
 */
export function slideInDrawer(
  target: HTMLElement | null,
  direction: "left" | "right" | "bottom" = "left",
  onComplete?: () => void
): void {
  if (!target) return;

  let initialTransform = { x: 0, y: 0 };
  if (direction === "left") initialTransform.x = -100;
  if (direction === "right") initialTransform.x = 100;
  if (direction === "bottom") initialTransform.y = 100;

  target.style.display = "flex";

  try {
    const anim = animate(target, {
      translateX: direction === "bottom" ? [0, 0] : [`${initialTransform.x}%`, "0%"],
      translateY: direction === "bottom" ? [`${initialTransform.y}%`, "0%"] : [0, 0],
      opacity: [0, 1],
      ease: "outCubic",
      duration: 380,
    });
    if (onComplete) {
      anim.then(() => onComplete());
    }
  } catch {
    if (onComplete) onComplete();
  }
}

export function slideOutDrawer(
  target: HTMLElement | null,
  direction: "left" | "right" | "bottom" = "left",
  onComplete?: () => void
): void {
  if (!target) return;

  let endTransform = { x: 0, y: 0 };
  if (direction === "left") endTransform.x = -100;
  if (direction === "right") endTransform.x = 100;
  if (direction === "bottom") endTransform.y = 100;

  try {
    const anim = animate(target, {
      translateX: direction === "bottom" ? [0, 0] : ["0%", `${endTransform.x}%`],
      translateY: direction === "bottom" ? ["0%", `${endTransform.y}%`] : [0, 0],
      opacity: [1, 0],
      ease: "inCubic",
      duration: 300,
    });
    anim.then(() => {
      target.style.display = "none";
      if (onComplete) onComplete();
    });
  } catch {
    target.style.display = "none";
    if (onComplete) onComplete();
  }
}

/**
 * Lightweight canvas particle system for floating mythological rune dust.
 */
export function initMythicDust(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let animationFrameId: number;
  let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

  const resizeHandler = () => {
    width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  };
  window.addEventListener("resize", resizeHandler);

  interface Particle {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    alpha: number;
    targetAlpha: number;
    color: string;
  }

  const particles: Particle[] = [];
  const particleCount = Math.min(36, Math.floor((width * height) / 35000));

  const colors = [
    "rgba(249, 115, 22, ", // Sun Orange (Muninn Solar Core)
    "rgba(139, 92, 246, ", // Violet Starlight (Nyx Night)
    "rgba(56, 189, 248, ", // Cyan Ether (Norse Cold Sky)
    "rgba(251, 146, 60, ", // Solar Flare Peach
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.15,
      alpha: Math.random() * 0.6 + 0.1,
      targetAlpha: Math.random() * 0.6 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen boundaries
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // Subtle flicker
      p.alpha += (p.targetAlpha - p.alpha) * 0.04;
      if (Math.abs(p.targetAlpha - p.alpha) < 0.03) {
        p.targetAlpha = Math.random() * 0.6 + 0.1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color === colors[0] ? "#f59e0b" : "#38bdf8";
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", resizeHandler);
  };
}
