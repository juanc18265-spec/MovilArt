"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ═══ CAJA DE RESONANCIA ═══
   An ambient soundscape mixer. Generates continuous loops using Web Audio API
   to avoid needing external audio files. Provides a very calm, meditative interaction. */

const TRACKS = [
  { id: "rain", label: "Lluvia Blanca", color: "#7BA4DB", desc: "Ruido blanco filtrado" },
  { id: "heart", label: "Latido Profundo", color: "#E06B53", desc: "Pulso rítmico a 60bpm" },
  { id: "drone", label: "Atmósfera", color: "#7A9A7C", desc: "Cuerdas sostenidas" },
  { id: "piano", label: "Gotas de Piano", color: "#D9C8A9", desc: "Notas aleatorias Pentatónicas" },
];

export default function RhythmPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [activeTracks, setActiveTracks] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({ rain: 0.5, heart: 0.5, drone: 0.5, piano: 0.5 });
  
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, { gain: GainNode, source?: any }>>({});
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      if (ctxRef.current) ctxRef.current.close();
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  const initAudio = () => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Create gain nodes for each track
    TRACKS.forEach(track => {
      const gain = ctx.createGain();
      gain.gain.value = 0; // Starts muted
      gain.connect(ctx.destination);
      nodesRef.current[track.id] = { gain };
    });

    // 1. Synthesize "Rain" (Filtered white noise)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 400;
    noiseSource.connect(filter);
    filter.connect(nodesRef.current["rain"].gain);
    noiseSource.start();

    // 2. Synthesize "Heartbeat"
    const playBeat = () => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(nodesRef.current["heart"].gain);
      osc.frequency.value = 50;
      osc.type = "sine";
      g.gain.setValueAtTime(1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    };
    intervalRefs.current["heart"] = setInterval(() => {
      playBeat(); setTimeout(playBeat, 250);
    }, 1000); // 60 BPM

    // 3. Synthesize "Drone"
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "triangle"; osc2.type = "sine";
    osc1.frequency.value = 130.81; // C3
    osc2.frequency.value = 196.00; // G3
    osc1.connect(nodesRef.current["drone"].gain);
    osc2.connect(nodesRef.current["drone"].gain);
    osc1.start(); osc2.start();

    // 4. Synthesize "Piano Drops" (Pentatonic random notes)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C D E G A
    const playNote = () => {
      const f = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(nodesRef.current["piano"].gain);
      osc.type = "sine"; osc.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.start(); osc.stop(ctx.currentTime + 2);
    };
    intervalRefs.current["piano"] = setInterval(() => {
      if (Math.random() > 0.3) playNote();
    }, 1200);

    setIsStarted(true);
  };

  const toggleTrack = (id: string) => {
    const next = new Set(activeTracks);
    if (next.has(id)) {
      next.delete(id);
      nodesRef.current[id].gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.5);
    } else {
      next.add(id);
      nodesRef.current[id].gain.gain.setTargetAtTime(volumes[id], ctxRef.current!.currentTime, 0.5);
    }
    setActiveTracks(next);
  };

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes(prev => ({ ...prev, [id]: val }));
    if (activeTracks.has(id) && ctxRef.current) {
      nodesRef.current[id].gain.gain.setTargetAtTime(val, ctxRef.current.currentTime, 0.1);
    }
  };

  if (!isStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-[#F7F5F0]">
        <div className="absolute inset-0 bg-mesh-2 opacity-50" />
        <div className="max-w-lg w-full text-center relative z-10">
          <Link href="/" className="text-xs text-[#7BA4DB] hover:text-[#1C1B1F] transition-colors tracking-wider uppercase">← Inicio</Link>
          <h1 className="text-4xl md:text-5xl mt-8 mb-3 text-[#1C1B1F]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Caja de <span className="italic text-[#7BA4DB]">Resonancia</span>
          </h1>
          <p className="text-sm text-[#6B6862] leading-[1.8] mb-10 max-w-sm mx-auto">
            Combina capas de sonido generadas en tiempo real para crear un espacio acústico que favorezca tu concentración o descanso.
          </p>
          <button onClick={initAudio} className="btn-primary">
            Activar Mezclador
          </button>
        </div>
      </main>
    );
  }

  // Calculate global mood color based on active tracks
  const getAmbientShadow = () => {
    if (activeTracks.size === 0) return 'none';
    const activeColors = TRACKS.filter(t => activeTracks.has(t.id)).map(t => t.color);
    return `0 0 100px 20px ${activeColors[0]}15`;
  };

  return (
    <main className="min-h-screen px-4 pt-24 pb-16 flex flex-col items-center relative bg-[#FDFDFD] transition-all duration-1000" style={{ boxShadow: `inset ${getAmbientShadow()}` }}>
      <div className="relative z-10 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="text-xs text-[#6B6862] hover:text-[#1C1B1F] transition-colors tracking-wider uppercase">← Inicio</Link>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6862]">Mezclador Activo</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TRACKS.map(track => {
            const isActive = activeTracks.has(track.id);
            return (
              <div key={track.id} className="card-organic p-6 md:p-8 flex flex-col transition-all duration-500"
                   style={{
                     borderColor: isActive ? track.color + '40' : '#E5E0D8',
                     background: isActive ? track.color + '05' : '#FFFFFF',
                   }}>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl text-[#1C1B1F] mb-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{track.label}</h3>
                    <span className="text-xs text-[#6B6862]">{track.desc}</span>
                  </div>
                  <button 
                    onClick={() => toggleTrack(track.id)}
                    className="w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300"
                    style={{ 
                      borderColor: isActive ? track.color : '#E5E0D8',
                      background: isActive ? track.color : 'transparent',
                    }}>
                    <div className={`w-3 h-3 rounded-full transition-colors ${isActive ? 'bg-white' : 'bg-[#E5E0D8]'}`} />
                  </button>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-[9px] uppercase tracking-wider text-[#6B6862] mb-2">
                    <span>Volumen</span>
                    <span>{Math.round(volumes[track.id] * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01"
                    value={volumes[track.id]}
                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                    disabled={!isActive}
                    className="w-full h-1 bg-[#E5E0D8] rounded-full appearance-none outline-none focus:outline-none transition-opacity"
                    style={{ 
                      opacity: isActive ? 1 : 0.3,
                      background: `linear-gradient(to right, ${track.color} ${volumes[track.id]*100}%, #E5E0D8 ${volumes[track.id]*100}%)`
                    }}
                  />
                  {/* Webkit slider thumb styling needs to be in global css, but we can rely on basic appearance here for simplicity */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
