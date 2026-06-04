"use client";
import { useState, useEffect, useRef } from "react";

export default function MemoryCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) {
      let count = 0;
      setFlippedIdx(0);
      timerRef.current = setInterval(() => {
        count = (count + 1) % 4;
        setFlippedIdx(count);
      }, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setFlippedIdx(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered]);

  const cardsData = [
    { emoji: "🎨", color: "#F97316" },
    { emoji: "🕊️", color: "#EF4444" },
    { emoji: "🎵", color: "#10B981" },
    { emoji: "🌟", color: "#EAB308" }
  ];

  return (
    <div
      className="maze-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="maze-card__header">
        <span className="maze-card__badge" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>🧩 Memoria</span>
        <h3 className="maze-card__title">Memoria Viva</h3>
        <p className="maze-card__desc">Encuentra los pares de inspiración y conecta con símbolos de paz</p>
      </div>
      <div className="maze-card__canvas flex items-center justify-center p-6 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-3 w-full max-w-[150px]">
          {cardsData.map((c, i) => {
            const isFlipped = flippedIdx === i;
            return (
              <div
                key={i}
                className="aspect-square rounded-xl relative transition-all duration-500 transform-style-3d cursor-pointer"
                style={{
                  perspective: "600px",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* Back of Card */}
                <div className={`absolute inset-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center transition-all duration-300 backface-hidden ${isFlipped ? "opacity-0" : "opacity-100"}`}>
                  <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px]">✨</div>
                </div>
                {/* Front of Card */}
                <div
                  className="absolute inset-0 rounded-xl border-2 flex items-center justify-center transition-all duration-300 backface-hidden rotate-y-180"
                  style={{
                    borderColor: `${c.color}30`,
                    backgroundColor: `${c.color}08`,
                    color: c.color
                  }}
                >
                  <span className="text-xl">{c.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
