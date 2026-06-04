"use client";

import React, { useState } from "react";

export default function DownloadNormativaPDF() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Dynamically import jsPDF to prevent SSR issues in Next.js
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297;
      const pageWidth = 210;
      const margin = 20;
      let y = 20;

      // Function to draw header & page background
      const drawHeaderAndBackground = (pageNum: number) => {
        // Top aesthetic accent bar (Emerald Green)
        doc.setFillColor(13, 148, 136); // #0d9488 (Teal/Emerald)
        doc.rect(0, 0, pageWidth, 6, "F");

        // Subtle background grid or frame placeholder if needed
        doc.setDrawColor(241, 245, 249); // #f1f5f9
        doc.setLineWidth(0.5);
        doc.rect(margin - 5, margin - 5, pageWidth - (margin - 5) * 2, pageHeight - (margin - 5) * 2);

        // Header text
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // #64748b
        doc.text("REPÚBLICA DE COLOMBIA", margin, 15);
        
        doc.setFont("Helvetica", "normal");
        doc.text("•  MINISTERIO DE EDUCACIÓN NACIONAL  •", margin + 42, 15);

        // Right side header tag
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(13, 148, 136);
        doc.text("PROYECTO DE ARTES JOAN", pageWidth - margin - 40, 15, { align: "right" });

        // Divider
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.5);
        doc.line(margin, 17, pageWidth - margin, 17);
      };

      // Function to draw footer
      const drawFooter = (pageNum: number, totalPages: number) => {
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text(
          "Documento formativo institucional. Respaldado por la Ley 115 de 1994 y la Constitución de Colombia.",
          margin,
          pageHeight - 13
        );

        // Page number
        doc.setFont("Helvetica", "bold");
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 13);
      };

      // --- PAGE 1 ---
      drawHeaderAndBackground(1);
      y = 28;

      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // #0f172a
      doc.text("MARCO LEGAL Y NORMATIVO", margin, y);
      y += 8;

      // Subtitle
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105); // #475569
      doc.text("De la Educación Artística y Cultural en la República de Colombia", margin, y);
      y += 10;

      // Callout box / Introduction background
      doc.setFillColor(240, 253, 250); // Teal 50 #f0fdfa
      doc.setDrawColor(13, 148, 136); // Teal 600
      doc.setLineWidth(0.8);
      // Rect at x=20, y=y, w=170, h=28
      doc.rect(margin, y, pageWidth - margin * 2, 28, "FD");

      // Introduction Text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("¿Sabías que el Arte es un Derecho Obligatorio?", margin + 5, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 118, 110); // Teal 800
      const introText = 
        "El Ministerio de Educación Nacional (MEN) establece que la Educación Artística y Cultural no es una actividad extracurricular ni una materia opcional. Forma parte del núcleo fundamental y obligatorio para el desarrollo cognitivo, emocional y social de todas las niñas, niños y adolescentes del país.";
      const introLines = doc.splitTextToSize(introText, pageWidth - margin * 2 - 10);
      doc.text(introLines, margin + 5, y + 12);
      y += 36;

      // Sections data
      const sections = [
        {
          title: "1. Constitución Política de Colombia - Artículo 67",
          subtitle: "La Educación como Derecho y Servicio de Función Social",
          text: "Establece que la educación es un derecho de la persona y un servicio público que tiene una función social; con ella se busca el acceso al conocimiento, a la ciencia, a la técnica y a los demás bienes y valores de la cultura. Declara expresamente que el Estado tiene la ineludible responsabilidad de fomentar la ciencia, la tecnología y las manifestaciones culturales y artísticas, asegurando el desarrollo integral de los ciudadanos."
        },
        {
          title: "2. Ley 115 de 1994 (Ley General de Educación) - Artículo 23",
          subtitle: "Área Obligatoria y Fundamental de la Educación Básica",
          text: "Define las 9 áreas obligatorias y fundamentales del conocimiento y de la formación que necesariamente se tendrán que ofrecer en el currículo de los establecimientos educativos. La Educación Artística y Cultural se consagra en el numeral 2 de este artículo, teniendo exactamente el mismo estatus, importancia y peso legal que áreas como Matemáticas, Ciencias Naturales o Lengua Castellana."
        },
        {
          title: "3. Ley 115 de 1994 (Ley General de Educación) - Artículo 77",
          subtitle: "Autonomía Escolar para la Adaptación Curricular Regional",
          text: "Otorga autonomía escolar a las instituciones educativas de Colombia para organizar las áreas fundamentales definidas en la ley, adaptar el currículo a las particularidades y necesidades de su entorno socio-cultural, y definir la malla didáctica de las actividades artísticas y culturales en su Proyecto Educativo Institucional (PEI), guiadas siempre por los referentes técnicos nacionales."
        },
        {
          title: "4. Decreto 1075 de 2015",
          subtitle: "Decreto Único Reglamentario del Sector Educativo Nacional",
          text: "Compila y unifica toda la normativa y regulación escolar aplicable en Colombia. Regula la intensidad horaria mínima obligatoria de las clases de arte, la estructuración de los planes de estudio y define los sistemas de evaluación formativa del aprendizaje de la Educación Artística, impidiendo que el área sea desplazada o infravalorada."
        },
        {
          title: "5. Directrices y Orientaciones Curriculares MEN (2022)",
          subtitle: "Competencias Específicas Obligatorias y Aprendizaje para la Paz",
          text: "Establece el marco nacional vigente y de obligatorio cumplimiento para que los docentes planifiquen y evalúen las clases a partir de tres competencias específicas: Sensibilidad Perceptiva (desarrollo sensorial y estético), Producción-Creación (materialización del sentir artístico) y Comprensión Crítico-Cultural (contextualización e identidad), promoviendo el arte como dinamizador de la paz, la empatía escolar y las competencias socioemocionales de regulación."
        }
      ];

      // Print sections
      sections.forEach((sec, idx) => {
        // Calculate needed space:
        // Title: 5mm, Subtitle: 4mm, Text spacing: 4mm, Text lines: depends on length, Divider: 6mm.
        // Let's compute height of text:
        const wrappedText = doc.splitTextToSize(sec.text, pageWidth - margin * 2);
        const textHeight = wrappedText.length * 4.2; // 4.2mm line spacing
        const totalSecHeight = 5 + 4 + textHeight + 10;

        // If we exceed page boundaries, insert a page break
        if (y + totalSecHeight > pageHeight - 25) {
          doc.addPage();
          drawHeaderAndBackground(doc.getNumberOfPages());
          y = 26;
        }

        // Section Accent Line
        doc.setDrawColor(13, 148, 136); // Teal
        doc.setLineWidth(1.5);
        doc.line(margin, y, margin, y + 8); // vertical badge bar

        // Section Title
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // #0f172a
        doc.text(sec.title, margin + 4, y + 4);
        y += 6;

        // Section Subtitle
        doc.setFont("Helvetica", "oblique");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139); // #64748b
        doc.text(sec.subtitle, margin + 4, y + 2);
        y += 6;

        // Section Text
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // #334155
        wrappedText.forEach((line: string, lineIdx: number) => {
          doc.text(line, margin + 4, y + lineIdx * 4.2);
        });
        y += textHeight + 4;

        // Draw dotted separator between sections (except the last one)
        if (idx < sections.length - 1) {
          doc.setDrawColor(226, 232, 240); // #e2e8f0
          doc.setLineWidth(0.3);
          doc.setLineDashPattern([2, 2], 0);
          doc.line(margin, y, pageWidth - margin, y);
          doc.setLineDashPattern([], 0); // reset
          y += 6;
        }
      });

      // Signatures / Institutional Seal block
      const totalPages = doc.getNumberOfPages();
      
      // Compute if seal block fits on current page, if not, add page
      if (y + 35 > pageHeight - 25) {
        doc.addPage();
        drawHeaderAndBackground(doc.getNumberOfPages());
        y = 26;
      }

      y += 6;
      doc.setFillColor(248, 250, 252); // #f8fafc
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, pageWidth - margin * 2, 26, "FD");

      // Institution Seal details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("DOCUMENTO DE VALIDACIÓN PEDAGÓGICA Y CURRICULAR", margin + 6, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Proyecto de Artes e Innovación Didáctica 'PROYECTO DE ARTES JOAN' - MovilArt Studio.", margin + 6, y + 11);
      doc.text("Generado de manera digital para su uso institucional, archivo curricular y planeaciones escolares.", margin + 6, y + 15);
      
      // Draw a small decorative circular stamp shape
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.6);
      doc.circle(pageWidth - margin - 15, y + 13, 8);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(5);
      doc.setTextColor(13, 148, 136);
      doc.text("VALIDADO", pageWidth - margin - 20, y + 12.5);
      doc.text("MOVILART", pageWidth - margin - 20, y + 15);

      // Draw footers on all pages
      const totalPagesFinal = doc.getNumberOfPages();
      for (let i = 1; i <= totalPagesFinal; i++) {
        doc.setPage(i);
        drawFooter(i, totalPagesFinal);
      }

      // Save PDF
      doc.save("Marco_Normativo_Educacion_Artistica_JOAN.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error al generar el PDF. Por favor intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="btn-primary flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-full border-3 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)] hover:shadow-[2px_2px_0_rgba(15,23,42,1)] transition-all cursor-pointer select-none active:translate-y-0.5 active:translate-x-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-base md:text-lg mb-8 mx-auto"
      style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generando Documento...
        </>
      ) : (
        <>
          <span className="text-xl">📥</span> Descargar PDF Oficial
        </>
      )}
    </button>
  );
}
