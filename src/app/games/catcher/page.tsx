"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ═══ ATRAPA EL ARTE ═══ */

type Item = {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: "good" | "bad";
  emoji: string;
};

const GOOD_EMOJIS = ["🕊️", "🖌️", "🎭", "🎨", "🌈", "🧩", "🌟"];
const BAD_EMOJIS = ["💣", "🔪", "💥", "🩸", "⚫"];

export default function CatcherPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const containerRef = useRef<HTMLDivElement>(null);
  const basketXRef = useRef(50); // percentage
  const itemsRef = useRef<Item[]>([]);
  const animationIdRef = useRef<number>(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [basketPos, setBasketPos] = useState(50);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const startGame = () => {
    setIsStarted(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    itemsRef.current = [];
    basketXRef.current = 50;
    setBasketPos(50);
    
    // Spawn items
    spawnIntervalRef.current = setInterval(() => {
      const isBad = Math.random() > 0.7; // 30% chance of bad item
      const emojiList = isBad ? BAD_EMOJIS : GOOD_EMOJIS;
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      
      itemsRef.current.push({
        id: Math.random(),
        x: Math.random() * 90 + 5, // 5% to 95%
        y: -10, // Start above screen
        speed: Math.random() * 0.5 + 0.3,
        type: isBad ? "bad" : "good",
        emoji
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isStarted || isGameOver) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // Update items
      for (let i = itemsRef.current.length - 1; i >= 0; i--) {
        const item = itemsRef.current[i];
        // Speed up slightly over time based on score
        item.y += item.speed * (deltaTime * 0.1) * (1 + score / 500);

        // Check collision (Basket is around y=85 to 95)
        // Basket width is roughly 20vw. Basket center is basketXRef.
        if (item.y > 85 && item.y < 95) {
          const dist = Math.abs(item.x - basketXRef.current);
          if (dist < 12) { // Caught!
            if (item.type === "good") {
              setScore(s => s + 10);
            } else {
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) endGame();
                return newLives;
              });
            }
            itemsRef.current.splice(i, 1);
            continue;
          }
        }

        // Missed item
        if (item.y > 110) {
          if (item.type === "good") {
            // Losing points or life for missing good items? Let's just lose 5 points.
            setScore(s => Math.max(0, s - 5));
          }
          itemsRef.current.splice(i, 1);
        }
      }

      // Force render to update item positions on screen
      setRenderTrigger(prev => prev + 1);
      animationIdRef.current = requestAnimationFrame(loop);
    };

    animationIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      clearInterval(spawnIntervalRef.current);
    };
  }, [isStarted, isGameOver, score]);

  const endGame = () => {
    setIsGameOver(true);
    cancelAnimationFrame(animationIdRef.current);
    clearInterval(spawnIntervalRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isStarted || isGameOver || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
    basketXRef.current = percentage;
    setBasketPos(percentage);
  };

  if (!isStarted && !isGameOver) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#faf8f5]">
        <div className="absolute inset-0 bg-mesh-1 opacity-60" />
        
        <div className="max-w-lg w-full text-center relative z-10">
          <h1 className="text-5xl md:text-7xl mb-4 text-slate-900 font-black tracking-tight" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
            ATRAPA EL <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">ARTE</span>
          </h1>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-10">
            <p className="text-lg text-slate-600 leading-relaxed font-bold mb-4">
              Lluvia de creatividad. Mueve tu cesta mágica para atrapar el arte y la paz. 
            </p>
            <div className="flex justify-center gap-6 text-2xl mb-4">
              <span className="animate-bounce">🕊️</span>
              <span className="animate-bounce" style={{animationDelay: '0.2s'}}>🖌️</span>
              <span className="animate-bounce" style={{animationDelay: '0.4s'}}>🎭</span>
            </div>
            <p className="text-sm text-red-500 font-bold uppercase tracking-wider">¡Cuidado con los conflictos (💣🔪)!</p>
          </div>
          <button onClick={startGame} className="btn-primary w-full shadow-orange-500/30 text-2xl py-5 bg-gradient-to-r from-orange-500 to-amber-500 border-none text-white hover:scale-105 transition-transform font-black uppercase tracking-widest">
            ¡Comenzar!
          </button>
        </div>
      </main>
    );
  }

  return (
    <main 
      ref={containerRef}
      className="fixed inset-0 bg-[#faf8f5] touch-none select-none overflow-hidden" 
      onPointerMove={handlePointerMove}
    >
      <div className="absolute inset-0 bg-mesh-1 opacity-30 pointer-events-none" />

      {/* HUD */}
      {!isGameOver && (
        <>
          <div className="absolute top-6 left-6 z-10 flex gap-4 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Puntos</span>
              <span className="text-3xl font-black text-orange-500">{score}</span>
            </div>
          </div>
          
          <div className="absolute top-6 right-6 z-10 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl text-center flex gap-2 shadow-sm">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`text-2xl transition-all duration-300 ${i < lives ? 'opacity-100 scale-100' : 'opacity-20 scale-50 grayscale'}`}>
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Falling Items */}
      {itemsRef.current.map(item => (
        <div 
          key={item.id} 
          className="absolute text-5xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Basket */}
      <div 
        className="absolute bottom-10 transform -translate-x-1/2 z-20 pointer-events-none drop-shadow-2xl transition-transform duration-75"
        style={{ left: `${basketPos}%` }}
      >
        <div className="w-32 h-16 bg-gradient-to-b from-amber-200 to-amber-500 rounded-b-full border-4 border-amber-600 flex items-end justify-center pb-2 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 w-full h-2 bg-amber-700 opacity-50" />
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md anim-fade-in">
          <div className="text-center p-10 bg-white rounded-3xl shadow-2xl max-w-sm mx-4 transform transition-all duration-500 scale-100">
            <h2 className="text-4xl text-slate-900 font-black mb-2 uppercase" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              ¡Juego Terminado!
            </h2>
            <p className="text-slate-500 font-bold mb-6 text-lg">Recogiste mucho arte</p>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 mb-10">
              {score}
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={startGame} className="btn-primary shadow-orange-500/20 bg-orange-500 text-white border-none py-4 font-bold text-lg">
                Jugar de Nuevo
              </button>
              <Link href="/" className="btn-secondary bg-slate-100 border-none text-slate-600 hover:bg-slate-200 py-4 font-bold text-lg">
                Volver al Menú
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
