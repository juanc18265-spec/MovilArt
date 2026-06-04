"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   Escenas del Video Cinematográfico (20s total)
   ═══════════════════════════════════════════════ */
const SCENES = [
  {
    image: "/images/cinematic/peace_dove.png",
    title: "Construyendo Paz",
    subtitle: "a través del Arte",
    desc: "Un lienzo vivo para la memoria, la reconciliación y el tejido social.",
    kenBurns: "zoom-in-left",     // pans from left + zooms in
  },
  {
    image: "/images/cinematic/children_mural.png",
    title: "El Arte que Sana",
    subtitle: "expresión colectiva",
    desc: "Cuando los niños pintan juntos, transforman el conflicto en color.",
    kenBurns: "zoom-out-center",  // zooms out from center
  },
  {
    image: "/images/cinematic/culture_dance.png",
    title: "Colombia Viva",
    subtitle: "identidad cultural",
    desc: "Danza, máscaras y color — nuestra identidad como camino de paz.",
    kenBurns: "zoom-in-right",    // pans from right + zooms in
  },
  {
    image: "/images/cinematic/hands_together.png",
    title: "Manos Unidas",
    subtitle: "tejido social",
    desc: "Cada mano, cada color, un paso más hacia la reconciliación.",
    kenBurns: "zoom-out-up",      // pans up + zooms out
  },
];

const SCENE_DURATION = 5000; // 5 seconds each
const TRANSITION_DURATION = 800; // crossfade duration

/* ═══════════════════════════════════════════════
   Sintetizador de Sonido de Aleteo y Canto (Web Audio API)
   ═══════════════════════════════════════════════ */
const playFlappingSound = () => {
  try {
    const AudioContextClass = typeof window !== 'undefined' && 
      ((window as any).AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // 1. Sonido de Aleteo (Ruido Blanco Filtrado y Modulado)
    const bufferSize = ctx.sampleRate * 2.5; // Duración 2.5s
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    
    // Simula 8 aleteos a lo largo de 2.5 segundos con aceleración y desvanecimiento
    const flaps = [0.0, 0.22, 0.45, 0.70, 0.98, 1.30, 1.65, 2.05];
    flaps.forEach((t) => {
      // Pico del aleteo
      gainNode.gain.setValueAtTime(0, ctx.currentTime + t);
      gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + t + 0.06);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.16);
      
      // Modulación de frecuencia para el efecto "whoosh"
      filter.frequency.setValueAtTime(100, ctx.currentTime + t);
      filter.frequency.linearRampToValueAtTime(280, ctx.currentTime + t + 0.06);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + t + 0.16);
    });
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // 2. Canto de Paloma de la Paz (Dulce gorjeo "coo-coo-coo")
    const notes = [
      { time: 0.1, freq: 580, dur: 0.18 },
      { time: 0.35, freq: 620, dur: 0.28 },
      { time: 0.7, freq: 580, dur: 0.38 }
    ];
    
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = "sine";
      // Vibrato suave
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 6; // 6 Hz vibrato
      lfoGain.gain.value = 8;  // rango de vibrato
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);
      osc.frequency.exponentialRampToValueAtTime(note.freq - 40, ctx.currentTime + note.time + note.dur);
      
      oscGain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      oscGain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + note.time + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.dur);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      lfo.start(ctx.currentTime + note.time);
      osc.start(ctx.currentTime + note.time);
      
      lfo.stop(ctx.currentTime + note.time + note.dur);
      osc.stop(ctx.currentTime + note.time + note.dur);
    });
    
    // 3. Campana Mágica de Fondo
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = "triangle";
    bellOsc.frequency.setValueAtTime(880, ctx.currentTime);
    bellOsc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    bellOsc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.3);
    
    bellGain.gain.setValueAtTime(0, ctx.currentTime);
    bellGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    
    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    
    noiseNode.start(ctx.currentTime);
    bellOsc.start(ctx.currentTime);
    
    noiseNode.stop(ctx.currentTime + 2.5);
    bellOsc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.error("No se pudo iniciar Web Audio API:", e);
  }
};

interface FlyingDove {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  drift: number;
  createdAt: number;
}

