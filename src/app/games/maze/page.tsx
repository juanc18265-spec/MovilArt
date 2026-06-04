"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Cell {
  x: number; y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
}

const COLS = 12, ROWS = 10, CELL_SIZE = 44;
const COLORS = ["#EF4444","#F97316","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899"];

function genMaze(): Cell[][] {
  const g: Cell[][] = [];
  for (let y = 0; y < ROWS; y++) { g[y] = []; for (let x = 0; x < COLS; x++) g[y][x] = { x, y, walls: { top:true, right:true, bottom:true, left:true }, visited: false }; }
  const stk: Cell[] = []; g[0][0].visited = true; stk.push(g[0][0]);
  while (stk.length) {
    const c = stk[stk.length-1]; const nb: Cell[] = [];
    if (c.y>0&&!g[c.y-1][c.x].visited) nb.push(g[c.y-1][c.x]);
    if (c.x<COLS-1&&!g[c.y][c.x+1].visited) nb.push(g[c.y][c.x+1]);
    if (c.y<ROWS-1&&!g[c.y+1][c.x].visited) nb.push(g[c.y+1][c.x]);
    if (c.x>0&&!g[c.y][c.x-1].visited) nb.push(g[c.y][c.x-1]);
    if (nb.length) {
      const n = nb[Math.floor(Math.random()*nb.length)];
      if (n.x===c.x+1){c.walls.right=false;n.walls.left=false;}
      if (n.x===c.x-1){c.walls.left=false;n.walls.right=false;}
      if (n.y===c.y+1){c.walls.bottom=false;n.walls.top=false;}
      if (n.y===c.y-1){c.walls.top=false;n.walls.bottom=false;}
      n.visited=true; stk.push(n);
    } else stk.pop();
  }
  return g;
}

export default function MazeGame() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [pos, setPos] = useState({x:0,y:0});
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [trail, setTrail] = useState<{x:number;y:number}[]>([{x:0,y:0}]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const goal = {x:COLS-1,y:ROWS-1};

  useEffect(() => {
    setMaze(genMaze());
    timerRef.current = setInterval(()=>setTimer(t=>t+1),1000);
    return ()=>{if(timerRef.current)clearInterval(timerRef.current);};
  }, []);

  const move = useCallback((dx:number,dy:number)=>{
    if(won||!maze.length) return;
    const nx=pos.x+dx, ny=pos.y+dy;
    if(nx<0||nx>=COLS||ny<0||ny>=ROWS) return;
    const c=maze[pos.y][pos.x];
    if(dx===1&&c.walls.right) return; if(dx===-1&&c.walls.left) return;
    if(dy===1&&c.walls.bottom) return; if(dy===-1&&c.walls.top) return;
    setPos({x:nx,y:ny}); setMoves(m=>m+1); setTrail(t=>[...t,{x:nx,y:ny}]);
    if(nx===goal.x&&ny===goal.y){setWon(true);if(timerRef.current)clearInterval(timerRef.current);}
  },[pos,maze,won,goal.x,goal.y]);

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      switch(e.key){case"ArrowUp":case"w":move(0,-1);break;case"ArrowDown":case"s":move(0,1);break;case"ArrowLeft":case"a":move(-1,0);break;case"ArrowRight":case"d":move(1,0);break;}
    };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[move]);

  const reset=()=>{setMaze(genMaze());setPos({x:0,y:0});setMoves(0);setWon(false);setTrail([{x:0,y:0}]);setTimer(0);if(timerRef.current)clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);};
  const fmt=(s:number)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-semibold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-green-50 px-4 py-2 rounded-full border border-green-200"><span className="text-green-700 font-bold text-sm">⏱ {fmt(timer)}</span></div>
            <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200"><span className="text-blue-700 font-bold text-sm">👣 {moves}</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2" style={{fontFamily:"'Outfit',sans-serif"}}>🌿 Laberinto de Paz</h1>
          <p className="text-slate-500 font-medium">{won?"¡Encontraste el camino!":"Usa flechas o botones para llegar a la meta 🏁"}</p>
        </div>

        <div className="flex justify-center overflow-x-auto pb-4">
          <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200" style={{width:COLS*CELL_SIZE+32,height:ROWS*CELL_SIZE+32}}>
            <div className="relative" style={{width:COLS*CELL_SIZE,height:ROWS*CELL_SIZE}}>
              {maze.map((row,y)=>row.map((cell,x)=>(
                <div key={`${x}-${y}`} className="absolute" style={{
                  left:x*CELL_SIZE,top:y*CELL_SIZE,width:CELL_SIZE,height:CELL_SIZE,
                  borderTop:cell.walls.top?"2px solid #CBD5E1":"2px solid transparent",
                  borderRight:cell.walls.right?"2px solid #CBD5E1":"2px solid transparent",
                  borderBottom:cell.walls.bottom?"2px solid #CBD5E1":"2px solid transparent",
                  borderLeft:cell.walls.left?"2px solid #CBD5E1":"2px solid transparent",
                  backgroundColor:trail.some(t=>t.x===x&&t.y===y)?`${COLORS[(x+y)%COLORS.length]}15`:"transparent",
                }}/>
              )))}
              {trail.map((t,i)=><div key={`t${i}`} className="absolute rounded-full" style={{left:t.x*CELL_SIZE+CELL_SIZE/2-4,top:t.y*CELL_SIZE+CELL_SIZE/2-4,width:8,height:8,backgroundColor:COLORS[i%COLORS.length],opacity:0.4}}/>)}
              <div className="absolute flex items-center justify-center text-2xl" style={{left:goal.x*CELL_SIZE,top:goal.y*CELL_SIZE,width:CELL_SIZE,height:CELL_SIZE}}><span className="animate-pulse">🏁</span></div>
              <div className="absolute flex items-center justify-center transition-all duration-150" style={{left:pos.x*CELL_SIZE+4,top:pos.y*CELL_SIZE+4,width:CELL_SIZE-8,height:CELL_SIZE-8,backgroundColor:"#3B82F6",borderRadius:"50%",boxShadow:"0 0 15px rgba(59,130,246,0.4)",zIndex:10}}>
                <span className="text-white text-lg">☮</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 md:hidden">
          <div className="grid grid-cols-3 gap-2 w-40">
            <div/><button onClick={()=>move(0,-1)} className="bg-slate-100 rounded-xl p-3 active:bg-slate-200 font-bold text-slate-600">↑</button><div/>
            <button onClick={()=>move(-1,0)} className="bg-slate-100 rounded-xl p-3 active:bg-slate-200 font-bold text-slate-600">←</button>
            <button onClick={()=>move(0,1)} className="bg-slate-100 rounded-xl p-3 active:bg-slate-200 font-bold text-slate-600">↓</button>
            <button onClick={()=>move(1,0)} className="bg-slate-100 rounded-xl p-3 active:bg-slate-200 font-bold text-slate-600">→</button>
          </div>
        </div>

        {won&&(
          <div className="text-center mt-8 anim-fade-up">
            <div className="inline-block bg-green-50 rounded-2xl p-6 border border-green-200">
              <p className="text-2xl font-bold text-green-700 mb-2">🕊️ ¡Paz Alcanzada!</p>
              <p className="text-green-600 mb-1">Tiempo: {fmt(timer)} • Pasos: {moves}</p>
              <p className="text-green-500 text-sm mb-4">El camino hacia la paz requiere paciencia.</p>
              <button onClick={reset} className="btn-primary bg-gradient-to-r from-green-500 to-emerald-500">Nuevo Laberinto</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
