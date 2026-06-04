"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, Environment } from "@react-three/drei";
import Link from "next/link";
import * as THREE from "three";

// ═══════════════════════════════════════════════
// PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
// ═══════════════════════════════════════════════
class LandscapeSynth {
  ctx: AudioContext | null = null;
  nodes: any[] = [];
  isPlaying: boolean = false;
  type: string = "peace";
  timerId: any = null;

  constructor(type: string) {
    this.type = type;
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.isPlaying = true;

      if (this.type === "la-paloma-de-la-paz") {
        this.playPeacePad();
      } else if (this.type === "cano-cristales") {
        this.playRiverNoise();
      } else if (this.type === "valle-cocora") {
        this.playWindNoise(0.04, 300); // Soft valley wind
      } else if (this.type === "condor-andes") {
        this.playWindNoise(0.07, 200); // Deeper mountain wind
      } else if (this.type === "mascaras-teatro") {
        this.playFestivalBeat();
      } else if (this.type === "paleta-artista") {
        this.playCreativeChimes();
      }
    } catch (e) {
      console.error("Failed to start sound synthesis:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.nodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // Helper: Create Noise Buffer
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  // 1. Peace Pad: Lush warm synthesizer chord pad
  playPeacePad() {
    if (!this.ctx) return;
    const freqs = [174.61, 220.0, 261.63, 329.63]; // F3, A3, C4, E4 (Fmaj7 chord)
    
    // Master Gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 3);
    masterGain.connect(this.ctx.destination);
    this.nodes.push(masterGain);

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      
      // Detune slightly for lushness
      osc.detune.setValueAtTime((Math.random() - 0.5) * 15, this.ctx.currentTime);

      // Volume LFO to swell notes
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      lfo.start();
      
      this.nodes.push(osc, lfo, gain, lfoGain);
    });

    // Synthetic birds chirping periodically
    this.timerId = setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      this.triggerBirdChirp();
    }, 4500);
  }

  triggerBirdChirp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    const baseFreq = 1200 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, now);
    // Rapid pitch sweep for a bird chirp
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.4);
  }

  // 2. River Flowing (Caño Cristales)
  playRiverNoise() {
    if (!this.ctx) return;
    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    // LFO to modulate filter frequency to sound like rushing waves
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime); // modulate freq by +/- 150Hz

    // Master Gain
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start();
    lfo.start();

    this.nodes.push(source, lfo, filter, gain, lfoGain);
  }

  // 3. Wind Noise (Valle del Cocora / Cóndor de los Andes)
  playWindNoise(volume: number, filterBaseFreq: number) {
    if (!this.ctx) return;
    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterBaseFreq, this.ctx.currentTime);

    // Slow wind modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(filterBaseFreq * 0.4, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 3);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start();
    lfo.start();

    this.nodes.push(source, lfo, filter, gain, lfoGain);
  }

  // 4. Festival Drums & Ambient Melody (Máscaras del Teatro)
  playFestivalBeat() {
    if (!this.ctx) return;

    // Soft master synths
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    mainGain.connect(this.ctx.destination);
    this.nodes.push(mainGain);

    // Drum beat loop every 750ms
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4 (Pentatonic scale)
    let beatIdx = 0;

    this.timerId = setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      
      // Kick drum trigger on beat 0 and 2
      if (beatIdx % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(mainGain);
        osc.start();
        osc.stop(now + 0.25);
      }

      // Melodic tone trigger
      if (Math.random() > 0.3) {
        const oscMel = this.ctx.createOscillator();
        const gainMel = this.ctx.createGain();
        oscMel.type = "triangle";
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        oscMel.frequency.setValueAtTime(randomNote, now);
        
        gainMel.gain.setValueAtTime(0, now);
        gainMel.gain.linearRampToValueAtTime(0.05, now + 0.05);
        gainMel.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        oscMel.connect(gainMel);
        gainMel.connect(mainGain);
        oscMel.start();
        oscMel.stop(now + 0.75);
      }

      beatIdx = (beatIdx + 1) % 4;
    }, 750);
  }

  // 5. Creative Random Chimes (La Paleta del Artista)
  playCreativeChimes() {
    if (!this.ctx) return;
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    chimeGain.connect(this.ctx.destination);
    this.nodes.push(chimeGain);

    const chimeScale = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // G4, A4, C5, D5, E5, G5, A5

    this.timerId = setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = chimeScale[Math.floor(Math.random() * chimeScale.length)];

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = "sine";
      oscHarmonic.frequency.setValueAtTime(freq * 2, now); // Sweet bell harmonic

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(chimeGain);

      osc.start();
      oscHarmonic.start();
      
      osc.stop(now + 2.8);
      oscHarmonic.stop(now + 2.8);
    }, 2800);
  }
}