export default function VideoShowcase() {
  const [activeScene, setActiveScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const hasAutoPlayed = useRef(false);

  // Estados para palomas voladoras
  const [doves, setDoves] = useState<FlyingDove[]>([]);
  const doveIdCounter = useRef(0);

  // Método para lanzar una paloma
  const launchDove = useCallback((x?: number, y?: number) => {
    const startX = x !== undefined ? x : 48;
    const startY = y !== undefined ? y : 75;
    const id = ++doveIdCounter.current;
    const angle = Math.random() * 20 - 10; // -10deg a 10deg
    const drift = Math.random() * 30 - 15; // desplazamiento horizontal (-15vw a 15vw)
    
    setDoves((prev) => [...prev, { id, startX, startY, angle, drift, createdAt: Date.now() }]);
    playFlappingSound();

    // Eliminar la paloma después de que termine la animación (4.5 segundos)
    setTimeout(() => {
      setDoves((prev) => prev.filter((d) => d.id !== id));
    }, 4500);
  }, []);

  /* ═══ Auto-play on intersection ═══ */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          startPlayback();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══ Auto-launch peace dove when Scene 0 shows up ═══ */
  useEffect(() => {
    if (activeScene === 0 && isPlaying && isVisible) {
      const timer = setTimeout(() => {
        launchDove(48, 75);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeScene, isPlaying, isVisible, launchDove]);

  /* ═══ Playback engine ═══ */
  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setActiveScene(0);
    setProgress(0);
    setTextVisible(true);
    startRef.current = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / SCENE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SCENE_DURATION) {
        setActiveScene((prev) => {
          const next = prev + 1;
          const isOver = next >= SCENES.length;

          // Transition
          setTransitioning(true);
          setTextVisible(false);
          setTimeout(() => {
            setTransitioning(false);
            setTextVisible(true);
          }, TRANSITION_DURATION);

          startRef.current = Date.now();
          setProgress(0);
          return isOver ? 0 : next;
        });
      }
    }, 40);
  }, [launchDove]);

  /* ═══ Cleanup ═══ */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ═══ Restart ═══ */
  const handleRestart = () => {
    startPlayback();
  };

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPlaying) {
      setIsPlaying(true);
      startRef.current = Date.now() - (progress / 100) * SCENE_DURATION;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        const pct = Math.min((elapsed / SCENE_DURATION) * 100, 100);
        setProgress(pct);

        if (elapsed >= SCENE_DURATION) {
          setActiveScene((prev) => {
            const next = prev + 1;
            const isOver = next >= SCENES.length;

            setTransitioning(true);
            setTextVisible(false);
            setTimeout(() => {
              setTransitioning(false);
              setTextVisible(true);
            }, TRANSITION_DURATION);

            startRef.current = Date.now();
            setProgress(0);
            return isOver ? 0 : next;
          });
        }
      }, 40);
    } else {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const elapsed = activeScene * 5 + Math.floor((progress / 100) * 5);
  const total = SCENES.length * 5;

  return (
    <section
      ref={containerRef}
      id="video-presentacion"
      className="relative overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* ═══ CINEMATIC VIDEO PLAYER ═══ */}
      <div className="relative w-full cursor-pointer" style={{ aspectRatio: "16/7", minHeight: "400px", maxHeight: "85vh" }} onClick={() => handleToggle()}>

        {/* ── Scene images with Ken Burns ── */}
        {SCENES.map((scene, i) => (
          <div
            key={i}
            className="absolute inset-0 overflow-hidden"
            style={{
              opacity: i === activeScene ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
              zIndex: i === activeScene ? 2 : 1,
            }}
          >
            <img
              src={scene.image}
              alt={scene.title}
              className={`w-full h-full object-cover cinematic-kb cinematic-kb--${scene.kenBurns}`}
              style={{
                animationPlayState: i === activeScene && isPlaying ? "running" : "paused",
                animationDuration: `${SCENE_DURATION}ms`,
              }}
            />
          </div>
        ))}

        {/* ── Flying Doves Layer ── */}
        {doves.map((dove) => (
          <div
            key={dove.id}
            className="flying-dove"
            style={{
              left: `${dove.startX}%`,
              top: `${dove.startY}%`,
              "--drift-x": `${dove.drift}vw`,
              "--rot-offset": `${dove.angle}deg`,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_24px_rgba(255,255,255,0.45)]">
              {/* Left Wing */}
              <path 
                className="wing left-wing" 
                d="M 50 45 C 30 15, 15 20, 5 40 C 20 42, 38 43, 50 45 Z" 
                fill="#ffffff" 
              />
              {/* Right Wing */}
              <path 
                className="wing right-wing" 
                d="M 50 45 C 70 15, 85 20, 95 40 C 80 42, 62 43, 50 45 Z" 
                fill="#ffffff" 
              />
              {/* Body */}
              <path 
                className="body" 
                d="M 45 45 C 44 55, 47 68, 50 78 C 53 68, 56 55, 55 45 C 55 38, 53 32, 50 32 C 47 32, 45 38, 45 45 Z" 
                fill="#ffffff" 
              />
              {/* Tail */}
              <path 
                className="tail" 
                d="M 48 74 L 38 88 L 50 85 L 62 88 L 52 74 Z" 
                fill="#f8fafc" 
              />
              {/* Olive Branch in Beak */}
              <path 
                className="beak" 
                d="M 50 32 L 53 28 L 49 29 Z" 
                fill="#fbbf24" 
              />
              <path 
                className="olive-branch" 
                d="M 52 29 Q 58 24 64 26 M 56 27 Q 59 21 61 24 M 60 26 Q 63 20 65 22" 
                stroke="#10b981" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        ))}

        {/* ── Interactive Sombrero Mágico ── */}
        {activeScene === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              launchDove(48, 75);
            }}
            className="absolute z-40 flex flex-col items-center gap-1 group transition-all duration-300 pointer-events-auto"
            style={{
              bottom: "22%",
              left: "48%",
              transform: "translate(-50%, 0)",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(20, 184, 166, 0.4)",
              borderRadius: "20px",
              padding: "10px 16px",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(20, 184, 166, 0.25), inset 0 0 12px rgba(20, 184, 166, 0.1)",
            }}
          >
            <div className="relative text-3xl group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 ease-out">
              🎩
              <span className="absolute -top-1 -right-2 text-sm animate-bounce">✨</span>
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-teal-400 transition-colors">
              Sombrero Mágico
            </span>
            <span className="text-[9px] text-teal-300/80 font-medium">¡Haz clic para liberar la paz!</span>
            <div className="absolute inset-0 rounded-[20px] border border-teal-400 animate-ping opacity-25 pointer-events-none" />
          </button>
        )}

        {/* ── Cinematic overlays ── */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.7) 100%),
              linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 30%)
            `,
          }}
        />

        {/* ── Cinematic letterbox bars ── */}
        <div className="absolute top-0 left-0 right-0 h-[6%] z-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[6%] z-20 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
        />

        {/* ── Film grain overlay ── */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ── Animated text content ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-10 lg:p-14"
          style={{
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <p
            className="text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold mb-2 md:mb-3"
            style={{
              color: "rgba(20,184,166,0.9)",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              animation: textVisible ? "slideInUp 0.6s ease 0.2s both" : "none",
            }}
          >
            {SCENES[activeScene].subtitle}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 md:mb-3"
            style={{
              fontFamily: "'Outfit', 'DM Sans', sans-serif",
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
              lineHeight: 1.05,
              animation: textVisible ? "slideInUp 0.6s ease 0.3s both" : "none",
            }}
          >
            {SCENES[activeScene].title}
          </h2>
          <p
            className="text-sm md:text-base lg:text-lg max-w-xl font-medium"
            style={{
              color: "rgba(255,255,255,0.7)",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              lineHeight: 1.5,
              animation: textVisible ? "slideInUp 0.6s ease 0.4s both" : "none",
            }}
          >
            {SCENES[activeScene].desc}
          </p>
        </div>

        {/* ── Top badge ── */}
        <div
          className="absolute top-4 md:top-6 left-4 md:left-6 z-30 flex items-center gap-2"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            padding: "6px 14px",
            borderRadius: "100px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isPlaying ? "#ef4444" : "#6b7280",
              boxShadow: isPlaying ? "0 0 8px rgba(239,68,68,0.6)" : "none",
              animation: isPlaying ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          />
          <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
            {isPlaying ? "Presentación" : "Pausado"}
          </span>
        </div>

        {/* ── Timer ── */}
        <div
          className="absolute top-4 md:top-6 right-4 md:right-6 z-30"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            padding: "6px 14px",
            borderRadius: "100px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span className="text-[11px] font-bold text-white/60 tracking-wide">
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
            {String(elapsed % 60).padStart(2, "0")} / 00:{String(total).padStart(2, "0")}
          </span>
        </div>

        {/* ── Center controls (when paused or ended) ── */}
        {!isPlaying && hasAutoPlayed.current && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl"
              style={{
                background: "rgba(20,184,166,0.85)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 40px rgba(20,184,166,0.4)",
                border: "2px solid rgba(255,255,255,0.25)",
              }}
            >
              ▶
            </div>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex h-[3px]">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.1)",
                marginRight: i < SCENES.length - 1 ? "2px" : "0",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: i < activeScene ? "100%" : i === activeScene ? `${progress}%` : "0%",
                  background: "linear-gradient(90deg, #14b8a6, #06b6d4)",
                  transition: i === activeScene ? "none" : "width 0.4s ease",
                  boxShadow: "0 0 8px rgba(20,184,166,0.5)",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Scene dots ── */}
        <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-30 flex gap-2">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeScene ? "20px" : "6px",
                height: "6px",
                background: i <= activeScene ? "rgba(20,184,166,0.9)" : "rgba(255,255,255,0.2)",
                boxShadow: i === activeScene ? "0 0 8px rgba(20,184,166,0.5)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══ KEN BURNS & DOVE CSS ANIMATIONS ═══ */}
      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .cinematic-kb {
          animation-timing-function: ease-in-out;
          animation-fill-mode: both;
          will-change: transform;
        }
        .cinematic-kb--zoom-in-left {
          animation-name: kb-zoom-in-left;
        }
        .cinematic-kb--zoom-out-center {
          animation-name: kb-zoom-out-center;
        }
        .cinematic-kb--zoom-in-right {
          animation-name: kb-zoom-in-right;
        }
        .cinematic-kb--zoom-out-up {
          animation-name: kb-zoom-out-up;
        }

        @keyframes kb-zoom-in-left {
          0%   { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, -1%); }
        }
        @keyframes kb-zoom-out-center {
          0%   { transform: scale(1.15); }
          100% { transform: scale(1.0); }
        }
        @keyframes kb-zoom-in-right {
          0%   { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.12) translate(2%, -1.5%); }
        }
        @keyframes kb-zoom-out-up {
          0%   { transform: scale(1.12) translate(0, 2%); }
          100% { transform: scale(1.0) translate(0, -1%); }
        }

        /* ── Flying Dove CSS ── */
        .flying-dove {
          position: absolute;
          pointer-events: none;
          z-index: 100;
          width: 90px;
          height: 90px;
          will-change: transform, opacity;
          animation: dove-flight 4.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .wing {
          transform-origin: 50px 45px;
          will-change: transform;
        }

        .left-wing {
          animation: flap-left 0.22s ease-in-out infinite;
        }

        .right-wing {
          animation: flap-right 0.22s ease-in-out infinite;
        }

        @keyframes flap-left {
          0%, 100% { transform: rotate(0deg) rotateY(0deg); }
          50% { transform: rotate(20deg) rotateY(55deg) scaleY(0.4); }
        }

        @keyframes flap-right {
          0%, 100% { transform: rotate(0deg) rotateY(0deg); }
          50% { transform: rotate(-20deg) rotateY(-55deg) scaleY(0.4); }
        }

        @keyframes dove-flight {
          0% {
            transform: translate(-50%, -50%) scale(0.1) rotate(var(--rot-offset, 0deg));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          45% {
            transform: translate(calc(var(--drift-x, 0px) * 0.45), -28vh) scale(1.6) rotate(calc(var(--rot-offset, 0deg) - 15deg));
          }
          75% {
            transform: translate(calc(var(--drift-x, 0px) * -0.75), -62vh) scale(2.8) rotate(calc(var(--rot-offset, 0deg) + 12deg));
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--drift-x, 0px), -105vh) scale(3.8) rotate(calc(var(--rot-offset, 0deg) - 5deg));
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
