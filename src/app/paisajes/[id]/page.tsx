"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the 3D sensory landscape viewer to disable SSR
const LandscapeExperience3D = dynamic(
  () => import("@/components/LandscapeExperience3D"),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaisajePage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Back button overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-xs">
        <Link
          href="/#colombia-viva"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 group py-2 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm tracking-wide">Volver a Colombia Viva</span>
        </Link>

        <div className="text-right hidden sm:block">
          <p className="text-xs tracking-[0.25em] uppercase text-yellow-400 font-extrabold">
            🇨🇴 Experiencia Sensorial 3D
          </p>
        </div>
      </div>

      {/* 3D Immersive Sensory Viewer */}
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin" />
              <p className="text-white/40 text-sm tracking-widest uppercase font-extrabold animate-pulse">
                Preparando entorno tridimensional...
              </p>
            </div>
          </div>
        }
      >
        <LandscapeExperience3D landscapeId={id} />
      </Suspense>
    </div>
  );
}
