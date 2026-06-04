"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import DotMapCard from "@/components/DotMapCard";
import MazeCard from "@/components/MazeCard";
import WordSearchCard from "@/components/WordSearchCard";
import VideoShowcase from "@/components/VideoShowcase";
import TiltCard from "@/components/TiltCard";
import Emocionometro from "@/components/Emocionometro";
import NeuroInclusion from "@/components/NeuroInclusion";
import DigitalWellbeing from "@/components/DigitalWellbeing";
import StudentAlbum from "@/components/StudentAlbum";
import MemoryCard from "@/components/MemoryCard";
import BoardCard from "@/components/BoardCard";

/* ═══════════════════════════════════════════════
   Datos de la galería Colombia Viva (2D ligera)
   ═══════════════════════════════════════════════ */
const COLOMBIA_ITEMS = [
  {
    id: "la-paloma-de-la-paz",
    image: "/images/gallery/dove_peace.png",
    title: "La Paloma de la Paz",
    subtitle: "Símbolo de reconciliación",
    accent: "from-sky-400 to-blue-500",
    glow: "shadow-sky-500/20",
  },
  {
    id: "cano-cristales",
    image: "/images/gallery/cano_cristales.png",
    title: "Caño Cristales",
    subtitle: "El río de los 7 colores",
    accent: "from-pink-400 to-rose-500",
    glow: "shadow-pink-500/20",
  },
  {
    id: "valle-cocora",
    image: "/images/gallery/valle_cocora.png",
    title: "Valle del Cocora",
    subtitle: "Palmas de cera y niebla mágica",
    accent: "from-emerald-400 to-green-500",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "condor-andes",
    image: "/images/gallery/condor_andes.png",
    title: "El Cóndor de los Andes",
    subtitle: "Majestuosidad y libertad",
    accent: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    id: "mascaras-teatro",
    image: "/images/masks_theater.png",
    title: "Máscaras del Teatro",
    subtitle: "Expresión y emoción",
    accent: "from-violet-400 to-purple-500",
    glow: "shadow-violet-500/20",
  },
  {
    id: "paleta-artista",
    image: "/images/palette_art.png",
    title: "La Paleta del Artista",
    subtitle: "El color como lenguaje",
    accent: "from-teal-400 to-cyan-500",
    glow: "shadow-teal-500/20",
  },
];

const formatTimeLeft = (seconds: number) => {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  
  return parts.join(" ");
};

