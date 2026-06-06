"use client";
import React, { useState } from "react";

interface DownloadPlaneacionPDFProps {
  grupoName: string;
  competencia: string;
  desempenos: string[];
  orientaciones: string[];
  actividad: {
    nombre: string;
    descripcion: string;
    materiales: string[];
    criterios: string[];
  };
}

export default function DownloadPlaneacionPDF({
  grupoName,
  competencia,
  desempenos,
  orientaciones,
  actividad,
}: DownloadPlaneacionPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      let y = 20;

      // Header Banner
      doc.setFillColor(13, 148, 136); // Teal color
      doc.rect(15, y, 180, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("MOBILART STUDIO - PLANIFICACIÓN DIDÁCTICA OFICIAL", 20, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Grado: ${grupoName}  |  Eje: Educación Artística (MEN Colombia 2022)`, 20, y + 18);
      
      y += 38;

      // Card metadata block
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 20, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`COMPETENCIA A EVALUAR: ${competencia.toUpperCase()}`, 20, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Alineado con las directrices nacionales de formación artística y emocional.", 20, y + 14);

      y += 30;

      // Desempeños Clave
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("DESEMPEÑOS ESPERADOS (MEN)", 15, y);
      y += 6;

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      desempenos.forEach((des) => {
        const lines = doc.splitTextToSize(`• ${des}`, 175);
        lines.forEach((line: string) => {
          doc.text(line, 18, y);
          y += 5;
        });
        y += 1;
      });

      y += 6;

      // Orientaciones Metodológicas
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("ORIENTACIONES PEDAGÓGICAS PARA EL DOCENTE", 15, y);
      y += 6;

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      orientaciones.forEach((ori) => {
        const lines = doc.splitTextToSize(`• ${ori}`, 175);
        lines.forEach((line: string) => {
          doc.text(line, 18, y);
          y += 5;
        });
        y += 1;
      });

      y += 8;

      // Propuesta de Clase Práctica (Make sure it has enough room)
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y, 180, 80, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text(`ACTIVIDAD SUGERIDA: ${actividad.nombre}`, 20, y + 8);
      y += 14;

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const descLines = doc.splitTextToSize(actividad.descripcion, 170);
      descLines.forEach((line: string) => {
        doc.text(line, 20, y);
        y += 5.5;
      });

      y += 4;

      // Materiales
      doc.setFont("helvetica", "bold");
      doc.text("Materiales recomendados:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(` ${actividad.materiales.join(", ")}`, 62, y);

      y += 8;

      // Criterios de Evaluación
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text("CRITERIOS DE EVALUACIÓN FORMATIVA", 20, y);
      y += 6;

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      actividad.criterios.forEach((crit) => {
        const lines = doc.splitTextToSize(`- ${crit}`, 170);
        lines.forEach((line: string) => {
          doc.text(line, 22, y);
          y += 5;
        });
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("MobilArt Studio © 2026 - Guías Escolares e Inclusión Artística Educativa", pageWidth / 2, 287, { align: "center" });

      doc.save(`Planeacion_Clase_MobilArt_${grupoName.replace(/ /g, "_")}.pdf`);
    } catch (e) {
      console.error("Error al exportar planeación en PDF", e);
      alert("Hubo un error al generar el PDF. Por favor inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs sm:text-sm py-2.5 px-5 rounded-2xl border border-teal-600/30 transition-all hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
    >
      <span>{isGenerating ? "⌛ Generando PDF..." : "📥 Descargar Ficha en PDF"}</span>
    </button>
  );
}