interface Hotspot {
  id: number;
  pos: [number, number, number];
  title: string;
  text: string;
}

// ═══════════════════════════════════════════════
// LANDSCAPES DATA & DESCRIPTIONS
// ═══════════════════════════════════════════════
const LANDSCAPES_DATA: Record<
  string,
  {
    title: string;
    subtitle: string;
    image: string;
    color: string;
    accent: string;
    glow: string;
    accentHex: string;
    soundName: string;
    soundType: string;
    soundDesc: string;
    desc: string;
    pedagogy: string;
    defaultVideo: string;
    videoSuggestions: { title: string; url: string }[];
    hotspots: Hotspot[];
  }
> = {
  "la-paloma-de-la-paz": {
    title: "La Paloma de la Paz",
    subtitle: "Símbolo de reconciliación nacional",
    image: "/images/gallery/dove_peace.png",
    color: "#f0f6ff",
    accent: "from-sky-400 to-blue-500",
    glow: "shadow-sky-500/20",
    accentHex: "#3b82f6",
    soundName: "Canto de aves y brisa de paz",
    soundType: "la-paloma-de-la-paz",
    soundDesc: "Brisa suave y cantos de aves silvestres que evocan la tranquilidad del amanecer en los campos colombianos.",
    desc: "La paloma de la paz ha sido un símbolo arraigado en la historia social y artística de Colombia, representando la esperanza, la reconciliación y el anhelo colectivo de un territorio en armonía. A través de la pintura, la escultura y la música, esta figura inspira el perdón y la restauración de la empatía entre las comunidades rurales y urbanas.",
    pedagogy: "Esta experiencia te enseña el valor del perdón y la empatía. Al observar la paloma de la paz, haz una respiración profunda y reflexiona sobre cómo puedes sanar pequeños malentendidos en tu escuela o comunidad, tejiendo lazos firmes de respeto.",
    defaultVideo: "https://www.youtube.com/watch?v=F3GbeE35zWc",
    videoSuggestions: [
      { title: "El significado de la Paz en Colombia", url: "https://www.youtube.com/watch?v=F3GbeE35zWc" },
      { title: "Cuentos para niños sobre la Reconciliación", url: "https://www.youtube.com/watch?v=tT8bpe0bO9M" },
    ],
    hotspots: [
      { id: 1, pos: [-1.2, 1.8, 0.2], title: "El Plumaje Blanco", text: "Las texturas limpias representan la transparencia y la honestidad en el diálogo escolar y social." },
      { id: 2, pos: [1.3, -1.2, 0.2], title: "La Postura Ascendente", text: "Simboliza el vuelo del pensamiento colectivo para superar el conflicto y mirar con optimismo al futuro." }
    ]
  },
  "cano-cristales": {
    title: "Caño Cristales",
    subtitle: "El río de los 7 colores",
    image: "/images/gallery/cano_cristales.png",
    color: "#fff0f5",
    accent: "from-pink-400 to-rose-500",
    glow: "shadow-pink-500/20",
    accentHex: "#f43f5e",
    soundName: "Caudal de río y selva húmeda",
    soundType: "cano-cristales",
    soundDesc: "El fluir constante del agua cristalina sobre las rocas combinado con el murmullo de la selva virgen en La Macarena.",
    desc: "Ubicado en la Sierra de la Macarena, Caño Cristales es considerado el río más hermoso del mundo. Sus aguas cristalinas dejan ver plantas acuáticas endémicas conocidas como Macarenia clavigera, las cuales tiñen el cauce de tonos rosa, rojo, verde y amarillo. Es un santuario de biodiversidad que representa la pureza, la resiliencia de la naturaleza y el renacer de territorios anteriormente aislados.",
    pedagogy: "El río de 7 colores representa la diversidad de nuestras emociones. Así como el agua fluye libre sobre las piedras, permite que tus sentimientos fluyan con creatividad y respeto, celebrando las diferencias cromáticas de tu entorno escolar.",
    defaultVideo: "https://www.youtube.com/watch?v=9_C8T3xY1wM",
    videoSuggestions: [
      { title: "Documental Caño Cristales - Parque Nacional", url: "https://www.youtube.com/watch?v=9_C8T3xY1wM" },
      { title: "Expedición Colombia Biodiversa", url: "https://www.youtube.com/watch?v=7DPh0z5qGqE" },
    ],
    hotspots: [
      { id: 1, pos: [-1.4, 1.2, 0.2], title: "Macarenia Clavigera", text: "Plantas acuáticas endémicas que tiñen el agua de hermosos tonos rojos al recibir los rayos del sol." },
      { id: 2, pos: [1.2, -1.5, 0.2], title: "El Fluir de las Aguas", text: "Las cascadas esculpen la roca milenaria de La Macarena, recordándonos la gran fuerza de la paciencia." }
    ]
  },
  "valle-cocora": {
    title: "Valle del Cocora",
    subtitle: "Palmas de cera y niebla mágica",
    image: "/images/gallery/valle_cocora.png",
    color: "#f0fff4",
    accent: "from-emerald-400 to-green-500",
    glow: "shadow-emerald-500/20",
    accentHex: "#10b981",
    soundName: "Viento andino y susurro de palmeras",
    soundType: "valle-cocora",
    soundDesc: "Brisa de montaña y susurros de las palmas más altas del mundo entre la neblina mística andina.",
    desc: "El Valle del Cocora, ubicado en el departamento del Quindío, es el hogar de la majestuosa Palma de Cera, el árbol nacional de Colombia que alcanza alturas de hasta 60 metros. Este imponente paisaje andino, a menudo envuelto en una niebla mística y rodeado de bosques de niebla templados, evoca una profunda sensación de asombro y nos invita a reflexionar sobre la preservación de la vida silvestre y el patrimonio natural.",
    pedagogy: "Las altas palmas representan nuestra resiliencia y rectitud moral. Mantente firme frente a las dificultades escolares, buscando siempre el bienestar colectivo y apoyándote en tus compañeros de clase como un bosque de palmas unidas.",
    defaultVideo: "https://www.youtube.com/watch?v=N6T2c2R6rM8",
    videoSuggestions: [
      { title: "Valle de Cocora en Drone 4K", url: "https://www.youtube.com/watch?v=N6T2c2R6rM8" },
      { title: "Conservación de la Palma de Cera Nacional", url: "https://www.youtube.com/watch?v=r0d9hG6o0Wc" },
    ],
    hotspots: [
      { id: 1, pos: [-1.3, 2.2, 0.2], title: "Copa de la Palma", text: "La palma de cera llega a medir 60 metros de alto para buscar la luz del sol, representando la superación." },
      { id: 2, pos: [1.4, -0.8, 0.2], title: "La Neblina Andina", text: "Bosques de niebla que recogen el agua de la atmósfera para regar las cuencas de los ríos cafeteros." }
    ]
  },
  "condor-andes": {
    title: "El Cóndor de los Andes",
    subtitle: "Majestuosidad, soberanía y libertad",
    image: "/images/gallery/condor_andes.png",
    color: "#fffcf0",
    accent: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/20",
    accentHex: "#f59e0b",
    soundName: "Eco del páramo y viento de altura",
    soundType: "condor-andes",
    soundDesc: "El eco del viento gélido chocando con los frailejones en la inmensidad del páramo andino colombiano.",
    desc: "El Cóndor de los Andes es el ave voladora más grande del mundo y un símbolo patrio de libertad y soberanía en Sudamérica. Al sobrevolar los páramos y las cumbres más altas de la Cordillera de los Andes colombiana, el cóndor personifica la fuerza espiritual, la libertad de pensamiento y la perspectiva elevada necesaria para tejer la paz en las comunidades.",
    pedagogy: "El cóndor vuela alto para observar todo el territorio con calma. Aprende a tomar perspectiva de las situaciones difíciles de convivencia, observando los problemas desde arriba para encontrar soluciones constructivas y pacíficas.",
    defaultVideo: "https://www.youtube.com/watch?v=jWstL8X2gA0",
    videoSuggestions: [
      { title: "El Soberano del Páramo Andino", url: "https://www.youtube.com/watch?v=jWstL8X2gA0" },
      { title: "Conservación del Cóndor en los Andes", url: "https://www.youtube.com/watch?v=H74tN7e7Hag" },
    ],
    hotspots: [
      { id: 1, pos: [-1.4, 1.6, 0.2], title: "Las Alas Extendidas", text: "Su envergadura de hasta 3 metros le permite planear sin esfuerzo usando las corrientes térmicas andinas." },
      { id: 2, pos: [1.2, -1.4, 0.2], title: "Los Frailejones Sagrados", text: "Plantas que capturan el agua de la niebla para abastecer el 70% del agua potable de Colombia." }
    ]
  },
  "mascaras-teatro": {
    title: "Máscaras del Teatro",
    subtitle: "Expresión, cultura y emoción",
    image: "/images/masks_theater.png",
    color: "#faf5ff",
    accent: "from-violet-400 to-purple-500",
    glow: "shadow-violet-500/20",
    accentHex: "#8b5cf6",
    soundName: "Tambores de carnaval y murmullo festivo",
    soundType: "mascaras-teatro",
    soundDesc: "El eco lejano de tambores folclóricos, gaitas y la alegría colectiva de un carnaval tradicional que sana heridas.",
    desc: "El teatro y sus máscaras son pilares fundamentales de la catarsis y la resiliencia en la cultura colombiana. Desde las representaciones del Carnaval de Barranquilla hasta las comparsas comunitarias de paz, las máscaras permiten a los jóvenes exteriorizar emociones, transitar del dolor a la alegría y jugar a ser constructores de nuevas realidades a través de la dramaturgia.",
    pedagogy: "Las máscaras artísticas nos invitan a comprender y validar nuestras emociones. Explora tus gestos y sentimientos para descubrir nuevas formas pacíficas de comunicarte sin máscaras de orgullo o enojo.",
    defaultVideo: "https://www.youtube.com/watch?v=1F_UuHq-fR8",
    videoSuggestions: [
      { title: "Carnavales de Colombia e Identidad", url: "https://www.youtube.com/watch?v=1F_UuHq-fR8" },
      { title: "Teatro Comunitario por la Reconciliación", url: "https://www.youtube.com/watch?v=yYJ4pL-K9qY" },
    ],
    hotspots: [
      { id: 1, pos: [-1.2, 1.4, 0.2], title: "La Sonrisa Expresiva", text: "La sonrisa en la máscara simboliza la resiliencia y la capacidad de transformar la tristeza en arte." },
      { id: 2, pos: [1.2, -1.2, 0.2], title: "Los Trazos y Colores", text: "Los patrones corporales y folclóricos narran historias de libertad de las comparsas de paz colombianas." }
    ]
  },
  "paleta-artista": {
    title: "La Paleta del Artista",
    subtitle: "El color como lenguaje integrador",
    image: "/images/palette_art.png",
    color: "#f0fdfa",
    accent: "from-teal-400 to-cyan-500",
    glow: "shadow-teal-500/20",
    accentHex: "#14b8a6",
    soundName: "Pinceladas y melodía inspiradora",
    soundType: "paleta-artista",
    soundDesc: "El roce sutil del pincel sobre el lienzo acompañado de una suave melodía de piano que fomenta la creatividad.",
    desc: "La paleta del artista representa la infinita diversidad cromática de nuestro país y la capacidad de transformar realidades duras en lienzos llenos de esperanza. El color no es solo decoración, es un lenguaje que expresa el dolor, la sanación, la memoria histórica y la alegría de vivir de los colombianos que deciden cambiar pinceles por armas y apostar por la paz.",
    pedagogy: "La paleta de pintura te enseña que no hay colores correctos o incorrectos, sino mezclas armoniosas. Aprende a cooperar con otros mezclando tus habilidades creativas para crear un gran mural escolar de paz.",
    defaultVideo: "https://www.youtube.com/watch?v=Qh_i747C8uY",
    videoSuggestions: [
      { title: "El color como terapia social en el aula", url: "https://www.youtube.com/watch?v=Qh_i747C8uY" },
      { title: "Muralistas que sanan las calles colombianas", url: "https://www.youtube.com/watch?v=P72uI9Jb5S0" },
    ],
    hotspots: [
      { id: 1, pos: [-1.3, 1.5, 0.2], title: "El Pincel de la Empatía", text: "La herramienta para trazar acuerdos de paz y plasmar de forma sensible las emociones en el aula." },
      { id: 2, pos: [1.2, -1.1, 0.2], title: "La Mezcla Cromática", text: "La combinación de diferentes tonos representa la belleza y riqueza de la diversidad humana en el colegio." }
    ]
  },
};

