"use client";

export default function CrosswordCard() {
  const miniGrid = [
    ["P","A","Z",null,null],
    ["I",null,"R",null,null],
    ["A","M","O","R",null],
    ["N",null,"E",null,null],
    [null,null,null,null,null],
  ];

  return (
    <div className="dot-map-card" style={{ borderColor: "rgba(94,234,212,0.2)" }}>
      <div className="dot-map-card__header">
        <span className="dot-map-card__badge" style={{ background: "#CCFBF1", color: "#0D9488" }}>✏️ Nuevo</span>
        <h3 className="dot-map-card__title">Crucigrama de la Paz</h3>
        <p className="dot-map-card__desc">Resuelve pistas sobre arte, paz y valores colombianos</p>
      </div>
      <div className="dot-map-card__canvas" style={{ padding: "16px" }}>
        <div className="flex flex-col items-center gap-1">
          <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {miniGrid.map((row, ri) =>
              row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`flex items-center justify-center rounded font-bold text-xs transition-all
                    ${cell === null ? "bg-slate-100" : "bg-white border border-slate-200 shadow-sm"}
                  `}
                  style={{ width: 32, height: 32 }}
                >
                  {cell && (
                    <span className="text-teal-700">{cell}</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-1 mt-2">
            <span className="text-[10px] text-slate-400 font-medium">1→ Lo opuesto a la guerra</span>
          </div>
        </div>
      </div>
    </div>
  );
}
