"use client";

import React from "react";

interface InteractiveDoveProps {
  mood: "happy" | "neutral" | "sad";
  message?: string;
}

export default function InteractiveDove({ mood, message }: InteractiveDoveProps) {
  // Select styling based on the active mood
  let auraColor = "from-teal-400/20 to-cyan-500/20 border-cyan-400/30";
  let textColor = "text-slate-800";
  let bubbleBorder = "border-slate-900";
  let bubbleBg = "bg-white";
  let defaultMsg = "¡Hola! Estoy aquí para acompañarte en tu aventura artística. 🕊️";

  if (mood === "happy") {
    auraColor = "from-emerald-400/30 via-yellow-300/20 to-teal-400/30 border-emerald-400/40 animate-pulse";
    textColor = "text-emerald-950 font-bold";
    bubbleBg = "bg-emerald-50";
    bubbleBorder = "border-emerald-900";
    defaultMsg = "¡Fabuloso! Tu comprensión artística es admirable. ¡Sigue así! ✨";
  } else if (mood === "sad") {
    auraColor = "from-slate-500/15 via-rose-500/10 to-slate-600/15 border-slate-400/20";
    textColor = "text-rose-950";
    bubbleBg = "bg-rose-50/70";
    bubbleBorder = "border-rose-900";
    defaultMsg = "¡Oh, no! Pero no te preocupes, el error es parte de la creación. ¡Intenta otra vez! 🎨";
  }

  const activeMessage = message || defaultMsg;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 max-w-2xl mx-auto select-none">
      
      {/* Visual Dove Character Container */}
      <div className="relative flex-shrink-0 group">
        
        {/* Glow / Aura Background */}
        <div className={`absolute -inset-4 rounded-full bg-gradient-to-tr blur-md transition-all duration-500 z-0 ${auraColor}`} />
        
        {/* The SVG Dove */}
        <svg
          width="130"
          height="130"
          viewBox="0 0 120 120"
          className="relative z-10 drop-shadow-xl transition-all duration-300 hover:scale-105"
        >
          {/* Defs for gradients & shadow filters */}
          <defs>
            <linearGradient id="doveBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="doveWingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Halo / Aura Ring (Rotating slowly) */}
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke={mood === "happy" ? "#F59E0B" : mood === "sad" ? "#94A3B8" : "#20B8A6"}
            strokeWidth="1.5"
            strokeDasharray="6,4"
            className="animate-spin"
            style={{ animationDuration: "25s", transformOrigin: "60px 60px" }}
            opacity="0.6"
          />

          {/* Olive Branch in Beak (Only when Happy or Neutral) */}
          {mood !== "sad" && (
            <g stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none">
              {/* stem */}
              <path d="M 42,62 C 34,60 26,63 22,68" />
              {/* leaves */}
              <path d="M 22,68 Q 23,62 27,62 Q 26,68 22,68 Z" fill="#34D399" strokeWidth="1" />
              <path d="M 27,64 Q 28,58 33,59 Q 31,65 27,64 Z" fill="#34D399" strokeWidth="1" />
              <path d="M 33,62 Q 36,56 40,58 Q 37,63 33,62 Z" fill="#34D399" strokeWidth="1" />
            </g>
          )}

          {/* Tail Feathers */}
          <path
            d={
              mood === "sad"
                ? "M 75,70 C 85,85 92,90 92,98 C 88,96 82,90 73,78 Z"
                : "M 75,65 C 88,78 98,82 102,88 C 96,86 88,78 78,70 Z"
            }
            fill="url(#doveWingGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Main Dove Body */}
          {/* Head at (50, 45), chest at (45, 65), tail at (75, 65) */}
          <path
            d="M 42,42 
               C 48,28 66,28 72,40 
               C 76,48 78,55 75,65 
               C 70,72 58,74 48,70 
               C 42,67 38,58 42,42 Z"
            fill="url(#doveBodyGrad)"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Left Wing (Back wing) */}
          <path
            d={
              mood === "happy"
                ? "M 66,45 C 75,22 88,18 95,25 C 92,36 82,46 72,55 Z"
                : mood === "sad"
                ? "M 68,48 C 76,46 84,48 88,55 C 84,62 76,64 70,62 Z"
                : "M 68,45 C 82,32 94,36 96,44 C 90,50 80,54 70,55 Z"
            }
            fill="url(#doveWingGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Wing (Foreground wing) */}
          {/* Changes orientation based on mood */}
          <path
            d={
              mood === "happy"
                ? "M 58,50 C 50,24 34,16 26,22 C 30,36 44,48 55,58 Z" // Wings pointing up happily
                : mood === "sad"
                ? "M 58,52 C 50,55 42,62 38,72 C 45,74 52,68 56,62 Z" // Wing drooping sadly
                : "M 58,50 C 46,32 30,28 22,34 C 28,46 44,54 55,56 Z" // Level flight wing
            }
            fill="url(#doveBodyGrad)"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Beak */}
          {mood === "happy" ? (
            // Open smiling beak
            <path
              d="M 44,44 Q 38,44 36,46 Q 39,49 44,48 L 44,44 Q 37,46 36,49 Q 41,50 44,48 Z"
              fill="url(#goldGrad)"
              stroke="#D97706"
              strokeWidth="0.8"
            />
          ) : mood === "sad" ? (
            // Downward curved closed beak
            <path
              d="M 44,45 Q 38,48 37,51 Q 41,49 44,47 Z"
              fill="#D97706"
              stroke="#B45309"
              strokeWidth="0.8"
            />
          ) : (
            // Simple neat triangular beak
            <polygon
              points="44,43 36,46 44,48"
              fill="url(#goldGrad)"
              stroke="#D97706"
              strokeWidth="0.8"
            />
          )}

          {/* Dynamic Eyes */}
          {mood === "happy" ? (
            // Happy happy arches ^ ^
            <g stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 52,41 Q 55,38 58,41" />
            </g>
          ) : mood === "sad" ? (
            // Sad drooping arches and teardrops
            <g>
              <path
                d="M 52,43 Q 55,46 58,43"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Tear drop */}
              <circle cx="53" cy="50" r="2.5" fill="#38BDF8" className="animate-bounce" />
              <circle cx="58" cy="52" r="1.5" fill="#0EA5E9" />
            </g>
          ) : (
            // Bright round curious eyes
            <g>
              <circle cx="55" cy="42" r="3.5" fill="#0F172A" />
              <circle cx="54" cy="40.5" r="1.2" fill="#FFFFFF" /> {/* eye shine */}
            </g>
          )}

          {/* Blushing cheeks */}
          {mood === "happy" && (
            <circle cx="61" cy="46" r="3" fill="#FDA4AF" opacity="0.6" />
          )}
        </svg>

        {/* Small floating sparkles around happy dove */}
        {mood === "happy" && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-2 left-4 text-xs animate-bounce text-yellow-400">✨</span>
            <span className="absolute bottom-2 right-4 text-xs animate-ping text-amber-400" style={{ animationDuration: "2s" }}>★</span>
            <span className="absolute top-1/2 -right-2 text-[10px] animate-pulse text-emerald-400">✧</span>
          </div>
        )}
      </div>

      {/* Speech Bubble Container */}
      <div className="relative flex-1 w-full sm:w-auto">
        <div
          className={`border-3 ${bubbleBorder} ${bubbleBg} p-5 rounded-2xl shadow-[4px_4px_0_rgba(15,23,42,1)] relative transition-all duration-300`}
        >
          {/* Speech bubble triangle tail (left facing on sm/md, top facing on xs mobile) */}
          <div className={`absolute w-4 h-4 rotate-45 border-slate-900 border-l-3 border-b-3 ${bubbleBg} z-10
            hidden sm:block left-[-9px] top-1/2 -translate-y-1/2 border-t-0 border-r-0
          `} />
          <div className={`absolute w-4 h-4 rotate-45 border-slate-900 border-t-3 border-l-3 ${bubbleBg} z-10
            block sm:hidden top-[-9px] left-1/2 -translate-x-1/2 border-b-0 border-r-0
          `} />

          {/* Speech bubble content */}
          <p className={`text-xs sm:text-sm font-bold leading-relaxed ${textColor}`}>
            {activeMessage}
          </p>
        </div>
      </div>

    </div>
  );
}
