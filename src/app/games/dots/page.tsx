"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ClueData {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
  number: number;
}

const PUZZLES: ClueData[][] = [
  // Puzzle 1
  [
    { answer: "PAZ", clue: "Lo opuesto a la guerra", row: 0, col: 0, direction: "across", number: 1 },
    { answer: "PINTURA", clue: "Arte con pinceles y colores", row: 0, col: 0, direction: "down", number: 1 },
    { answer: "AMOR", clue: "Sentimiento que une a las personas", row: 2, col: 0, direction: "across", number: 2 },
    { answer: "ARTE", clue: "Expresión creativa del ser humano", row: 0, col: 2, direction: "down", number: 3 },
    { answer: "ZONA", clue: "Área o región delimitada", row: 4, col: 0, direction: "across", number: 4 },
    { answer: "LIENZO", clue: "Tela donde se pinta un cuadro", row: 1, col: 4, direction: "down", number: 5 },
    { answer: "RITMO", clue: "Patrón de sonidos en la música", row: 2, col: 4, direction: "across", number: 6 },
    { answer: "DANZA", clue: "Arte del movimiento corporal", row: 6, col: 0, direction: "across", number: 7 },
  ],
  // Puzzle 2
  [
    { answer: "CREAR", clue: "Hacer algo nuevo con imaginación", row: 0, col: 0, direction: "across", number: 1 },
    { answer: "COLOR", clue: "Rojo, azul, verde son ejemplos de...", row: 0, col: 0, direction: "down", number: 1 },
    { answer: "EMPATIA", clue: "Ponerse en los zapatos del otro", row: 2, col: 0, direction: "across", number: 2 },
    { answer: "RESPETO", clue: "Valorar la dignidad de los demás", row: 0, col: 2, direction: "down", number: 3 },
    { answer: "MUSICA", clue: "Arte de combinar sonidos", row: 4, col: 1, direction: "across", number: 4 },
    { answer: "UNION", clue: "Juntar fuerzas para un mismo fin", row: 1, col: 5, direction: "down", number: 5 },
    { answer: "PERDON", clue: "Liberar el resentimiento", row: 6, col: 0, direction: "across", number: 6 },
  ],
];

function buildGrid(puzzle: ClueData[]): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: 10 }, () => Array(10).fill(null));
  for (const clue of puzzle) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "down" ? clue.row + i : clue.row;
      const c = clue.direction === "across" ? clue.col + i : clue.col;
      if (r < 10 && c < 10) grid[r][c] = clue.answer[i];
    }
  }
  return grid;
}

function getNumbers(puzzle: ClueData[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const clue of puzzle) {
    const key = `${clue.row}-${clue.col}`;
    if (!map.has(key)) map.set(key, clue.number);
  }
  return map;
}

