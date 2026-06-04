import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import Navigation from "@/components/Navigation";
import SuggestionBox from "@/components/SuggestionBox";
import CursorTrail from "@/components/CursorTrail";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300","400","500","600","700"] });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: ["400"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "PROYECTO DE ARTES JOAN - MovilArt Studio",
  description: "Plataforma educativa de regulación emocional a través del arte",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MovilArt"
  }
};

export const viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased min-h-screen`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navigation />
        <div className="relative z-10">
          {children}
        </div>
        <SuggestionBox />
        <CursorTrail />
        <InstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered with scope: ', reg.scope);
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
