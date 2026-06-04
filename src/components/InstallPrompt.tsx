"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed)
    const checkStandalone = () => {
      if (typeof window === "undefined") return false;
      const isPostStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore
      const isSafariStandalone = window.navigator.standalone === true;
      return isPostStandalone || isSafariStandalone;
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install promotion custom banner after a 3 second delay
      const hasClosedPrompt = localStorage.getItem("mobilart_prompt_dismissed");
      if (!hasClosedPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    const handleAppInstalled = () => {
      console.log('MobilArt was installed');
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismissClick = () => {
    // Save state so we don't annoy the user on every reload
    localStorage.setItem("mobilart_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 animate-fade-in animate-slide-up text-white">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/20 bg-white flex-shrink-0 flex items-center justify-center">
          <Image
            src="/images/logo_mobilart.png"
            alt="Logo MobilArt"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-extrabold text-sm sm:text-base leading-tight text-white flex items-center gap-1.5">
            Instalar MobilArt
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">App</span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Ancla MobilArt en tu pantalla de inicio para jugar y regular tus emociones con rapidez, sin anuncios y sin navegador.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2.5 mt-1">
        <button
          onClick={handleDismissClick}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200"
        >
          Más tarde
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4.5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Instalar App
        </button>
      </div>
    </div>
  );
}
