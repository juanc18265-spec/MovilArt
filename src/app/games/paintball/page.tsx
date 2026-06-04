"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ═══ PAINTBALL DE PAZ ═══ */

// Tipos para el motor de juego
type Enemy = { x: number; y: number; radius: number; maxRadius: number; speed: number; id: number };
type Particle = { x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number };

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#EAB308", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function PaintballPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Referencias para el loop del juego (evita re-renders)
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const splattersRef = useRef<{x: number, y: number, color: string, size: number}[]>([]); // Manchas permanentes
  const scoreRef = useRef(0);
  const animationIdRef = useRef<number>(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startGame = () => {
    setIsStarted(true);
    setIsGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    enemiesRef.current = [];
    particlesRef.current = [];
    splattersRef.current = [];
    
    // Spawn enemies
    spawnIntervalRef.current = setInterval(() => {
      const radius = 10;
      const x = Math.random() * (window.innerWidth - radius * 2) + radius;
      const y = Math.random() * (window.innerHeight - radius * 2) + radius;
      
      enemiesRef.current.push({
        x, y, radius, 
        maxRadius: Math.random() * 30 + 40,
        speed: Math.random() * 0.5 + 0.2,
        id: Math.random()
      });
    }, 800);
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, isGameOver]);

  const endGame = () => {
    setIsGameOver(true);
    cancelAnimationFrame(animationIdRef.current);
    clearInterval(spawnIntervalRef.current);
  };

  useEffect(() => {
    if (!isStarted || isGameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Game Loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Fondo muy oscuro pero no negro
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar manchas permanentes (splatters)
      splattersRef.current.forEach(splat => {
        ctx.beginPath();
        ctx.arc(splat.x, splat.y, splat.size, 0, Math.PI * 2);
        ctx.fillStyle = splat.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Actualizar y dibujar partículas
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.vy += 0.2; // Gravity
        p.radius = Math.max(0, p.radius - 0.1); // Encoger

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life <= 0 || p.radius <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Actualizar y dibujar enemigos (Manchas Oscuras)
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        enemy.radius += enemy.speed;

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Texto de conflicto
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Odio", enemy.x, enemy.y);

        if (enemy.radius > enemy.maxRadius) {
          enemiesRef.current.splice(i, 1);
          // Castigo por no atraparlo (opcional)
        }
      }
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [isStarted, isGameOver]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isStarted || isGameOver) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Detect click on enemy
    let hit = false;
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];
      const dist = Math.hypot(clientX - enemy.x, clientY - enemy.y);
      
      if (dist - enemy.radius < 10) {
        // HIT!
        enemiesRef.current.splice(i, 1);
        scoreRef.current += 10;
        setScore(scoreRef.current);
        hit = true;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        // Dejar marca permanente
        splattersRef.current.push({
          x: enemy.x, y: enemy.y, color, size: enemy.radius * 1.5
        });

        // Crear explosión de partículas
        for (let j = 0; j < 30; j++) {
          particlesRef.current.push({
            x: clientX,
            y: clientY,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            radius: Math.random() * 8 + 3,
            color: color,
            life: Math.random() * 30 + 30,
            maxLife: 60
          });
        }
        break; // Only hit one at a time
      }
    }
    
    // Si fallas, puedes crear una pequeña partícula gris o perder puntos
  };

  if (!isStarted && !isGameOver) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />
        
        <div className="max-w-lg w-full text-center relative z-10">
          <h1 className="text-5xl md:text-7xl mb-4 text-white font-black italic tracking-tighter" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", textShadow: "4px 4px 0px #EF4444, 8px 8px 0px #3B82F6" }}>
            PAINTBALL <br/> DE PAZ
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-10 font-bold bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm">
            Destruye las "manchas de conflicto" con disparos de arte y color. ¡Haz clic rápido y llena la pantalla de pintura brillante!
          </p>
          <button onClick={startGame} className="btn-primary w-full shadow-red-500/50 text-2xl py-5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 border-none text-white hover:scale-105 transition-transform font-black uppercase tracking-widest">
            ¡Jugar Ahora!
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-slate-900 touch-none select-none overflow-hidden cursor-crosshair" onPointerDown={handlePointerDown}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* HUD */}
      {!isGameOver && (
        <>
          <div className="absolute top-6 left-6 z-10 flex gap-4 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl">
              <span className="text-xs uppercase tracking-widest text-slate-300 font-bold block mb-1">Puntos</span>
              <span className="text-3xl font-black">{score}</span>
            </div>
          </div>
          
          <div className="absolute top-6 right-6 z-10 pointer-events-none">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-center min-w-[100px]">
              <span className="text-xs uppercase tracking-widest text-slate-300 font-bold block mb-1">Tiempo</span>
              <span className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}</span>
            </div>
          </div>
          
          {/* Instrucción visual rápida */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-50">
            <p className="text-white font-bold tracking-widest uppercase text-sm">Toca las manchas oscuras rápido</p>
          </div>
        </>
      )}

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md anim-fade-in">
          <div className="text-center p-10 bg-slate-900 border-2 border-pink-500 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.5)] max-w-sm mx-4 transform transition-all duration-500 scale-100">
            <h2 className="text-4xl text-white font-black mb-2 uppercase italic" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              ¡Tiempo Fuera!
            </h2>
            <p className="text-slate-400 font-bold mb-6 text-lg">Puntuación Final</p>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-10">
              {score}
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={startGame} className="btn-primary shadow-pink-500/20 bg-pink-500 text-white border-none py-4 font-bold text-lg">
                Jugar de Nuevo
              </button>
              <Link href="/" className="btn-secondary bg-transparent border-slate-700 text-slate-300 py-4 font-bold text-lg">
                Volver al Menú
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
