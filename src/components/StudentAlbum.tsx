"use client";
import React, { useState, useEffect } from "react";

export default function StudentAlbum() {
  const [isOpen, setIsOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState({
    trivia: false,
    colormix: false,
    puzzle: false,
    matching: false,
    rhythm: false,
    roulette: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state from localStorage when opened or mounted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("movilart_student_name") || "";
      setStudentName(storedName);
      
      const storedPoints = Number(localStorage.getItem("movilart_artipuntos") || "0");
      setPoints(storedPoints);

      setBadges({
        trivia: localStorage.getItem("movilart_completed_trivia") === "true",
        colormix: localStorage.getItem("movilart_completed_colormix") === "true",
        puzzle: localStorage.getItem("movilart_completed_puzzle") === "true",
        matching: localStorage.getItem("movilart_completed_matching") === "true",
        rhythm: localStorage.getItem("movilart_completed_rhythm") === "true",
        roulette: localStorage.getItem("movilart_completed_roulette") === "true",
      });
    }
  }, [isOpen]);

  const saveName = (name: string) => {
    setStudentName(name);
    localStorage.setItem("movilart_student_name", name);
  };

  const playBadgeChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright arpeggio)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const generateDiploma = async () => {
    setIsGenerating(true);
    playBadgeChime();
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "l",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 297;
      const pageHeight = 210;

      // 1. Elegant Border
      doc.setDrawColor(249, 115, 22); // Orange border
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      doc.setDrawColor(15, 23, 42); // slate double border
      doc.setLineWidth(0.5);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

      // Gold Corners
      doc.setFillColor(234, 179, 8); // Gold
      doc.rect(10, 10, 8, 8, "F");
      doc.rect(pageWidth - 18, 10, 8, 8, "F");
      doc.rect(10, pageHeight - 18, 8, 8, "F");
      doc.rect(pageWidth - 18, pageHeight - 18, 8, 8, "F");

      // 2. Banner Text
      doc.setTextColor(13, 148, 136); // Teal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("DIPLOMA DE ARTISTA SENSORIAL", pageWidth / 2, 45, { align: "center" });

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.text("Otorgado con orgullo y admiración a:", pageWidth / 2, 60, { align: "center" });

      // 3. Student Name (with elegant bold underline)
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      const displayName = studentName.trim() || "Estudiante de Arte";
      doc.text(displayName.toUpperCase(), pageWidth / 2, 82, { align: "center" });
      
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(1);
      doc.line(pageWidth / 2 - 60, 87, pageWidth / 2 + 60, 87);

      // 4. Achievement Description
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11.5);
      doc.text(
        "Por haber completado con éxito la aventura pedagógica interactiva de MovilArt Studio,",
        pageWidth / 2,
        105,
        { align: "center" }
      );
      doc.text(
        "demostrando sobresalientes capacidades en la expresión sensible del color, rítmica de oído y composición visual,",
        pageWidth / 2,
        112,
        { align: "center" }
      );
      doc.text(
        `alcanzando un puntaje estelar de ${points} Artipuntos de sabiduría emocional.`,
        pageWidth / 2,
        119,
        { align: "center" }
      );

      // 5. Badges Completed Section
      yPos = 138;
      doc.setFillColor(248, 250, 252);
      doc.rect(pageWidth / 2 - 90, yPos, 180, 20, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(234, 179, 8); // Gold star
      doc.text("LOGROS LOGRADOS EN EL VIAJE SENSORIAL:", pageWidth / 2, yPos + 6, { align: "center" });
      
      doc.setTextColor(13, 148, 136);
      const activeBadges = [];
      if (badges.trivia) activeBadges.push("Trivia");
      if (badges.colormix) activeBadges.push("Mezclador");
      if (badges.puzzle) activeBadges.push("Composición");
      if (badges.matching) activeBadges.push("Parejas");
      if (badges.rhythm) activeBadges.push("Rítmica");
      if (badges.roulette) activeBadges.push("Ruleta");
      
      const badgeStr = activeBadges.length > 0 ? activeBadges.join("  |  ") : "Explorador Inicial";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.text(badgeStr, pageWidth / 2, yPos + 13, { align: "center" });

      // 6. Signatures & Date
      const sigLineY = 180;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.line(45, sigLineY, 105, sigLineY);
      doc.line(pageWidth - 105, sigLineY, pageWidth - 45, sigLineY);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Firma de la Institución", 75, sigLineY + 5, { align: "center" });
      doc.text("Firma del Docente de Arte", pageWidth - 75, sigLineY + 5, { align: "center" });

      const today = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Fecha de expedición: ${today}  |  Colombia Viva`, pageWidth / 2, 192, { align: "center" });

      doc.save(`Diploma_Artista_MovilArt_${displayName.replace(/ /g, "_")}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Hubo un error al descargar tu diploma.");
    } finally {
      setIsGenerating(false);
    }
  };

  let completedCount = 0;
  Object.values(badges).forEach((v) => { if (v) completedCount++; });

  return (
    <>
      {/* Floating Trophy Badge Button */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-2 sm:border-3 border-slate-900 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs tracking-wide uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[2.5px_2.5px_0_rgba(15,23,42,1)] sm:shadow-[4px_4px_0_rgba(15,23,42,1)] flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
        >
          <span className="text-base sm:text-lg group-hover:animate-bounce">🏆</span>
          <span>Mi Álbum ({completedCount}/6)</span>
          <span className="bg-slate-900 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full">{points}p</span>
        </button>
      </div>

      {/* Album Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white border-4 border-slate-900 max-w-lg w-full rounded-3xl shadow-[8px_8px_0_rgba(15,23,42,1)] overflow-hidden animate-fade-in text-slate-900">
            {/* Cover header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-4 sm:p-6 border-b-3 sm:border-b-4 border-slate-900 text-center relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 bg-slate-900 text-white hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white cursor-pointer active:scale-90 transition-all text-xs"
              >
                ✕
              </button>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                🏆 ÁLBUM DE LOGROS SENSORIALES
              </h2>
              <p className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1">Mi Pasaporte Creativo MovilArt</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase block">Nombre del Joven Artista:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => saveName(e.target.value)}
                  placeholder="Escribe tu nombre aquí..."
                  className="w-full border-3 border-slate-900 px-4 py-3 rounded-2xl text-sm font-bold text-slate-900 bg-amber-50/30 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </div>

              {/* Badges Checklist grid */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 uppercase block">
                  Mis Sellos y Logros Didácticos:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Badge 1 */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${badges.trivia ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-xl">{badges.trivia ? '✅' : '🔒'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none">Triviarte</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.trivia ? 'Conquistado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${badges.colormix ? 'bg-rose-50 border-rose-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-xl">{badges.colormix ? '🎨' : '🔒'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none">Mezcla</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.colormix ? 'Combinado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  {/* Badge 3 */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${badges.puzzle ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-xl">{badges.puzzle ? '🧩' : '🔒'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none">Composición</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.puzzle ? 'Ordenado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  {/* Badge 4 - Matching */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${badges.matching ? 'bg-purple-50 border-purple-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-xl">{badges.matching ? '🃏' : '🔒'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none">Parejas</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.matching ? 'Emparejado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  {/* Badge 5 - Rhythm */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${badges.rhythm ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-xl">{badges.rhythm ? '🎵' : '🔒'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none">Oído Musical</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.rhythm ? 'Sintonizado' : 'Pendiente'}</span>
                    </div>
                  </div>
                </div>

                {/* Badge 5 / Final */}
                <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition-all ${badges.roulette ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badges.roulette ? '🌟' : '🔒'}</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-none">Ruleta Creativa</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{badges.roulette ? 'Misión Lanzada' : 'Pendiente'}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-600">Último Paso</span>
                </div>
              </div>

              {/* Action Button: Diploma */}
              <div className="pt-2">
                <button
                  onClick={generateDiploma}
                  disabled={isGenerating}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-extrabold rounded-2xl border-3 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)] active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>✨ {isGenerating ? "Creando Diploma Especial..." : "📥 Descargar mi Diploma de Artista (PDF)"}</span>
                </button>
              </div>

              <div className="text-center text-[10px] font-semibold text-slate-400 leading-tight">
                ¡Juega en el módulo Triviarte de tu grado para desbloquear los sellos, sumar puntos y recibir tu certificado oficial firmado en tiempo real!
              </div>

              {/* Botón Volver explícito */}
              <div className="pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl border-2 border-slate-300 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  ← Volver a la página anterior
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Simple let variables support for clean code
let yPos = 138;