// ═══════════════════════════════════════════════
// 3D CARD COMPONENT FOR R3F CANVAS
// ═══════════════════════════════════════════════
function ThreeLandscapeCard({
  image,
  accentColor,
  color,
  mousePointer,
  isMobile,
}: {
  image: string;
  accentColor: string;
  color: string;
  mousePointer: THREE.Vector2;
  isMobile: boolean;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, image);

  const scale = isMobile ? 0.55 : 1.0;

  useFrame((state) => {
    if (!cardRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Slow hovering animation
    cardRef.current.position.y = 0.15 + Math.sin(t * 0.5) * 0.12;
    cardRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;

    // React to mouse movement
    cardRef.current.rotation.x = THREE.MathUtils.lerp(
      cardRef.current.rotation.x,
      mousePointer.y * 0.25,
      0.05
    );
    cardRef.current.rotation.y = THREE.MathUtils.lerp(
      cardRef.current.rotation.y,
      mousePointer.x * 0.25,
      0.05
    );
  });

  return (
    <group ref={cardRef} position={[0, 0.15, 0]} scale={[scale, scale, scale]}>
      {/* Main Texture Image - Frameless, Pure & Self-Luminous */}
      <mesh castShadow>
        <planeGeometry args={[4.6, 6.0]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════
// 3D WAVE TERRAIN SHADER / SIMULATOR
// ═══════════════════════════════════════════════
function Interactive3DTerrain({ accentColor }: { accentColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const pos = geometry.attributes.position;
    const time = state.clock.elapsedTime * 1.2;

    // Animate vertices to look like flowing river waves or dynamic hills
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 0.3 + time) * 0.25 +
        Math.cos(y * 0.3 + time) * 0.25 +
        Math.sin((x + y) * 0.15 + time * 1.5) * 0.15;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.8, 0]}
      receiveShadow
    >
      <planeGeometry args={[24, 24, 24, 24]} />
      <meshStandardMaterial
        color={accentColor}
        roughness={0.5}
        metalness={0.4}
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════
// SENSORY DUST PARTICLES COMPONENT
// ═══════════════════════════════════════════════
function SensoryParticles({ count = 200, type = "peace", color = "#3b82f6" }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12; // X
      pos[i * 3 + 1] = Math.random() * 8 - 4;  // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8; // Z
      spds[i] = 0.01 + Math.random() * 0.02;
    }
    return [pos, spds];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    const posAttr = geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (type === "cano-cristales") {
        // Swirling vortex river flow particles
        arr[idx] += Math.sin(time * 0.5 + arr[idx + 1]) * 0.005;
        arr[idx + 1] -= speeds[i] * 0.7; // fall
        arr[idx + 2] += Math.cos(time * 0.5 + arr[idx]) * 0.005;
      } else if (type === "valle-cocora" || type === "condor-andes") {
        // Floating mist / heavy wind gust particles
        arr[idx] += speeds[i] * 2.5; // Wind moving left-to-right
        arr[idx + 1] += Math.sin(time * 0.3 + i) * 0.003;
      } else {
        // Peace / Palette / Theater: floating bubbles rising slowly
        arr[idx + 1] += speeds[i]; // rise
        arr[idx] += Math.sin(time * 0.6 + i) * 0.004;
      }

      // Reset particles if they go out of range
      if (arr[idx + 1] > 4 && type !== "cano-cristales") arr[idx + 1] = -4;
      if (arr[idx + 1] < -4 && type === "cano-cristales") arr[idx + 1] = 4;
      if (arr[idx] > 6 && (type === "valle-cocora" || type === "condor-andes")) arr[idx] = -6;
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════
// CAMERA CONTROLLER & MOUSE PARALLAX RIG
// ═══════════════════════════════════════════════
function CameraRig({ mousePointer }: { mousePointer: THREE.Vector2 }) {
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    // Smoothly pan camera based on mouse position
    vec.set(
      mousePointer.x * 1.2,
      0.2 + mousePointer.y * 0.6,
      6.2 + Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    );
    state.camera.position.lerp(vec, 0.035);
    state.camera.lookAt(0, 0.2, 0);
  });
  return null;
}

// ═══════════════════════════════════════════════
// MAIN LANDSCAPE EXPERIENCE COMPONENT
// ═══════════════════════════════════════════════
export default function LandscapeExperience3D({
  landscapeId,
}: {
  landscapeId: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [soundActive, setSoundActive] = useState(false);
  const [synthMode, setSynthMode] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [customVideoId, setCustomVideoId] = useState<string | null>(null);

  // Hotspots & Accessibility voice state
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isReading, setIsReading] = useState(false);

  // Mouse tracker
  const mousePointer = useMemo(() => new THREE.Vector2(0, 0), []);

  const data = LANDSCAPES_DATA[landscapeId] || LANDSCAPES_DATA["la-paloma-de-la-paz"];

  // Instantiate procedural synthesizer
  const synth = useMemo(() => new LandscapeSynth(data.soundType), [data.soundType]);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates for 3D parallax
    const handleMouseMove = (e: MouseEvent) => {
      mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Fetch video URL dynamically from DB API
    const fetchVideoUrl = async () => {
      try {
        const res = await fetch("/api/landscape-videos");
        if (res.ok) {
          const dict = await res.json();
          const dbUrl = dict[landscapeId];
          if (dbUrl) {
            setVideoUrl(dbUrl);
            parseVideoUrl(dbUrl);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load landscape video URL from DB, using default.", err);
      }
      
      // Fallback to default
      setVideoUrl(data.defaultVideo);
      parseVideoUrl(data.defaultVideo);
    };

    fetchVideoUrl();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      synth.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [landscapeId, synth, data.defaultVideo, mousePointer]);

  // Handle ambient sound toggle
  const toggleSound = () => {
    if (soundActive) {
      synth.stop();
      setSoundActive(false);
    } else {
      synth.start();
      setSoundActive(true);
    }
  };

  // Handle reading aloud poetic narration (Option D: Accessibility voice)
  const toggleSpeech = () => {
    if (typeof window === "undefined") return;
    const speech = window.speechSynthesis;
    if (!speech) return alert("Tu navegador no soporta lectura por voz.");

    if (isReading) {
      speech.cancel();
      setIsReading(false);
    } else {
      const textToRead = `Paisaje: ${data.title}. ${data.subtitle}. ${data.desc} Guía del estudiante: ${data.pedagogy}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "es-CO"; // Colombian Spanish voice
      utterance.rate = 0.95; // Calm pace
      
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      speech.speak(utterance);
      setIsReading(true);
    }
  };

  // Extract YouTube ID or direct URL properties
  const parseVideoUrl = (url: string) => {
    if (!url) {
      setCustomVideoId(null);
      return;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      setCustomVideoId(match[2]);
    } else {
      setCustomVideoId(null);
    }
  };

  // Save video URL input
  const handleSaveVideo = (url: string) => {
    localStorage.setItem(`video-url-${landscapeId}`, url);
    setVideoUrl(url);
    parseVideoUrl(url);
  };

  // Play synthetic tone when user clicks on 3D Space (Sensory Synth)
  const triggerSynthNote = () => {
    if (!synth.ctx) return;
    const now = synth.ctx.currentTime;
    const osc = synth.ctx.createOscillator();
    const gainNode = synth.ctx.createGain();

    osc.type = "sine";
    const frequencies = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // Beautiful Pentatonic
    const note = frequencies[Math.floor(Math.random() * frequencies.length)];
    osc.frequency.setValueAtTime(note, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Simple echo/delay effect node
    const delay = synth.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.3, now);
    const feedback = synth.ctx.createGain();
    feedback.gain.setValueAtTime(0.4, now);

    osc.connect(gainNode);
    gainNode.connect(synth.ctx.destination);

    // Connect to echo
    gainNode.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(synth.ctx.destination);

    osc.start();
    osc.stop(now + 2.0);
  };

  if (!mounted) return null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* ═══ 3D CANVAS HEADER / FLOATING CONTROLS ═══ */}
      <div className="relative w-full flex flex-col md:block h-auto md:h-[86vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 md:overflow-hidden">
        
        {/* Responsive Container for 3D Canvas */}
        <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-full md:absolute md:inset-0 z-10">
          <Canvas
            shadows
            camera={{ position: [0, 0.2, 6.2], fov: 50 }}
            gl={{ antialias: true }}
            onClick={() => {
              if (soundActive) triggerSynthNote();
            }}
          >
            <fog attach="fog" args={["#020617", 4.5, 9.5]} />
            
            {/* Custom Ambient lighting */}
            <ambientLight intensity={0.35} color="#f8fafc" />
            
            {/* Main spotlight to cast dynamic shadow of card */}
            <spotLight
              position={[0, 8, 4.5]}
              angle={0.8}
              penumbra={1}
              intensity={7}
              color={data.accentHex}
              castShadow
            />

            {/* Camera controller rig */}
            <CameraRig mousePointer={mousePointer} />

            {/* Dynamic 3D card & Environment wrapped in Suspense */}
            <Suspense fallback={null}>
              <ThreeLandscapeCard
                image={data.image}
                accentColor={data.accentHex}
                color={data.color}
                mousePointer={mousePointer}
                isMobile={isMobile}
              />
              <Environment preset="night" />
            </Suspense>

            {/* Interactive HTML Hotspots (Option C) */}
            {data.hotspots && data.hotspots.map((hs) => (
              <group key={hs.id} position={hs.pos}>
                <Html center>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hs);
                    }}
                    className="w-8 h-8 bg-yellow-400 text-slate-900 border-2 border-white rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(234,179,8,0.8)] hover:scale-125 active:scale-95 transition-all animate-ping"
                    style={{ animationDuration: "2.5s" }}
                  >
                    ✨
                  </button>
                </Html>
              </group>
            ))}

            {/* Immersive deforming wave terrain */}
            <Interactive3DTerrain accentColor={data.accentHex} />

            {/* Sensory customized particles */}
            <SensoryParticles count={280} type={data.soundType} color={data.accentHex} />
          </Canvas>
        </div>

        {/* UI Control Panel - Glassmorphism Responsive Sidebar */}
        <div className="relative md:absolute bottom-0 left-0 md:bottom-8 md:left-8 z-20 w-full md:w-96 backdrop-blur-md bg-slate-950/75 border-t md:border border-white/10 p-6 md:rounded-3xl shadow-2xl select-none flex flex-col gap-4">
          <div>
            <span className="bg-yellow-400/20 text-yellow-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest inline-block mb-3">
              🇨🇴 Paisaje de Colombia
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {data.title}
            </h2>
            <p className="text-white/45 text-xs md:text-sm font-semibold mt-1">
              {data.subtitle}
            </p>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Option D: Accessibility Narrator Button */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">
              Audio-Narrativa (Accesibilidad):
            </p>
            <button
              onClick={toggleSpeech}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95
                ${isReading 
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40" 
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
            >
              {isReading ? "⏸️ Detener Voz" : "🗣️ Activar Narrador"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">
              🎧 Experiencia Sensorial:
            </p>
            <p className="text-white/40 text-[11px] leading-relaxed">
              {data.soundDesc}
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            <button
              onClick={toggleSound}
              className={`w-full font-bold py-3 px-5 rounded-2xl text-xs md:text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg
                ${
                  soundActive
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 text-white font-extrabold hover:brightness-110"
                }`}
            >
              <span>{soundActive ? "⏸️ Detener Audio" : "🔊 Iniciar Audio Ambiental"}</span>
            </button>

            {soundActive && (
              <div className="text-center py-2 px-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl animate-fade-in">
                <p className="text-emerald-400 text-[11px] font-extrabold flex items-center justify-center gap-1.5 animate-pulse">
                  <span>✨</span> ¡Haz clics en el espacio 3D para tocar sintetizador!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hotspot Floating Detail Overlay (Option C) */}
        {selectedHotspot && (
          <div className="relative md:absolute md:top-20 md:right-6 z-30 w-full md:max-w-xs backdrop-blur-md bg-slate-900/80 border-2 border-yellow-400/40 p-5 rounded-3xl shadow-2xl animate-fade-in text-white select-none my-2 md:my-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Sabías que...
              </span>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-white/40 hover:text-white font-extrabold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-extrabold text-white mb-1.5">{selectedHotspot.title}</h4>
            <p className="text-white/70 text-xs font-semibold leading-relaxed">{selectedHotspot.text}</p>
          </div>
        )}
      </div>

      {/* ═══ SCROLLING DETAIL SECTION & VIDEO UPLOAD ═══ */}
      <div className="w-full max-w-4xl px-4 md:px-8 py-16 flex flex-col gap-14 bg-slate-950">
        
        {/* Landscape Information Card */}
        <section className="bg-slate-900/60 rounded-3xl border border-white/5 p-8 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <span className={`w-8 h-1.5 rounded-full bg-gradient-to-r ${data.accent}`} />
            <p className="text-xs tracking-[0.2em] uppercase text-white/55 font-extrabold">Información Ecoturística e Histórica</p>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            El Latido del Territorio
          </h3>
          
          <p className="text-white/70 text-sm md:text-base leading-relaxed font-semibold mb-6">
            {data.desc}
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🌱</span>
              <h4 className="text-white text-sm md:text-base font-extrabold">Enfoque Pedagógico - Construcción de Paz</h4>
            </div>
            <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed">
              {data.pedagogy}
            </p>
          </div>
        </section>

        {/* Dynamic Video Showcase & Curated Box */}
        <section className="bg-slate-900/60 rounded-3xl border border-white/5 p-8 md:p-10 backdrop-blur-md shadow-2xl flex flex-col gap-8">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-8 h-1.5 rounded-full bg-gradient-to-r ${data.accent}`} />
              <p className="text-xs tracking-[0.2em] uppercase text-white/55 font-extrabold">Recursos Audiovisuales</p>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Explora en Video
            </h3>
            <p className="text-white/40 text-xs md:text-sm font-semibold">
              Video explicativo oficial seleccionado por tu docente para guiar tu aprendizaje sobre este hermoso territorio de paz.
            </p>
          </div>

          {/* Embedded Video Player */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
            {customVideoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${customVideoId}?autoplay=0&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                onError={() => console.log("Video source load error. Trying standard fallback.")}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                <span className="text-4xl animate-pulse">🎥</span>
                <p className="text-white/55 font-bold text-sm">No hay un video de aprendizaje disponible en este momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Back Link bottom */}
        <div className="text-center mt-6">
          <Link
            href="/#colombia-viva"
            className="py-4 px-8 border-2 border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors font-bold rounded-full text-sm inline-block"
          >
            ← Volver al mapa de Colombia Viva
          </Link>
        </div>
      </div>
    </div>
  );
}