export default function CrosswordGame() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];
  const solution = buildGrid(puzzle);
  const numbers = getNumbers(puzzle);

  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [selectedClue, setSelectedClue] = useState<ClueData | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [complete, setComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hints, setHints] = useState(3);
  const [showError, setShowError] = useState<[number, number] | null>(null);

  // Init grid
  useEffect(() => {
    const g = Array.from({ length: 10 }, () => Array(10).fill(""));
    setUserGrid(g);
    setSolved(new Set());
    setComplete(false);
    setTimer(0);
    setHints(3);
  }, [puzzleIndex]);

  // Timer
  useEffect(() => {
    if (complete) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [complete, puzzleIndex]);

  const handleCellClick = (r: number, c: number) => {
    if (solution[r][c] === null) return;
    setSelectedCell([r, c]);
    // Find clue for this cell
    const clue = puzzle.find(cl => {
      for (let i = 0; i < cl.answer.length; i++) {
        const cr = cl.direction === "down" ? cl.row + i : cl.row;
        const cc = cl.direction === "across" ? cl.col + i : cl.col;
        if (cr === r && cc === c) return true;
      }
      return false;
    });
    if (clue) setSelectedClue(clue);
  };

  const handleInput = useCallback((letter: string) => {
    if (!selectedCell || complete) return;
    const [r, c] = selectedCell;
    if (solution[r][c] === null) return;

    const char = letter.toUpperCase().replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U");
    if (!/^[A-ZÑ]$/.test(char)) return;

    setUserGrid(prev => {
      const ng = prev.map(row => [...row]);
      ng[r][c] = char;
      return ng;
    });

    // Check if correct
    if (char !== solution[r][c]) {
      setShowError([r, c]);
      setTimeout(() => setShowError(null), 600);
    }

    // Auto-advance to next cell in same clue
    if (selectedClue) {
      const idx = selectedClue.direction === "across" ? c - selectedClue.col : r - selectedClue.row;
      if (idx < selectedClue.answer.length - 1) {
        const nr = selectedClue.direction === "down" ? r + 1 : r;
        const nc = selectedClue.direction === "across" ? c + 1 : c;
        if (nr < 10 && nc < 10 && solution[nr][nc] !== null) {
          setSelectedCell([nr, nc]);
        }
      }
    }

    // Check solved clues
    setTimeout(() => {
      setUserGrid(current => {
        const newSolved = new Set<number>();
        for (const cl of puzzle) {
          let allCorrect = true;
          for (let i = 0; i < cl.answer.length; i++) {
            const cr = cl.direction === "down" ? cl.row + i : cl.row;
            const cc = cl.direction === "across" ? cl.col + i : cl.col;
            if (cr >= 10 || cc >= 10 || current[cr][cc] !== cl.answer[i]) {
              allCorrect = false;
              break;
            }
          }
          if (allCorrect) newSolved.add(cl.number);
        }
        setSolved(newSolved);
        if (newSolved.size === puzzle.length) setComplete(true);
        return current;
      });
    }, 100);
  }, [selectedCell, selectedClue, solution, puzzle, complete]);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (selectedCell) {
          const [r, c] = selectedCell;
          setUserGrid(prev => {
            const ng = prev.map(row => [...row]);
            ng[r][c] = "";
            return ng;
          });
        }
        return;
      }
      if (e.key.length === 1) handleInput(e.key);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleInput, selectedCell]);

  const useHint = () => {
    if (hints <= 0 || !selectedCell || complete) return;
    const [r, c] = selectedCell;
    const letter = solution[r][c];
    if (!letter) return;
    setUserGrid(prev => {
      const ng = prev.map(row => [...row]);
      ng[r][c] = letter;
      return ng;
    });
    setHints(h => h - 1);
  };

  const isHighlighted = (r: number, c: number) => {
    if (!selectedClue) return false;
    for (let i = 0; i < selectedClue.answer.length; i++) {
      const cr = selectedClue.direction === "down" ? selectedClue.row + i : selectedClue.row;
      const cc = selectedClue.direction === "across" ? selectedClue.col + i : selectedClue.col;
      if (cr === r && cc === c) return true;
    }
    return false;
  };

  const isCorrectCell = (r: number, c: number) => {
    return userGrid[r]?.[c] && userGrid[r][c] === solution[r][c];
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const acrossClues = puzzle.filter(c => c.direction === "across").sort((a, b) => a.number - b.number);
  const downClues = puzzle.filter(c => c.direction === "down").sort((a, b) => a.number - b.number);

  const KEYBOARD_ROWS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L","Ñ"],
    ["Z","X","C","V","B","N","M","⌫"],
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-semibold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Volver
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
              <span className="text-teal-700 font-bold text-xs">⏱ {fmt(timer)}</span>
            </div>
            <button onClick={useHint} disabled={hints <= 0} className="bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 disabled:opacity-40">
              <span className="text-amber-700 font-bold text-xs">💡 {hints}</span>
            </button>
            <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              <span className="text-blue-700 font-bold text-xs">📝 {puzzleIndex + 1}/{PUZZLES.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: "'Outfit',sans-serif" }}>
            ✏️ Crucigrama de la Paz
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {complete ? "¡Crucigrama completado!" : "Toca una celda y escribe la letra correcta"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Grid */}
          <div className="flex justify-center">
            <div className="inline-grid gap-[2px] bg-slate-200 p-[2px] rounded-xl" style={{ gridTemplateColumns: `repeat(10, 1fr)` }}>
              {solution.map((row, ri) =>
                row.map((cell, ci) => {
                  const num = numbers.get(`${ri}-${ci}`);
                  const selected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
                  const highlighted = isHighlighted(ri, ci);
                  const correct = isCorrectCell(ri, ci);
                  const isError = showError?.[0] === ri && showError?.[1] === ci;
                  const isSolved = puzzle.some(cl => solved.has(cl.number) && (() => {
                    for (let i = 0; i < cl.answer.length; i++) {
                      const cr = cl.direction === "down" ? cl.row + i : cl.row;
                      const cc = cl.direction === "across" ? cl.col + i : cl.col;
                      if (cr === ri && cc === ci) return true;
                    }
                    return false;
                  })());

                  return (
                    <div
                      key={`${ri}-${ci}`}
                      onClick={() => handleCellClick(ri, ci)}
                      className={`relative flex items-center justify-center font-bold text-lg transition-all duration-150
                        ${cell === null ? "bg-slate-800" : "cursor-pointer"}
                        ${selected ? "bg-teal-200 ring-2 ring-teal-500" : highlighted ? "bg-teal-50" : cell !== null ? "bg-white" : ""}
                        ${isError ? "bg-red-200 animate-pulse" : ""}
                        ${isSolved ? "bg-green-50" : ""}
                      `}
                      style={{ width: 38, height: 38 }}
                    >
                      {num && (
                        <span className="absolute top-0.5 left-1 text-[9px] font-bold text-slate-400">{num}</span>
                      )}
                      {cell !== null && (
                        <span style={{ color: correct ? (isSolved ? "#059669" : "#0F172A") : "#EF4444" }}>
                          {userGrid[ri]?.[ci] || ""}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clues */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-teal-700 text-sm mb-2 uppercase tracking-wider">→ Horizontales</h3>
                {acrossClues.map(cl => (
                  <button
                    key={`a-${cl.number}`}
                    onClick={() => { setSelectedClue(cl); setSelectedCell([cl.row, cl.col]); }}
                    className={`block w-full text-left p-2 rounded-lg mb-1 text-sm transition-all ${solved.has(cl.number) ? "bg-green-50 text-green-700 line-through opacity-60" : selectedClue === cl ? "bg-teal-50 text-teal-800 border border-teal-200" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="font-bold mr-2">{cl.number}.</span>
                    {cl.clue}
                  </button>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-teal-700 text-sm mb-2 uppercase tracking-wider">↓ Verticales</h3>
                {downClues.map(cl => (
                  <button
                    key={`d-${cl.number}`}
                    onClick={() => { setSelectedClue(cl); setSelectedCell([cl.row, cl.col]); }}
                    className={`block w-full text-left p-2 rounded-lg mb-1 text-sm transition-all ${solved.has(cl.number) ? "bg-green-50 text-green-700 line-through opacity-60" : selectedClue === cl ? "bg-teal-50 text-teal-800 border border-teal-200" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="font-bold mr-2">{cl.number}.</span>
                    {cl.clue}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* On-screen keyboard */}
        <div className="mt-6 flex flex-col items-center gap-1">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map(key => (
                <button
                  key={key}
                  onClick={() => key === "⌫" ? (() => {
                    if (selectedCell) {
                      const [r, c] = selectedCell;
                      setUserGrid(prev => { const ng = prev.map(row => [...row]); ng[r][c] = ""; return ng; });
                    }
                  })() : handleInput(key)}
                  className="bg-slate-100 hover:bg-teal-100 active:bg-teal-200 rounded-lg font-bold text-slate-700 transition-all border border-slate-200"
                  style={{ width: key === "⌫" ? 52 : 34, height: 40, fontSize: 14 }}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {complete && (
          <div className="text-center mt-8 anim-fade-up">
            <div className="inline-block bg-teal-50 rounded-2xl p-6 border border-teal-200">
              <p className="text-2xl font-bold text-teal-700 mb-2">🎉 ¡Crucigrama Resuelto!</p>
              <p className="text-teal-600 mb-4">Tiempo: {fmt(timer)} • Pistas usadas: {3 - hints}</p>
              {puzzleIndex < PUZZLES.length - 1 ? (
                <button onClick={() => setPuzzleIndex(i => i + 1)} className="btn-primary bg-gradient-to-r from-teal-500 to-cyan-500">
                  Siguiente Crucigrama →
                </button>
              ) : (
                <div>
                  <p className="text-teal-500 mb-4">¡Completaste todos los crucigramas!</p>
                  <button onClick={() => setPuzzleIndex(0)} className="btn-primary bg-gradient-to-r from-teal-500 to-cyan-500">
                    Jugar de Nuevo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
