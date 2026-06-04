"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══ MEMORIA VIVA ═══ */

const SYMBOLS = [
  { id: 1, shape: "🎨", color: "#F97316", bg: "bg-orange-100", text: "text-orange-500" },
  { id: 2, shape: "🖌️", color: "#3B82F6", bg: "bg-blue-100", text: "text-blue-500" },
  { id: 3, shape: "🎵", color: "#10B981", bg: "bg-green-100", text: "text-green-500" },
  { id: 4, shape: "🌟", color: "#EAB308", bg: "bg-yellow-100", text: "text-yellow-500" },
  { id: 5, shape: "🧩", color: "#8B5CF6", bg: "bg-purple-100", text: "text-purple-500" },
  { id: 6, shape: "🕊️", color: "#EF4444", bg: "bg-red-100", text: "text-red-500" },
];

type Card = {
  id: string;
  symbolId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStarted && !isGameOver) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isGameOver]);

  const initGame = () => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .map((s) => ({
        id: Math.random().toString(36).substr(2, 9),
        symbolId: s.id,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setTime(0);
    setIsLocked(false);
    setIsGameOver(false);
  };

  const startGame = () => {
    setHasStarted(true);
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [i1, i2] = newFlipped;
      if (newCards[i1].symbolId === newCards[i2].symbolId) {
        // Match
        newCards[i1].isMatched = true;
        newCards[i2].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);
        
        const newMatches = matches + 1;
        setMatches(newMatches);
        if (newMatches === SYMBOLS.length) {
          setTimeout(() => setIsGameOver(true), 500);
        }
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[i1].isFlipped = false;
          resetCards[i2].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!hasStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-mesh-3">
        <div className="max-w-lg w-full text-center relative z-10">
          <h1 className="text-4xl md:text-5xl mt-8 mb-3 text-slate-900 font-bold" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
            Memoria <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Viva</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-10 max-w-sm mx-auto">
            Encuentra los pares de inspiración. Conecta con los símbolos de paz y creatividad.
          </p>
          <button onClick={startGame} className="btn-primary shadow-blue-500/20">
            Comenzar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-20 flex flex-col items-center relative bg-mesh-3">
      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 text-center md:text-left">
          <div>
            <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Memoria Viva</h1>
            <p className="text-sm text-slate-500 mt-2">Reconstruye patrones de esperanza.</p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tiempo</span>
              <span className="text-lg font-bold text-purple-600">{formatTime(time)}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Movimientos</span>
              <span className="text-lg font-bold text-blue-600">{moves}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pares</span>
              <span className="text-lg font-bold text-green-600">{matches}/{SYMBOLS.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {cards.map((card, index) => {
            const symbol = SYMBOLS.find(s => s.id === card.symbolId)!;
            const isVisible = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl relative transition-all duration-500 transform-style-3d ${
                  isVisible ? 'rotate-y-180' : 'hover:-translate-y-1'
                }`}
                style={{ perspective: "1000px" }}
              >
                <div className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden transition-all duration-500 ${
                  isVisible ? 'rotate-y-180 opacity-0' : 'opacity-100 bg-white border-2 border-slate-200 shadow-sm'
                } flex items-center justify-center`}>
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200" />
                </div>
                
                <div className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${
                  isVisible ? 'rotate-y-0 opacity-100' : '-rotate-y-180 opacity-0'
                } ${card.isMatched ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'}`}>
                  <span className={`text-4xl md:text-5xl ${card.isMatched ? 'animate-bounce' : ''}`}>
                    {symbol.shape}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md anim-fade-in">
          <div className="card-organic p-10 max-w-sm w-full mx-4 text-center border-green-200 shadow-xl">
            <h2 className="text-3xl mb-2 text-slate-900 font-bold" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              ¡Completado!
            </h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Reconstruiste la memoria en {moves} movimientos y {formatTime(time)}.</p>
            
            <button onClick={initGame} className="btn-primary w-full shadow-green-500/20 bg-gradient-to-r from-green-500 to-emerald-500">
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
