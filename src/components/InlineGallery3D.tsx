"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const CulturalGallery3D = dynamic(
  () => import("@/components/CulturalGallery3D"),
  { ssr: false }
);

export default function InlineGallery3D() {
  return (
    <div className="relative w-full h-[80vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-[#050510]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin" />
              <p className="text-white/40 text-xs tracking-widest uppercase">
                Cargando experiencia 3D...
              </p>
            </div>
          </div>
        }
      >
        <CulturalGallery3D />
      </Suspense>
    </div>
  );
}