export default function Home() {
  // Estados para el sistema de encuestas en tiempo real
  const [socket, setSocket] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [showSurveyOverlay, setShowSurveyOverlay] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [proyectoJoanUrl, setProyectoJoanUrl] = useState("");

  // Cargar tesis al montar la página
  useEffect(() => {
    fetch('/api/proyecto-joan')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.url) {
          setProyectoJoanUrl(data.url);
        }
      })
      .catch(err => console.error("Error cargando Proyecto Joan:", err));
  }, []);

  // Conectar con el servidor WebSocket
  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setWsConnected(true);
      console.log("🔌 Conectado al servidor WebSocket para encuestas");
    });

    socketInstance.on('disconnect', () => {
      setWsConnected(false);
      console.log("❌ Desconectado del servidor WebSocket");
    });

    socketInstance.on('active_survey_state', (state: any) => {
      console.log("📥 Estado de encuesta recibido:", state);
      if (state && state.active) {
        const timeLeft = Math.max(0, Math.round((state.endsAt - Date.now()) / 1000));
        if (timeLeft > 0) {
          setActiveSurvey(state);
          setSecondsLeft(timeLeft);
          setHasVoted(state.votedUsers?.includes(socketInstance.id));
          setIsBannerVisible(true);
        }
      } else {
        setActiveSurvey(null);
        setShowSurveyOverlay(false);
      }
    });

    socketInstance.on('survey_started', (state: any) => {
      console.log("🚀 Encuesta iniciada:", state);
      setActiveSurvey(state);
      setSecondsLeft(state.duration);
      setHasVoted(false);
      setSelectedVote(null);
      setIsBannerVisible(true);
      
      // Reproducir sonido de alerta
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.55);
        }
      } catch (e) {
        console.error(e);
      }
    });

    socketInstance.on('survey_votes_updated', (data: any) => {
      console.log("🗳️ Votos actualizados:", data);
      setActiveSurvey((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          votes: data.votes,
          totalVotes: data.totalVotes
        };
      });
    });

    socketInstance.on('survey_ended', () => {
      console.log("🏁 Encuesta finalizada");
      setActiveSurvey(null);
      setShowSurveyOverlay(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Controlar la cuenta regresiva del temporizador
  useEffect(() => {
    if (!activeSurvey || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveSurvey(null);
          setShowSurveyOverlay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSurvey, secondsLeft]);

  const handleSubmitVote = (vote: string) => {
    if (socket && activeSurvey) {
      socket.emit('submit_vote', { surveyId: activeSurvey.id, vote });
      setHasVoted(true);
      setSelectedVote(vote);
      
      // Sonido dulce de éxito
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now); // E5
          osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.35);
        }
      } catch (e) {
        console.error(e);
      }
      
      setTimeout(() => {
        setShowSurveyOverlay(false);
      }, 1800);
    }
  };

  return (
    <main className="relative bg-[#FFFFFF] overflow-hidden">
      
      {/* ═══ HERO ARTE VIVO ═══ */}
      <section className="hero-vivo relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden bg-white/40">
        
        {/* Floating paint dots */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[15%] left-[15%] w-4 h-4 rounded-full bg-teal-400 anim-breathe opacity-40" />
          <div className="absolute top-[75%] right-[15%] w-3 h-3 rounded-full bg-cyan-400 anim-breathe opacity-40" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[30%] right-[25%] w-2 h-2 rounded-full bg-emerald-400 anim-breathe opacity-30" style={{ animationDelay: "2s" }} />
        </div>

        {/* Scattered Background Images */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Pinceladas at the center behind everything */}
          <img src="/images/paint_brushstrokes.png" alt="Pinceladas" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[50rem] anim-brushstroke opacity-30" style={{ mixBlendMode: 'multiply' }} />
          
          {/* Masks and Palette on the sides */}
          <img src="/images/masks_theater.png" alt="Máscaras" className="absolute top-[8%] left-[2%] md:left-[8%] w-24 md:w-48 anim-hero-float opacity-90 drop-shadow-xl" style={{ mixBlendMode: 'multiply' }} />
          <img src="/images/palette_art.png" alt="Paleta" className="absolute bottom-[22%] md:bottom-[10%] right-[2%] md:right-[8%] w-24 md:w-48 anim-hero-float opacity-90 drop-shadow-xl" style={{ animationDelay: '1s', mixBlendMode: 'multiply' }} />

          {/* Dancers and Orchids */}
          <img src="/images/colombian_dancers.png" alt="Bailarines" className="absolute bottom-[22%] md:bottom-[10%] left-[2%] md:left-[8%] w-28 md:w-56 anim-hero-float opacity-90 drop-shadow-xl" style={{ animationDelay: '2s', mixBlendMode: 'multiply' }} />
          <img src="/images/orchid_bloom.png" alt="Orquídeas" className="absolute top-[12%] right-[2%] md:right-[8%] w-24 md:w-48 anim-hero-float opacity-90 drop-shadow-xl" style={{ animationDelay: '1.5s', mixBlendMode: 'multiply' }} />
        </div>

        {/* Content Container (Text and Dove) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center px-4 md:px-8">
          
          {/* Dove of Peace right in the middle */}
          <div className="relative w-full flex justify-center mt-14 sm:mt-0 mb-6">
            <img src="/images/dove_peace.png" alt="Paloma de la Paz" className="w-40 sm:w-56 md:w-72 anim-float-fast pseudo-3d drop-shadow-2xl" style={{ mixBlendMode: 'multiply' }} />
          </div>

          <Reveal>
            {/* Texto legible gracias a text-shadow suave */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight text-slate-900 font-extrabold"
                style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", textShadow: "0px 2px 15px rgba(255,255,255,0.9), 0px 0px 30px rgba(255,255,255,0.7)" }}>
              Construyendo Paz <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600" style={{ textShadow: "0px 2px 15px rgba(255,255,255,0.9)" }}>
                a través del Arte.
              </span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-slate-800 font-extrabold tracking-wide" style={{ textShadow: "0px 2px 10px rgba(255,255,255,0.9)" }}>
              by Joan Didier Betancur
            </p>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-800 mt-5 leading-relaxed font-bold" style={{ textShadow: "0px 2px 10px rgba(255,255,255,0.9)" }}>
              Un lienzo vivo para la memoria, la reconciliación y el tejido social.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="#fundamentacion" className="btn-primary shadow-xl shadow-teal-500/30 text-lg px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 border-none hover:scale-105 transition-transform text-white rounded-full">
                Conocer el Proyecto 📖
              </Link>
              <Link href="#grupos" className="btn-secondary text-lg px-8 py-4 border-2 border-teal-300 bg-white/80 text-teal-800 hover:bg-teal-50 font-bold backdrop-blur-sm hover:scale-105 transition-transform rounded-full">
                Seleccionar Grupo ↓
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ VIDEO PRESENTACIÓN ═══ */}
      <VideoShowcase />

      {/* ═══ PASO 2: FUNDAMENTACIÓN TEÓRICA (con imágenes 2D flotantes) ═══ */}
      <section id="fundamentacion" className="relative py-28 px-4 md:px-6 bg-mural-escolar border-y-4 border-dashed border-rose-400 overflow-hidden">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] z-0"></div>
        
        {/* Imágenes 2D decorativas */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <img src="/images/colombian_dancers.png" alt="Bailarines colombianos" className="absolute bottom-[5%] left-[3%] md:left-[8%] w-28 md:w-40 anim-hero-float delay-3 opacity-20 md:opacity-30" style={{ mixBlendMode: 'multiply' }} />
          <img src="/images/orchid_bloom.png" alt="Orquídeas colombianas" className="absolute bottom-[8%] right-[3%] md:right-[8%] w-24 md:w-36 anim-bloom delay-4 opacity-20 md:opacity-30" style={{ mixBlendMode: 'multiply' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="w-12 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
              <p className="text-sm tracking-[0.2em] uppercase text-teal-600 font-bold">Fundamentación Teórica</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Sanar a través del color y la forma.
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8">
              &quot;Arte Vivo&quot; es una propuesta pedagógica diseñada para utilizar la expresión artística como un canal de reconciliación y regulación socioemocional. A través del juego, la pintura y la interacción, buscamos que los estudiantes procesen el conflicto y construyan un entorno de paz en su comunidad.
            </p>
            
            <div className="mt-8 flex justify-center">
              {proyectoJoanUrl ? (
                <a 
                  href={proyectoJoanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 text-white font-extrabold text-sm rounded-full transition-all shadow-lg hover:shadow-xl border-2 border-slate-900 shadow-[3px_3px_0_rgba(15,23,42,1)] cursor-pointer"
                >
                  📖 Ver Proyecto Joan (Tesis PDF)
                </a>
              ) : (
                <button 
                  onClick={() => alert("El documento de tesis de grado 'Proyecto Joan' está siendo elaborado por el docente y se habilitará próximamente para su consulta. ¡Sigue explorando!")}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-100 hover:bg-slate-200 hover:scale-105 active:scale-95 text-slate-400 border-2 border-dashed border-slate-350 font-extrabold text-sm rounded-full transition-all cursor-pointer shadow-[3px_3px_0_rgba(15,23,42,1)]"
                >
                  🔒 Proyecto Joan (Próximamente)
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══ COLOMBIA VIVA — Galería 2D Ligera ═══ */}
      <section id="colombia-viva" className="relative py-20 md:py-28 px-4 md:px-6 bg-slate-950 overflow-hidden">
        {/* Gradient borders colombian flag */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-400"></div>

        {/* Subtle decorative dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-yellow-400/20 animate-pulse" />
          <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-blue-400/20 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[40%] left-[80%] w-2 h-2 rounded-full bg-red-400/15 animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[75%] left-[25%] w-1.5 h-1.5 rounded-full bg-emerald-400/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-[15%] right-[30%] w-1 h-1 rounded-full bg-purple-400/20 animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-400/0 rounded-full"></span>
                <p className="text-xs tracking-[0.3em] uppercase text-yellow-400/60 font-bold">🇨🇴 Nuestra Identidad</p>
                <span className="w-10 h-[2px] bg-gradient-to-l from-yellow-400 to-yellow-400/0 rounded-full"></span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
                Colombia{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-400 to-red-500">
                  Viva
                </span>
              </h2>
              <p className="text-white/35 text-sm md:text-base max-w-md mx-auto font-medium">
                Paisajes, fauna y arte que inspiran la construcción de paz a través de la identidad cultural.
              </p>
            </div>
          </Reveal>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {COLOMBIA_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <TiltCard className="rounded-2xl h-full">
                  <Link href={`/paisajes/${item.id}`} className="block h-full cursor-pointer group">
                    <div className={`colombia-card relative h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 hover:border-white/20 transition-all duration-500 shadow-lg ${item.glow}`}>
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="colombia-card__img w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                        {/* Interactive overlay text on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs">
                          <span className="bg-white/10 text-white border border-white/25 py-2 px-4 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
                            ✨ Entrar 3D
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="p-4 md:p-5">
                        <div className={`colombia-card__accent w-8 h-1 rounded-full bg-gradient-to-r ${item.accent} mb-3`} />
                        <h3 className="text-sm md:text-base font-bold text-white leading-tight mb-1 group-hover:text-yellow-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-white/40 text-xs md:text-sm font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PASO 3: GRUPOS ═══ */}
      <section id="grupos" className="relative py-32 px-4 md:px-6 bg-mural-escolar">
        <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-1 bg-teal-400 rounded-full"></span>
              <p className="text-sm tracking-[0.2em] uppercase text-teal-300 font-bold">Selección de Ruta</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 drop-shadow-lg">
              Elige tu Grupo
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Reveal delay={100}>
              <Link href="/grupos/primero" className="group block h-full">
                <div className="card-organic p-8 hover:shadow-xl hover:border-teal-400 text-center flex flex-col h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🌱</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Grupo Primero</h3>
                  <p className="text-slate-600 font-medium flex-1">Ruta de iniciación. Conceptos básicos de color, emociones primarias y dinámicas de reconocimiento.</p>
                  <div className="mt-8 py-3 rounded-xl bg-slate-50 text-teal-700 font-bold group-hover:bg-teal-50 transition-colors">
                    Ingresar →
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={200}>
              <Link href="/grupos/segundo" className="group block h-full">
                <div className="card-organic p-8 hover:shadow-xl hover:border-blue-400 text-center flex flex-col h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🌿</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Grupo Segundo</h3>
                  <p className="text-slate-600 font-medium flex-1">Ruta de desarrollo. Expresión colectiva, empatía y resolución de conflictos a través del arte.</p>
                  <div className="mt-8 py-3 rounded-xl bg-slate-50 text-blue-700 font-bold group-hover:bg-blue-50 transition-colors">
                    Ingresar →
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={300}>
              <Link href="/grupos/tercero" className="group block h-full">
                <div className="card-organic p-8 hover:shadow-xl hover:border-indigo-400 text-center flex flex-col h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🌳</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Grupo Tercero</h3>
                  <p className="text-slate-600 font-medium flex-1">Ruta de liderazgo. Proyectos murales, tejido social complejo y mentoría artística.</p>
                  <div className="mt-8 py-3 rounded-xl bg-slate-50 text-indigo-700 font-bold group-hover:bg-indigo-50 transition-colors">
                    Ingresar →
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={400}>
              <Link href="/grupos/cuarto" className="group block h-full">
                <div className="card-organic p-8 hover:shadow-xl hover:border-rose-400 text-center flex flex-col h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Grupo Cuarto</h3>
                  <p className="text-slate-600 font-medium flex-1">Ruta de consolidación. Exploración de técnicas mixtas e identidades culturales diversas.</p>
                  <div className="mt-8 py-3 rounded-xl bg-slate-50 text-rose-700 font-bold group-hover:bg-rose-50 transition-colors">
                    Ingresar →
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={500}>
              <Link href="/grupos/quinto" className="group block h-full">
                <div className="card-organic p-8 hover:shadow-xl hover:border-amber-400 text-center flex flex-col h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🕊️</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Grupo Quinto</h3>
                  <p className="text-slate-600 font-medium flex-1">Ruta de proyección. Desarrollo de portafolios de paz y gestión comunitaria mediante intervenciones.</p>
                  <div className="mt-8 py-3 rounded-xl bg-slate-50 text-amber-700 font-bold group-hover:bg-amber-50 transition-colors">
                    Ingresar →
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ EMOCIONÓMETRO: REGULACIÓN EMOCIONAL Y CONVIVENCIA ═══ */}
      <section id="emocionometro-section" className="relative py-20 px-4 md:px-6 bg-[#faf8f5] border-t-4 border-dashed border-slate-350">
        <div className="max-w-5xl mx-auto relative z-10">
          <Emocionometro />
        </div>
      </section>
      {/* ═══ ACTIVIDADES INTERACTIVAS (Juegos) ═══ */}
      <section id="juegos" className="relative py-28 px-4 md:px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <h3 className="text-3xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Actividades Interactivas (Los Juegos)</h3>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delay={100}>
              <Link href="/games/dots" className="block h-full">
                <DotMapCard />
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/games/maze" className="block h-full">
                <MazeCard />
              </Link>
            </Reveal>
            <Reveal delay={300}>
              <Link href="/games/wordsearch" className="block h-full">
                <WordSearchCard />
              </Link>
            </Reveal>
            <Reveal delay={400}>
              <Link href="/games/memory" className="block h-full">
                <MemoryCard />
              </Link>
            </Reveal>
            <Reveal delay={500}>
              <Link href="/games/board" className="block h-full">
                <BoardCard />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ PASO 5: MENTES DIVERSAS — GUÍA DE INCLUSIÓN Y NEURODIVERSIDAD ═══ */}
      <section id="inclusion" className="relative py-28 px-4 md:px-6 bg-mural-escolar border-t-8 border-double border-teal-400">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] z-0"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <NeuroInclusion />
        </div>
      </section>

      {/* ═══ PASO 6: BIENESTAR DIGITAL — REFLEXIONES SOBRE EL CELULAR EN NIÑOS ═══ */}
      <DigitalWellbeing />

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 px-6 bg-slate-900 border-t border-slate-800 pb-32">
        <div className="max-w-6xl mx-auto text-center md:flex md:items-center md:justify-between text-left">
          <div className="mb-8 md:mb-0">
            <h2 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>MovilArt</h2>
            <p className="text-slate-400 font-medium">Construyendo Paz a través del Arte</p>
          </div>
          <div className="text-slate-500 font-medium space-y-2">
            <p>Un proyecto original de <span className="text-white">Joan Didier Betancur</span></p>
            <p>© 2026 Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      <StudentAlbum />

      {/* SISTEMA DE ENCUESTAS EN TIEMPO REAL */}
      {activeSurvey && isBannerVisible && (
        <div className="fixed top-28 left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none select-none">
          <div className="anim-slide-down pointer-events-auto flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-full shadow-[2px_2px_0_rgba(15,23,42,1)] py-2.5 px-4 text-white relative">
            <span className="text-xs shrink-0">📢</span>
            
            <div className="cursor-pointer flex items-center gap-1.5 min-w-0" onClick={() => setShowSurveyOverlay(true)}>
              <span className="text-[10px] sm:text-xs font-black text-teal-400 uppercase tracking-wider shrink-0">Encuesta:</span>
              <p className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[200px]">
                {activeSurvey.question}
              </p>
            </div>
            
            <button 
              onClick={() => setIsBannerVisible(false)}
              className="text-slate-400 hover:text-white font-black text-[10px] sm:text-xs hover:scale-110 active:scale-95 transition-all p-0.5 cursor-pointer shrink-0 border-l border-slate-800 pl-1.5 ml-0.5"
              title="Ocultar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showSurveyOverlay && activeSurvey && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 select-none">
          <div className="bg-white border-4 border-slate-900 max-w-md w-full rounded-3xl shadow-[8px_8px_0_rgba(15,23,42,1)] overflow-hidden text-slate-900 animate-fade-in">
            <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 p-4 border-b-4 border-slate-900 text-center relative text-white">
              <button
                onClick={() => setShowSurveyOverlay(false)}
                className="absolute top-4 right-4 bg-slate-900 text-white hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white cursor-pointer active:scale-90 transition-all text-xs"
              >
                ✕
              </button>
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                📊 Encuesta en Vivo
              </h2>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
                ⏱️ {formatTimeLeft(secondsLeft)} restantes
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-3xl animate-pulse block">💬</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {activeSurvey.question}
                </h3>
              </div>

              {!hasVoted ? (
                <div className="space-y-4">
                  {activeSurvey.type === 'choice' ? (
                    <div className="grid gap-3">
                      {activeSurvey.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleSubmitVote(opt)}
                          className="w-full py-3 px-5 bg-slate-50 border-3 border-slate-900 rounded-2xl font-black text-slate-900 text-sm text-left hover:bg-teal-50 active:translate-y-0.5 active:translate-x-0.5 shadow-[3px_3px_0_rgba(15,23,42,1)] transition-all cursor-pointer"
                        >
                          👉 {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-around items-center gap-2 py-4">
                      {['🤩', '😊', '😐', '😢', '😡'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleSubmitVote(emoji)}
                          className="text-4xl sm:text-5xl p-2 hover:scale-125 transition-transform duration-200 cursor-pointer hover:rotate-6 active:scale-95"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center py-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                    <span className="text-3xl block animate-bounce mb-1.5">✨</span>
                    <p className="font-black text-emerald-800 text-sm">¡Tu voto ha sido registrado!</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">Votaste por: <strong className="text-emerald-900">{selectedVote}</strong></p>
                  </div>

                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Resultados de la clase:</p>
                    {Object.entries(activeSurvey.votes || {}).map(([option, count]) => {
                      const c = count as number;
                      const total = activeSurvey.totalVotes || 0;
                      const percentage = total > 0 ? Math.round((c / total) * 100) : 0;
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex justify-between text-xs font-black text-slate-700">
                            <span>{option}</span>
                            <span>{c} {c === 1 ? 'voto' : 'votos'} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {hasVoted ? "Esperando a que termine el tiempo..." : "Selecciona una opción para votar"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled slide down transition keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-80px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .anim-slide-down {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  );
}
