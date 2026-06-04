"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ═══ MURAL COMUNITARIO (Simón) ═══ */

const PADS = [
  { id: 1, freq: 261.6, color: "#F97316", bg: "bg-orange-500", label: "C", desc: "Tierra" },
  { id: 2, freq: 329.6, color: "#EAB308", bg: "bg-yellow-500", label: "E", desc: "Sol" },
  { id: 3, freq: 392.0, color: "#3B82F6", bg: "bg-blue-500", label: "G", desc: "Cielo" },
  { id: 4, freq: 523.2, color: "#10B981", bg: "bg-green-500", label: "C5", desc: "Vida" },
];

function playTone(freq: number, duration: number = 0.5) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio Context blocked or failed");
  }
}

function playErrorTone() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.type = "sawtooth";
    osc.frequency.value = 110;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function SimonPage() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const startRound = (currentSeq: number[]) => {
    const nextPadId = PADS[Math.floor(Math.random() * PADS.length)].id;
    const newSeq = [...currentSeq, nextPadId];
    setSequence(newSeq);
    setUserStep(0);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSeq(true);
    await new Promise(r => setTimeout(r, 800));
    
    for (let i = 0; i < seq.length; i++) {
      const padId = seq[i];
      const pad = PADS.find(p => p.id === padId);
      if (pad) {
        setActivePad(padId);
        playTone(pad.freq, 0.4);
        await new Promise(r => setTimeout(r, 400));
        setActivePad(null);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    setIsPlayingSeq(false);
  };

  const handlePadClick = (padId: number) => {
    if (status !== "playing" || isPlayingSeq) return;

    const pad = PADS.find(p => p.id === padId);
    if (pad) {
      setActivePad(padId);
      playTone(pad.freq, 0.3);
      setTimeout(() => setActivePad(null), 300);
    }

    if (padId === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);
      
      if (nextStep === sequence.length) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);
        setStatus("playing");
        startRound(sequence);
      }
    } else {
      playErrorTone();
      setStatus("gameover");
    }
  };

  const resetGame = () => {
    setSequence([]);
    setScore(0);
    setStatus("playing");
    startRound([]);
  };

  if (status === "idle") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-mesh-2">
        <div className="max-w-lg w-full text-center relative z-10">
          <h1 className="text-4xl md:text-5xl mt-8 mb-3 text-slate-900 font-bold" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
            Mural <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">Comunitario</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-10 max-w-sm mx-auto">
            Sigue la secuencia de colores y sonidos. Cada paso es una pincelada en nuestro mural colaborativo.
          </p>
          <button onClick={resetGame} className="btn-primary">
            Iniciar Secuencia
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-16 flex flex-col items-center relative bg-mesh-2">
      <div className="relative z-10 w-full max-w-xl">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-6 text-sm bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="text-slate-500 font-medium">Racha: <span className="text-blue-600 font-bold">{score}</span></span>
            <span className="text-slate-500 font-medium">Mejor: <span className="text-green-600 font-bold">{highScore}</span></span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="h-10 flex items-center justify-center mb-8">
          {isPlayingSeq ? (
            <span className="text-xs tracking-[0.2em] uppercase text-blue-500 font-bold flex items-center gap-2 anim-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Observa el Patrón
            </span>
          ) : status === "playing" ? (
            <span className="text-xs tracking-[0.2em] uppercase text-slate-900 font-bold anim-fade-in">
              Tu turno de pintar
            </span>
          ) : null}
        </div>

        {/* Pads Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-[400px] mx-auto">
          {PADS.map(pad => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isPlayingSeq || status === "gameover"}
                className={`aspect-square rounded-3xl relative overflow-hidden transition-all duration-200 ${isActive ? pad.bg : 'bg-white'}`}
                style={{
                  border: `2px solid ${isActive ? pad.color : '#E2E8F0'}`,
                  boxShadow: isActive ? `0 0 40px ${pad.color}40, 0 10px 30px rgba(0,0,0,0.1)` : '0 4px 12px rgba(0,0,0,0.02)',
                  transform: isActive ? 'scale(0.96)' : 'scale(1)',
                }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className={`text-3xl font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {pad.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {pad.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over Modal */}
      {status === "gameover" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md anim-fade-in">
          <div className="card-organic p-10 max-w-sm w-full mx-4 text-center border-orange-200 shadow-xl">
            <h2 className="text-3xl mb-2 text-slate-900 font-bold" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              Patrón <span className="text-orange-500">Roto</span>
            </h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Lograste pintar {score} secuencias.</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={resetGame} className="btn-primary w-full shadow-orange-500/20">
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
