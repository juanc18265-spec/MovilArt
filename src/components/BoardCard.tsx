"use client";
import { useState, useEffect, useRef } from "react";

export default function BoardCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) {
      let step = 0;
      const sequence = [0, 2, 1, 3];
      setActivePad(sequence[step]);
      timerRef.current = setInterval(() => {
        step = (step + 1) % sequence.length;
        setActivePad(sequence[step]);
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setActivePad(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered]);

  const pads = [
    { id: 0, color: "#F97316", name: "Tierra" },
    { id: 1, color: "#EAB308", name: "Sol" },
    { id: 2, color: "#3B82F6", name: "Cielo" },
    { id: 3, color: "#10B981", name: "Vida" }
  ];

  return (
    <div
      className="maze-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="maze-card__header">
        <span className="maze-card__badge" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", borderColor: "#BBF7D0" }}>🎵 Mural</span>
        <h3 className="maze-card__title">Mural Comunitario</h3>
        <p className="maze-card__desc">Sigue el ritmo de colores y sonidos para pintar un mural de armonía</p>
      </div>
      <div className="maze-card__canvas flex items-center justify-center p-6 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-3 w-full max-w-[140px]">
          {pads.map((p) => {
            const isActive = activePad === p.id;
            return (
              <div
                key={p.id}
                className="aspect-square rounded-xl border border-slate-200 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: isActive ? p.color : "#FFFFFF",
                  borderColor: isActive ? p.color : "#E2E8F0",
                  boxShadow: isActive ? `0 0 20px ${p.color}50` : "none",
                  transform: isActive ? "scale(0.95)" : "scale(1)"
                }}
              >
                <span
                  className="text-xs font-black uppercase tracking-wider transition-colors duration-200"
                  style={{
                    color: isActive ? "#FFFFFF" : "#64748B"
                  }}
                >
                  {p.name[0]}
                </span>
                {isActive && (
                  <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
