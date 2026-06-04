"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Colors matching Colombia tricolor & MovilArt brand in soft pastel watercolors
    const COLORS = [
      "rgba(20, 184, 166, 0.4)",  // Teal
      "rgba(6, 182, 212, 0.4)",  // Cyan
      "rgba(234, 179, 8, 0.4)",   // Yellow (Colombia)
      "rgba(59, 130, 246, 0.4)",  // Blue (Colombia)
      "rgba(239, 68, 68, 0.4)",   // Red (Colombia)
      "rgba(16, 185, 129, 0.4)",  // Emerald
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const addParticle = (x: number, y: number) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const radius = Math.random() * 15 + 10; // Soft wide watercolor drop
      const decay = Math.random() * 0.015 + 0.01;

      // Small natural dispersion speed
      const vx = (Math.random() - 0.5) * 1.2;
      const vy = (Math.random() - 0.5) * 1.2;

      particles.push({
        x,
        y,
        vx,
        vy,
        radius,
        color,
        alpha: 0.9,
        decay,
      });

      // Limit array size for performance
      if (particles.length > 60) {
        particles.shift();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn particles with a tiny bit of random offsets for organic feeling
      addParticle(e.clientX, e.clientY);
      if (Math.random() > 0.4) {
        addParticle(e.clientX + (Math.random() - 0.5) * 15, e.clientY + (Math.random() - 0.5) * 15);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addParticle(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        
        // Decay opacity and slightly expand for watercolor bleeding look
        p.alpha -= p.decay;
        p.radius += 0.2;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        // Draw watercolor wash effect (soft radial gradient)
        const gradient = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color.replace("0.4", (p.alpha * 0.6).toString()));
        gradient.addColorStop(0.5, p.color.replace("0.4", (p.alpha * 0.25).toString()));
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
