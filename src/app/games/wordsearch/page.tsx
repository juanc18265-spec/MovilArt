"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const GRID_SIZE = 10;
const WORDS_LIST = [
  { word: "PAZ", color: "#3B82F6" },
  { word: "AMOR", color: "#EF4444" },
  { word: "ARTE", color: "#F97316" },
  { word: "UNION", color: "#10B981" },
  { word: "VIDA", color: "#8B5CF6" },
  { word: "CREAR", color: "#F59E0B" },
  { word: "RESPETO", color: "#EC4899" },
  { word: "EMPATIA", color: "#06B6D4" },
];

type Dir = [number, number];
const DIRS: Dir[] = [[0,1],[1,0],[1,1],[0,-1],[-1,0]];

function placeWord(grid: string[][], word: string): [number,number][]|null {
  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = DIRS[Math.floor(Math.random()*DIRS.length)];
    const r = Math.floor(Math.random()*GRID_SIZE);
    const c = Math.floor(Math.random()*GRID_SIZE);
    const cells: [number,number][] = [];
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const nr = r+dir[0]*i, nc = c+dir[1]*i;
      if (nr<0||nr>=GRID_SIZE||nc<0||nc>=GRID_SIZE) { ok=false; break; }
      if (grid[nr][nc]!==""&&grid[nr][nc]!==word[i]) { ok=false; break; }
      cells.push([nr,nc]);
    }
    if (ok) {
      cells.forEach(([cr,cc],i)=>{ grid[cr][cc]=word[i]; });
      return cells;
    }
  }
  return null;
}

function generateGrid() {
  const grid: string[][] = Array.from({length:GRID_SIZE},()=>Array(GRID_SIZE).fill(""));
  const placed: {word:string;cells:[number,number][];color:string}[] = [];
  for (const w of WORDS_LIST) {
    const cells = placeWord(grid, w.word);
    if (cells) placed.push({word:w.word,cells,color:w.color});
  }
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r=0;r<GRID_SIZE;r++) for(let c=0;c<GRID_SIZE;c++) if(!grid[r][c]) grid[r][c]=letters[Math.floor(Math.random()*26)];
  return {grid,placed};
}

export default function WordSearchGame() {
  const [{grid,placed},setData] = useState<{grid:string[][],placed:{word:string;cells:[number,number][];color:string}[]}>({grid:[],placed:[]});
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState<[number,number][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(()=>{setData(generateGrid());},[]);
  useEffect(()=>{
    if(gameOver||!placed.length) return;
    const id=setInterval(()=>setTimer(t=>t+1),1000);
    return()=>clearInterval(id);
  },[gameOver,placed.length]);

  const getCellInfo = useCallback((r:number,c:number)=>{
    for(const p of placed) {
      if(p.cells.some(([pr,pc])=>pr===r&&pc===c)) {
        return {wordData:p,isFound:found.has(p.word)};
      }
    }
    return null;
  },[placed,found]);

  const isInSelection = (r:number,c:number) => selecting.some(([sr,sc])=>sr===r&&sc===c);

  const handleCellDown = (r:number,c:number) => { setIsSelecting(true); setSelecting([[r,c]]); };
  const handleCellEnter = (r:number,c:number) => { if(isSelecting) setSelecting(s=>[...s,[r,c]]); };
  const handleCellUp = () => {
    setIsSelecting(false);
    // Check if selection matches a word
    for(const p of placed) {
      if(found.has(p.word)) continue;
      if(p.cells.length===selecting.length && p.cells.every(([pr,pc],i)=>selecting[i]&&selecting[i][0]===pr&&selecting[i][1]===pc)) {
        setFound(f=>{const n=new Set(f);n.add(p.word);return n;});
        setScore(s=>s+p.word.length*15);
        if(found.size+1===placed.length) setGameOver(true);
        break;
      }
    }
    setSelecting([]);
  };

  const reset = () => { setData(generateGrid()); setFound(new Set()); setScore(0); setTimer(0); setGameOver(false); };
  const fmt = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  if(!grid.length) return null;

  return (
    <div className="min-h-screen bg-white" onMouseUp={handleCellUp} onTouchEnd={handleCellUp}>
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-semibold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 px-4 py-2 rounded-full border border-amber-200"><span className="text-amber-700 font-bold text-sm">⭐ {score}</span></div>
            <div className="bg-green-50 px-4 py-2 rounded-full border border-green-200"><span className="text-green-700 font-bold text-sm">⏱ {fmt(timer)}</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2" style={{fontFamily:"'Outfit',sans-serif"}}>🔤 Sopa de Letras</h1>
          <p className="text-slate-500 font-medium">{gameOver?"¡Todas las palabras encontradas!":"Arrastra para seleccionar palabras de valores"}</p>
        </div>

        {/* Word list */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {placed.map(p=>(
            <span key={p.word} className="px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all" style={{
              borderColor: found.has(p.word)?p.color:"#E2E8F0",
              color: found.has(p.word)?p.color:"#94A3B8",
              backgroundColor: found.has(p.word)?`${p.color}10`:"transparent",
              textDecoration: found.has(p.word)?"line-through":"none",
            }}>{p.word}</span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex justify-center">
          <div className="inline-grid gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 select-none" style={{gridTemplateColumns:`repeat(${GRID_SIZE},1fr)`}}>
            {grid.map((row,ri)=>row.map((letter,ci)=>{
              const info = getCellInfo(ri,ci);
              const inSel = isInSelection(ri,ci);
              const isFound = info?.isFound;
              const color = info?.wordData.color||"#94A3B8";
              return (
                <div key={`${ri}-${ci}`}
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg font-bold text-sm sm:text-base cursor-pointer transition-all duration-200 select-none"
                  style={{
                    backgroundColor: inSel?"#3B82F620":isFound?`${color}15`:"white",
                    color: isFound?color:inSel?"#3B82F6":"#475569",
                    border: inSel?`2px solid #3B82F6`:isFound?`2px solid ${color}40`:"2px solid #F1F5F9",
                    textShadow: isFound?`0 0 8px ${color}40`:"none",
                    transform: inSel?"scale(1.1)":"scale(1)",
                  }}
                  onMouseDown={()=>handleCellDown(ri,ci)}
                  onMouseEnter={()=>handleCellEnter(ri,ci)}
                  onTouchStart={()=>handleCellDown(ri,ci)}
                  onTouchMove={(e)=>{
                    const touch = e.touches[0];
                    const el = document.elementFromPoint(touch.clientX,touch.clientY);
                    if(el) {
                      const r = el.getAttribute("data-r");
                      const c = el.getAttribute("data-c");
                      if(r&&c) handleCellEnter(parseInt(r),parseInt(c));
                    }
                  }}
                  data-r={ri} data-c={ci}
                >{letter}</div>
              );
            }))}
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-4">{found.size}/{placed.length} palabras encontradas</p>

        {gameOver&&(
          <div className="text-center mt-8 anim-fade-up">
            <div className="inline-block bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <p className="text-2xl font-bold text-amber-700 mb-2">🎉 ¡Excelente!</p>
              <p className="text-amber-600 mb-1">Puntuación: {score} • Tiempo: {fmt(timer)}</p>
              <button onClick={reset} className="btn-primary bg-gradient-to-r from-amber-500 to-orange-500 mt-4">Nueva Sopa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
