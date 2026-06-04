"use client";
import { useState, useEffect, useRef } from "react";

const PATH_POINTS = [
  { x: 10, y: 180 }, { x: 30, y: 160 }, { x: 60, y: 170 }, { x: 80, y: 140 },
  { x: 100, y: 150 }, { x: 120, y: 120 }, { x: 140, y: 130 }, { x: 150, y: 100 },
  { x: 130, y: 80 }, { x: 110, y: 70 }, { x: 90, y: 60 }, { x: 70, y: 50 },
  { x: 50, y: 40 }, { x: 70, y: 25 }, { x: 100, y: 20 }, { x: 130, y: 30 },
  { x: 160, y: 40 }, { x: 180, y: 20 },
];

const PATH_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4",
];

export default function MazeCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [charPos, setCharPos] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) {
      setCharPos(0);
      animRef.current = setInterval(() => {
        setCharPos(prev => {
          if (prev >= PATH_POINTS.length - 1) {
            if (animRef.current) clearInterval(animRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      setCharPos(0);
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isHovered]);

  const pathD = PATH_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const currentPoint = PATH_POINTS[charPos];

  return (
    <div
      className="maze-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="maze-card__header">
        <span className="maze-card__badge">🌿 Nuevo</span>
        <h3 className="maze-card__title">Laberinto de Paz</h3>
        <p className="maze-card__desc">Guía al caminante por senderos de armonía y color</p>
      </div>
      <div className="maze-card__canvas">
        <svg viewBox="0 0 200 200" className="maze-card__svg">
          {/* Background grid pattern */}
          <defs>
            <pattern id="maze-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#E2E8F0" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#maze-grid)" />

          {/* Colored path segments */}
          {PATH_POINTS.slice(0, -1).map((p, i) => {
            const next = PATH_POINTS[i + 1];
            const isTraversed = i < charPos;
            return (
              <line
                key={i}
                x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                stroke={isTraversed ? PATH_COLORS[i % PATH_COLORS.length] : "#E2E8F0"}
                strokeWidth={isTraversed ? 4 : 2}
                strokeLinecap="round"
                style={{ transition: "all 0.3s ease" }}
              />
            );
          })}

          {/* Path nodes */}
          {PATH_POINTS.map((p, i) => (
            <circle
              key={i}
              cx={p.x} cy={p.y} r={i <= charPos ? 4 : 2.5}
              fill={i <= charPos ? PATH_COLORS[i % PATH_COLORS.length] : "#CBD5E1"}
              style={{ transition: "all 0.3s ease" }}
            />
          ))}

          {/* Character */}
          <g style={{ transition: "transform 0.15s ease", transform: `translate(${currentPoint.x}px, ${currentPoint.y}px)` }}>
            <circle r="8" fill="#3B82F6" opacity="0.2" className="maze-char-glow" />
            <circle r="5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="-1.5" cy="-1" r="0.8" fill="#3B82F6" />
            <circle cx="1.5" cy="-1" r="0.8" fill="#3B82F6" />
            {/* Smile */}
            <path d="M -1.5 1 Q 0 3 1.5 1" stroke="#3B82F6" strokeWidth="0.6" fill="none" />
          </g>

          {/* Flag at the end */}
          <g transform={`translate(${PATH_POINTS[PATH_POINTS.length - 1].x}, ${PATH_POINTS[PATH_POINTS.length - 1].y - 12})`}>
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#10B981" strokeWidth="1.5" />
            <polygon points="0,-12 10,-9 0,-6" fill="#10B981" opacity={charPos >= PATH_POINTS.length - 1 ? 1 : 0.3}>
              {charPos >= PATH_POINTS.length - 1 && (
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
              )}
            </polygon>
          </g>
        </svg>
      </div>
    </div>
  );
}
