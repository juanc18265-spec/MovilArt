"use client";
import { useState, useEffect } from "react";

// Grid with hidden words: PAZ, AMOR, ARTE, UNIÓN, VIDA
const GRID = [
  ["P", "A", "Z", "M", "R", "T"],
  ["U", "N", "I", "Ó", "N", "E"],
  ["A", "R", "T", "E", "S", "L"],
  ["V", "I", "D", "A", "P", "A"],
  ["A", "M", "O", "R", "E", "Z"],
  ["C", "R", "E", "A", "R", "S"],
];

// Words and their cell coordinates
const WORDS: { word: string; cells: [number, number][]; color: string }[] = [
  { word: "PAZ", cells: [[0,0],[0,1],[0,2]], color: "#3B82F6" },
  { word: "UNIÓN", cells: [[1,0],[1,1],[1,2],[1,3],[1,4]], color: "#10B981" },
  { word: "ARTE", cells: [[2,0],[2,1],[2,2],[2,3]], color: "#F97316" },
  { word: "VIDA", cells: [[3,0],[3,1],[3,2],[3,3]], color: "#8B5CF6" },
  { word: "AMOR", cells: [[4,0],[4,1],[4,2],[4,3]], color: "#EF4444" },
  { word: "CREAR", cells: [[5,0],[5,1],[5,2],[5,3],[5,4]], color: "#F59E0B" },
];

export default function WordSearchCard() {
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [foundWords, setFoundWords] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex(prev => {
        const next = (prev + 1) % WORDS.length;
        setFoundWords(f => {
          const n = new Set(f);
          n.add(next);
          if (n.size > 3) {
            // Reset after showing 3
            return new Set([next]);
          }
          return n;
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const getCellState = (row: number, col: number) => {
    for (let wi = 0; wi < WORDS.length; wi++) {
      const w = WORDS[wi];
      for (const [r, c] of w.cells) {
        if (r === row && c === col) {
          if (wi === activeWordIndex) return { active: true, color: w.color, found: false };
          if (foundWords.has(wi)) return { active: false, color: w.color, found: true };
        }
      }
    }
    return { active: false, color: "#CBD5E1", found: false };
  };

  return (
    <div className="wordsearch-card">
      <div className="wordsearch-card__header">
        <span className="wordsearch-card__badge">🔤 Nuevo</span>
        <h3 className="wordsearch-card__title">Sopa de Letras</h3>
        <p className="wordsearch-card__desc">Descubre palabras de valores escondidas entre las letras</p>
      </div>
      <div className="wordsearch-card__canvas">
        <div className="wordsearch-grid">
          {GRID.map((row, ri) => (
            <div key={ri} className="wordsearch-row">
              {row.map((letter, ci) => {
                const state = getCellState(ri, ci);
                return (
                  <span
                    key={`${ri}-${ci}`}
                    className={`wordsearch-cell ${state.active ? "wordsearch-cell--glow" : ""} ${state.found ? "wordsearch-cell--found" : ""}`}
                    style={{
                      color: state.active || state.found ? state.color : "#94A3B8",
                      textShadow: state.active ? `0 0 12px ${state.color}, 0 0 24px ${state.color}40` : "none",
                      borderColor: state.active ? state.color : state.found ? `${state.color}40` : "transparent",
                      backgroundColor: state.active ? `${state.color}15` : state.found ? `${state.color}08` : "transparent",
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="wordsearch-words">
          {WORDS.map((w, i) => (
            <span
              key={i}
              className={`wordsearch-tag ${i === activeWordIndex ? "wordsearch-tag--active" : ""} ${foundWords.has(i) ? "wordsearch-tag--found" : ""}`}
              style={{
                borderColor: i === activeWordIndex ? w.color : foundWords.has(i) ? `${w.color}60` : "#E2E8F0",
                color: i === activeWordIndex || foundWords.has(i) ? w.color : "#94A3B8",
              }}
            >
              {w.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
