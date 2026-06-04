"use client";

import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import — Three.js solo se carga en el cliente, sin SSR
const CulturalGallery3D = dynamic(
  () => import("@/components/CulturalGallery3D"),
  { ssr: false }
);

export default function IdentidadPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050510]">
      {/* ═══ OVERLAY UI ═══ */}
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm font-medium tracking-wide">Volver al Inicio</span>
        </Link>

        <div className="text-right">
          <p
            className="text-xs tracking-[0.25em] uppercase text-white/40 font-medium"
          >
            Galería Interactiva
          </p>
        </div>
      </div>

      {/* Center title overlay */}
      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none gallery-title-overlay">
        <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-medium mb-3 animate-fade-down">
          Explora nuestra identidad
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center leading-tight animate-fade-up"
          style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}
        >
          El Prisma de la{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-400 to-red-500">
            Identidad
          </span>
        </h1>
        <p className="text-white/50 text-sm md:text-base mt-4 max-w-md text-center animate-fade-up-delay font-medium">
          Mueve el mouse para explorar. Pasa sobre cada lienzo para descubrir la riqueza de Colombia.
        </p>

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="text-white/25 text-xs tracking-widest uppercase">Interactúa</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/20"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>

      {/* ═══ 3D CANVAS ═══ */}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-[#050510]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin" />
              <p className="text-white/40 text-sm tracking-widest uppercase">
                Cargando galería...
              </p>
            </div>
          </div>
        }
      >
        <CulturalGallery3D />
      </Suspense>

      {/* ═══ CSS para las animaciones del overlay ═══ */}
      <style jsx>{`
        .gallery-title-overlay {
          animation: fadeOutTitle 4s ease-in-out 3s forwards;
        }
        @keyframes fadeOutTitle {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        .animate-fade-down {
          animation: fadeDown 1s ease-out 0.3s both;
        }
        .animate-fade-up {
          animation: fadeUp 1s ease-out 0.5s both;
        }
        .animate-fade-up-delay {
          animation: fadeUp 1s ease-out 0.8s both;
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
