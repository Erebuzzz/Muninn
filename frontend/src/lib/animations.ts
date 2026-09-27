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
 * Atmospheric Sky system: Ethereal drifting clouds and twinkling celestial stars.
 * In Helios: warm golden sunlight filtering through delicate clouds.
 * In Nyx: moonlight and violet starlight illuminated clouds with twinkling stars.
 */
export function initAtmosphericSky(canvas: HTMLCanvasElement): () => void {
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

  // 4 to 6 gentle drifting cloud masses (not dense, ethereal)
  interface CloudMass {
    x: number;
    y: number;
    rx: number;
    ry: number;
    vx: number;
    vy: number;
    alpha: number;
    phase: number;
  }

  const cloudCount = 5;
  const clouds: CloudMass[] = [];
  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: (Math.random() * 0.9 + 0.05) * width,
      y: (Math.random() * 0.7 + 0.1) * height,
      rx: Math.random() * 260 + 220,
      ry: Math.random() * 140 + 90,
      vx: (Math.random() * 0.12 + 0.04) * (i % 2 === 0 ? 1 : -1),
      vy: (Math.random() * 0.06 - 0.03),
      alpha: Math.random() * 0.18 + 0.12,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Twinkling celestial stars
  interface Star {
    x: number;
    y: number;
    radius: number;
    alpha: number;
    twinkleSpeed: number;
    phase: number;
  }

  const stars: Star[] = [];
  const starCount = Math.min(48, Math.floor((width * height) / 25000));
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let time = 0;

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    time += 0.01;

    const isHelios = document.documentElement.classList.contains("helios");

    // 1. Render Atmospheric Clouds
    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      c.x += c.vx;
      c.y += c.vy;

      // Wrap horizontal bounds
      if (c.x - c.rx > width) c.x = -c.rx;
      if (c.x + c.rx < 0) c.x = width + c.rx;

      const breathingAlpha = c.alpha * (0.85 + 0.15 * Math.sin(time * 0.5 + c.phase));

      const grad = ctx.createRadialGradient(c.x, c.y, c.rx * 0.1, c.x, c.y, c.rx);
      if (isHelios) {
        // Helios: Warm golden sunlit morning clouds
        grad.addColorStop(0, `rgba(251, 146, 60, ${breathingAlpha * 0.6})`);
        grad.addColorStop(0.45, `rgba(254, 215, 170, ${breathingAlpha * 0.35})`);
        grad.addColorStop(1, "rgba(254, 243, 199, 0)");
      } else {
        // Nyx: Starlight & moonlit violet cloud reflection
        grad.addColorStop(0, `rgba(139, 92, 246, ${breathingAlpha * 0.45})`);
        grad.addColorStop(0.5, `rgba(56, 189, 248, ${breathingAlpha * 0.25})`);
        grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      }

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // 2. Render Twinkling Stars (visible in Nyx, subtle in Helios)
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.twinkleSpeed;
      const currentAlpha = Math.max(0.1, s.alpha * (0.5 + 0.5 * Math.sin(s.phase)));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

      if (isHelios) {
        ctx.fillStyle = `rgba(234, 88, 12, ${currentAlpha * 0.4})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(167, 139, 250, 0.7)";
      }
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

/**
 * Deep Void Constellation Galaxy Background for MemoryGraphView
 * Minimalist deep-field galaxy with swirling cosmic dust, gravitational orbit rings, and luminous caustics.
 */
export function initGalaxyCanvas(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let animationFrameId: number;
  let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
  let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

  const resizeHandler = () => {
    width = canvas.width = canvas.parentElement?.clientWidth || 800;
    height = canvas.height = canvas.parentElement?.clientHeight || 480;
  };
  window.addEventListener("resize", resizeHandler);

  const centerX = width / 2;
  const centerY = height / 2;

  // Stardust orbital particles
  interface CosmicParticle {
    orbitRadius: number;
    angle: number;
    speed: number;
    size: number;
    alpha: number;
    color: string;
  }

  const cosmicParticles: CosmicParticle[] = [];
  const pCount = 54;
  const palette = [
    "rgba(249, 115, 22, ", // Sun orange
    "rgba(56, 189, 248, ", // Cyan
    "rgba(168, 85, 247, ", // Violet
    "rgba(255, 255, 255, ", // Pure starlight
  ];

  for (let i = 0; i < pCount; i++) {
    cosmicParticles.push({
      orbitRadius: 40 + Math.random() * 280,
      angle: Math.random() * Math.PI * 2,
      speed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.7 + 0.2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }

  let angleOffset = 0;

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    angleOffset += 0.0015;

    // 1. Central Galactic Core Caustic Glow
    const coreGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, 260);
    coreGrad.addColorStop(0, "rgba(249, 115, 22, 0.14)");
    coreGrad.addColorStop(0.35, "rgba(56, 189, 248, 0.06)");
    coreGrad.addColorStop(0.7, "rgba(139, 92, 246, 0.03)");
    coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Gravitational Concentric Orbit Rings
    const orbitRings = [110, 190, 260];
    ctx.lineWidth = 1;
    for (let r of orbitRings) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.setLineDash([4, 8]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 3. Orbiting Cosmic Stardust Particles
    for (let i = 0; i < cosmicParticles.length; i++) {
      const p = cosmicParticles[i];
      p.angle += p.speed;

      const px = width / 2 + p.orbitRadius * Math.cos(p.angle);
      const py = height / 2 + (p.orbitRadius * 0.65) * Math.sin(p.angle); // Elliptical galaxy perspective

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;
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
