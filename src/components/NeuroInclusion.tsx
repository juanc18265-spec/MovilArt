"use client";

import { useState, useEffect, useRef } from "react";
import Reveal from "./Reveal";

interface ConditionData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  definition: string;
  classroomManifestation: string;
  artisticFocus: string;
  practicalAppStrategy: string;
  classroomTips: string[];
}

const CONDITIONS: ConditionData[] = [
  {
    id: "tdah",
    name: "TDAH",
    emoji: "⚡",
    color: "from-amber-400 to-orange-500",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50/50",
    definition: "El Trastorno por Déficit de Atención e Hiperactividad es una condición del neurodesarrollo que influye en cómo el cerebro procesa la concentración, regula los impulsos y canaliza la energía física.",
    classroomManifestation: "En el aula, se observa como dificultad para seguir instrucciones largas, distractibilidad ante pequeños estímulos, inquietud motora constante (moverse en el asiento) e impulsividad al responder o tomar turnos.",
    artisticFocus: "Canalizar la energía mediante el arte cinético y altamente táctil. Se deben dividir los procesos en micro-desafíos estructurados que ofrezcan recompensas visuales inmediatas para mantener la dopamina y el interés altos.",
    practicalAppStrategy: "El 'Lienzo Táctil' con pintura continua y efectos mágicos interactivos, junto con el 'Piano Didáctico' de guía visual amarilla y confeti inmediato, son ideales. Mantienen la atención activa a través del feedback sensorial instantáneo sin provocar frustración por fallas.",
    classroomTips: [
      "Divide los proyectos artísticos en pasos cortos (máximo 10 minutos por paso).",
      "Permite que realicen actividades de pie o usando técnicas que impliquen movimiento de todo el cuerpo (ej. muralismo o modelado de arcilla).",
      "Dale un rol activo en la organización de los materiales para canalizar su inquietud motora de forma positiva."
    ]
  },
  {
    id: "dislexia",
    name: "Dislexia",
    emoji: "✏️",
    color: "from-blue-400 to-indigo-500",
    borderColor: "border-indigo-200",
    bgColor: "bg-indigo-50/50",
    definition: "La dislexia es una condición de origen neurobiológico que afecta el procesamiento fonológico y la decodificación verbal, lo que repercute directamente en la fluidez de lectura y ortografía.",
    classroomManifestation: "En el aula, se nota cuando un estudiante confunde el orden o la orientación de letras (como b/d o p/q), lee de forma lenta o pausada, y tiene dificultades para memorizar instrucciones que son 100% basadas en texto.",
    artisticFocus: "Potenciar el pensamiento visual y espacial como un lenguaje alternativo de baja carga cognitiva. Las artes visuales puras, el color y la música permiten al alumno expresarse con total elocuencia y asimilar conceptos abstractos sin la barrera de la lectoescritura.",
    practicalAppStrategy: "Las 'Galerías Sensoriales 3D' de Colombia Viva eliminan la presión textual. Permiten al estudiante sumergirse en paisajes sonoros y formas monumentales autoiluminadas, asimilando conceptos sobre la paz, la identidad y la naturaleza a través del canal visual y auditivo.",
    classroomTips: [
      "Sustituye bloques largos de texto por diagramas, iconos de colores y elementos visuales.",
      "Evalúa sus ideas a través de dibujos, mapas conceptuales visuales o maquetas en lugar de ensayos escritos largos.",
      "Usa fuentes amigables para dislexia y contrastes altos de fondo oscuro (como nuestro modo 3D premium)."
    ]
  },
  {
    id: "discalculia",
    name: "Discalculia",
    emoji: "🧩",
    color: "from-teal-400 to-emerald-500",
    borderColor: "border-teal-200",
    bgColor: "bg-teal-50/50",
    definition: "La discalculia es una condición específica del aprendizaje que afecta la adquisición de habilidades matemáticas, dificultando la comprensión del sentido numérico, proporciones y secuencias.",
    classroomManifestation: "En el aula, se hace visible cuando el estudiante tiene problemas severos para contar colecciones de objetos, estimar proporciones visuales en un dibujo, orientarse en el plano del papel o comprender secuencias de tiempo y ritmo.",
    artisticFocus: "Abordar la matemática de forma intuitiva, física y estética. El arte utiliza patrones geométricos, simetrías, ritmos y escalas. Esto permite al cerebro asimilar las relaciones espaciales y de cantidad mediante estímulos tangibles, acústicos y de color.",
    practicalAppStrategy: "El minijuego de 'Mezcla Cromática' (proporciones de color sin números) y el 'Rompecabezas Espacial' (organización de capas arriba-abajo) entrenan de forma lúdica las habilidades visuoespaciales. De igual forma, el 'Oído Rítmico' traduce secuencias numéricas en ritmos acústicos intuitivos.",
    classroomTips: [
      "Enseña matemáticas y geometría a través del arte: patrones de mosaicos, origami y plegado de papel.",
      "Utiliza colores específicos para representar cantidades o proporciones en lugar de números abstractos.",
      "Permite el uso de herramientas físicas de medición y comparación táctil (regletas coloreadas, bloques táctiles)."
    ]
  }
];

// Datos del Test TDAH
const TDAH_KEYWORDS = ["sensibilidad", "creatividad", "inclusión", "expresión", "sentidos"];
const TDAH_TEXT_WORDS = [
  "La", "educación", "artística", "es", "un", "pilar", "de", "sensibilidad", "y", 
  "creatividad.", "Fomenta", "la", "inclusión", "y", "permite", "la", "libre", "expresión", 
  "de", "las", "emociones,", "logrando", "que", "el", "arte", "sea", "el", "canal", "que", 
  "conecte", "los", "sentidos", "con", "el", "aprendizaje."
];

const TDAH_DISTRACTIONS = [
  "¡Mira afuera! Un pajarito 🐦",
  "Tengo hambre... ¿Qué cenaré hoy? 🍕",
  "¿El profesor me estará mirando? 😳",
  "¡Mensaje de WhatsApp! 📱",
  "Qué aburrida esta clase... 💤",
  "Tengo calor en el salón 🥵",
  "Necesito mover el pie ya 🦶",
  "Ese foco hace un zumbido... 💡"
];

// Texto base de Dislexia
const DYSLEXIA_BASE_TEXT = 
  "La educación artística es un derecho fundamental estipulado en el Artículo 67. Desarrolla la sensibilidad, la creatividad y fomenta el pensamiento crítico en los niños y jóvenes, permitiéndoles transformar la sociedad desde la empatía.";

export default function NeuroInclusion() {
  const [activeTab, setActiveTab] = useState<string>("tdah");
  const [showSim, setShowSim] = useState<boolean>(false);
  const [simFilter, setSimFilter] = useState<string>("none");

  // ==========================================
  // ESTADOS DEL TEST TDAH (Atención)
  // ==========================================
  const [tdahState, setTdahState] = useState<"idle" | "playing" | "completed">("idle");
  const [tdahTimer, setTdahTimer] = useState<number>(25);
  const [tdahFoundWords, setTdahFoundWords] = useState<string[]>([]);
  const [tdahDistractionsClicked, setTdahDistractionsClicked] = useState<number>(0);
  const [tdahActiveDistractions, setTdahActiveDistractions] = useState<any[]>([]);
  const [tdahAudioMuted, setTdahAudioMuted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);
  const tdahIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // ESTADOS DEL TEST DISLEXIA (Lectura)
  // ==========================================
  const [dislexiaState, setDislexiaState] = useState<"idle" | "reading" | "questioning" | "completed">("idle");
  const [dyslexiaText, setDyslexiaText] = useState(DYSLEXIA_BASE_TEXT);
  const [dislexiaUseRuler, setDislexiaUseRuler] = useState<boolean>(false);
  const [dislexiaRulerY, setDislexiaRulerY] = useState<number>(100);
  const [dislexiaTimeElapsed, setDislexiaTimeElapsed] = useState<number>(0);
  const [dislexiaAnswers, setDislexiaAnswers] = useState<Record<number, number>>({});
  const dislexiaTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preguntas de Dislexia
  const dislexiaQuestions = [
    {
      id: 1,
      q: "1. ¿Qué ertículo de la consbitución se mencione en el qárrafo?",
      options: ["Artículu 12", "Artículu 67", "Artículu 100"],
      correct: 1 // Articulo 67
    },
    {
      id: 2,
      q: "2. ¿Qué deserrulla y qubencia le mediación ertístice?",
      options: ["La memuria y repetición", "La senzibilidad, creabividad y emqatía", "El cálculu metabático"],
      correct: 1 // La sensibilidad...
    },
    {
      id: 3,
      q: "3. ¿Dezde dunde ze qusca trensformar le zociedad?",
      options: ["Dezde le emqatía", "Dezde le tecnolugía", "Dezde le ecunomía"],
      correct: 0 // Desde la empatía
    }
  ];

  // ==========================================
  // ESTADOS DEL TEST DISCALCULIA (Números y Proporciones)
  // ==========================================
  const [discalculiaState, setDiscalculiaState] = useState<"idle" | "round1" | "round2" | "round3" | "completed">("idle");
  const [discalculiaScore, setDiscalculiaScore] = useState<number>(0);
  const [discalculiaTimer, setDiscalculiaTimer] = useState<number>(0);
  const [calcSymbolsMirrored, setCalcSymbolsMirrored] = useState<boolean>(false);
  const [calcDotsCount, setCalcDotsCount] = useState<number>(6);
  const [calcDotsPositions, setCalcDotsPositions] = useState<any[]>([]);
  const [round3Positions, setRound3Positions] = useState<number[]>([5, 6, 7, 8]);
  const [selectedProportion, setSelectedProportion] = useState<number | null>(null);

  // ==========================================
  // EFEСТO AUDITIVO TDAH (Web Audio API)
  // ==========================================
  const startTdahAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      // Detener nodos previos
      stopTdahAudio();

      // 1. Zumbido de fondo (Filtro sutil)
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = "sine";
      oscLow.frequency.setValueAtTime(60, ctx.currentTime); // Zumbido eléctrico de 60Hz
      gainLow.gain.setValueAtTime(tdahAudioMuted ? 0 : 0.08, ctx.currentTime);
      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
      oscLow.start();
      audioNodesRef.current.push(oscLow, gainLow);

      // 2. Ruido blanco intermitente (Simula aire acondicionado o murmullos de fondo)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(tdahAudioMuted ? 0 : 0.015, ctx.currentTime);
      noiseSource.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start();
      audioNodesRef.current.push(noiseSource, noiseGain);

      // 3. Reloj Tic-Tac incesante
      const clockInterval = setInterval(() => {
        if (!ctx || tdahAudioMuted || ctx.state !== "running") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }, 1000);

      // Guardar el intervalo para limpiarlo
      (window as any).tdahClockInterval = clockInterval;

    } catch (e) {
      console.warn("Web Audio API no soportado o bloqueado", e);
    }
  };

  const stopTdahAudio = () => {
    audioNodesRef.current.forEach(node => {
      try { node.disconnect(); node.stop(); } catch(e) {}
    });
    audioNodesRef.current = [];
    if ((window as any).tdahClockInterval) {
      clearInterval((window as any).tdahClockInterval);
      (window as any).tdahClockInterval = null;
    }
  };

  // Efecto para mutear volumen al presionar botón
  useEffect(() => {
    if (audioNodesRef.current.length > 0) {
      const gainNodes = audioNodesRef.current.filter(n => n.gain !== undefined);
      if (gainNodes.length >= 2) {
        // gainLow
        gainNodes[0].gain.setValueAtTime(tdahAudioMuted ? 0 : 0.08, audioCtxRef.current?.currentTime || 0);
        // noiseGain
        gainNodes[1].gain.setValueAtTime(tdahAudioMuted ? 0 : 0.015, audioCtxRef.current?.currentTime || 0);
      }
    }
  }, [tdahAudioMuted]);

  // Limpiar audios al desmontar o cambiar de simulador
  useEffect(() => {
    return () => {
      stopTdahAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);


  // ==========================================
  // LÓGICA DE DYN-SCRAMBLE PARA DISLEXIA
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simFilter === "dislexia" || dislexiaState === "reading" || dislexiaState === "questioning") {
      interval = setInterval(() => {
        const words = DYSLEXIA_BASE_TEXT.split(" ");
        const scrambled = words.map(word => {
          if (word.length <= 3 || Math.random() > 0.4) return word;
          const chars = word.split("");
          
          // Reemplazar aleatoriamente letras con simetrías visuales (b/d, p/q, a/e, u/n)
          for (let i = 0; i < chars.length; i++) {
            if (Math.random() > 0.7) {
              if (chars[i] === 'b') chars[i] = 'd';
              else if (chars[i] === 'd') chars[i] = 'b';
              else if (chars[i] === 'p') chars[i] = 'q';
              else if (chars[i] === 'q') chars[i] = 'p';
              else if (chars[i] === 'a') chars[i] = 'e';
              else if (chars[i] === 'e') chars[i] = 'a';
              else if (chars[i] === 'u') chars[i] = 'n';
              else if (chars[i] === 'n') chars[i] = 'u';
            }
          }
          
          // Intercambiar letras internas en palabras largas
          if (chars.length > 4 && Math.random() > 0.6) {
            const idx1 = 1 + Math.floor(Math.random() * (chars.length - 2));
            const idx2 = 1 + Math.floor(Math.random() * (chars.length - 2));
            const temp = chars[idx1];
            chars[idx1] = chars[idx2];
            chars[idx2] = temp;
          }
          
          return chars.join("");
        });
        setDyslexiaText(scrambled.join(" "));
      }, 350);
    } else {
      setDyslexiaText(DYSLEXIA_BASE_TEXT);
    }
    return () => clearInterval(interval);
  }, [simFilter, dislexiaState]);


  // ==========================================
  // EJECUCIÓN DEL BUCLE DEL RETO TDAH
  // ==========================================
  useEffect(() => {
    if (tdahState === "playing") {
      setTdahTimer(25);
      setTdahFoundWords([]);
      setTdahDistractionsClicked(0);
      setTdahActiveDistractions([]);
      startTdahAudio();

      // Temporizador principal
      tdahIntervalRef.current = setInterval(() => {
        setTdahTimer((prev) => {
          if (prev <= 1) {
            clearInterval(tdahIntervalRef.current!);
            setTdahState("completed");
            stopTdahAudio();
            return 0;
          }
          return prev - 1;
        });

        // Lanzar una distracción aleatoria cada 2.5 segundos con 60% de probabilidad
        if (Math.random() > 0.4) {
          const text = TDAH_DISTRACTIONS[Math.floor(Math.random() * TDAH_DISTRACTIONS.length)];
          const id = Date.now() + Math.random();
          const newDistraction = {
            id,
            text,
            x: 10 + Math.random() * 60, // porcentaje del ancho
            y: 10 + Math.random() * 60, // porcentaje de alto
            delay: Math.random() * 2,
          };
          setTdahActiveDistractions((prev) => [...prev, newDistraction]);

          // Auto-eliminar la distracción tras 4 segundos si no la clickean
          setTimeout(() => {
            setTdahActiveDistractions((prev) => prev.filter(d => d.id !== id));
          }, 5000);
        }
      }, 1000);

    } else {
      if (tdahIntervalRef.current) clearInterval(tdahIntervalRef.current);
      stopTdahAudio();
    }

    return () => {
      if (tdahIntervalRef.current) clearInterval(tdahIntervalRef.current);
      stopTdahAudio();
    };
  }, [tdahState]);


  // ==========================================
  // EJECUCIÓN DEL TIMER DE LECTURA DE DISLEXIA
  // ==========================================
  useEffect(() => {
    if (dislexiaState === "reading") {
      setDislexiaTimeElapsed(0);
      setDislexiaAnswers({});
      dislexiaTimerRef.current = setInterval(() => {
        setDislexiaTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (dislexiaTimerRef.current) clearInterval(dislexiaTimerRef.current);
    }
    return () => {
      if (dislexiaTimerRef.current) clearInterval(dislexiaTimerRef.current);
    };
  }, [dislexiaState]);


  // ==========================================
  // EFECTO DE SÍMBOLOS PARPADEANTES - DISCALCULIA
  // ==========================================
  useEffect(() => {
    let symInterval: NodeJS.Timeout;
    let posInterval: NodeJS.Timeout;

    if (discalculiaState !== "idle" && discalculiaState !== "completed") {
      // 1. Efecto de espejado de números cada 1.2 segundos
      symInterval = setInterval(() => {
        setCalcSymbolsMirrored(prev => !prev);
      }, 1200);

      // 2. Mezclar posiciones en Ronda 3 para simular desorden espacial continuo
      if (discalculiaState === "round3") {
        posInterval = setInterval(() => {
          setRound3Positions(prev => [...prev].sort(() => Math.random() - 0.5));
        }, 1600);
      }
    }
    return () => {
      clearInterval(symInterval);
      clearInterval(posInterval);
    };
  }, [discalculiaState]);

  // Generador de puntos flotantes para Discalculia Ronda 1 (Subitización)
  const generateDots = () => {
    const totalDots = 5 + Math.floor(Math.random() * 4); // Entre 5 y 8 círculos
    setCalcDotsCount(totalDots);
    const newPositions = Array.from({ length: totalDots }).map((_, i) => ({
      id: i,
      x: 15 + Math.random() * 70, // porcentaje
      y: 15 + Math.random() * 60, // porcentaje
      size: 16 + Math.random() * 16, // px
      delay: Math.random() * 2
    }));
    setCalcDotsPositions(newPositions);
  };

  useEffect(() => {
    if (discalculiaState === "round1") {
      generateDots();
    }
  }, [discalculiaState]);


  // ==========================================
  // MANEJADORES DE CLICS E INTERACCIÓN
  // ==========================================
  const handleWordClick = (word: string) => {
    if (tdahState !== "playing") return;
    const cleanWord = word.toLowerCase().replace(/[.,;:?¿!¡()]/g, "");
    if (TDAH_KEYWORDS.includes(cleanWord) && !tdahFoundWords.includes(cleanWord)) {
      const updated = [...tdahFoundWords, cleanWord];
      setTdahFoundWords(updated);
      // Si encuentra las 5 palabras, termina exitosamente
      if (updated.length === TDAH_KEYWORDS.length) {
        setTdahState("completed");
        stopTdahAudio();
      }
    }
  };

  const handleDyslexiaAnswer = (qId: number, optionIdx: number) => {
    setDislexiaAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleDislexiaSubmit = () => {
    setDislexiaState("completed");
  };

  const calculateDyslexiaScore = () => {
    let correctCount = 0;
    dislexiaQuestions.forEach((q) => {
      if (dislexiaAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleDiscalculiaRound1 = (answer: number) => {
    if (answer === calcDotsCount) {
      setDiscalculiaScore(prev => prev + 1);
    }
    setSelectedProportion(null);
    setDiscalculiaState("round2");
  };

  const handleDiscalculiaRound2 = (choiceIdx: number) => {
    if (choiceIdx === 1) { // 2:1 es la opción index 1
      setDiscalculiaScore(prev => prev + 1);
    }
    setDiscalculiaState("round3");
  };

  const handleDiscalculiaRound3 = (answer: number) => {
    if (answer === 7) { // 4 + 3 = 7
      setDiscalculiaScore(prev => prev + 1);
    }
    setDiscalculiaState("completed");
  };


  const currentCondition = CONDITIONS.find((c) => c.id === activeTab) || CONDITIONS[0];

  return (
    <div className="w-full">
      {/* Estilos embebidos para animaciones premium fluidas */}
      <style>{`
        @keyframes float-distractor {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float-dist {
          animation: float-distractor 3.5s ease-in-out infinite;
        }
        @keyframes dot-wander {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(8px, -8px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-dot-wander {
          animation: dot-wander 5s ease-in-out infinite;
        }
        .reading-ruler-overlay {
          background: rgba(234, 179, 8, 0.15);
          border-top: 3px solid rgb(234, 179, 8);
          border-bottom: 3px solid rgb(234, 179, 8);
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
          pointer-events: none;
          transition: top 0.08s ease-out;
        }
        .dyslexic-mirror {
          display: inline-block;
          transform: scaleX(-1);
        }
        .dyslexic-rotate {
          display: inline-block;
          transform: rotate(180deg);
        }
      `}</style>

      {/* Cabecera de la Sección */}
      <Reveal>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-10 h-[2px] bg-gradient-to-r from-teal-500 to-transparent rounded-full"></span>
            <p className="text-xs tracking-[0.25em] uppercase text-teal-600 font-extrabold">🧠 Aula Diversa & Inclusiva</p>
            <span className="w-10 h-[2px] bg-gradient-to-l from-teal-500 to-transparent rounded-full"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
            Mentes Diversas:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600">
              Inclusión y Neurodiversidad
            </span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            El arte es el traductor universal. En una aula típica, del <strong>10% al 15%</strong> de los estudiantes presentan formas únicas de procesar la información. Esta sección ofrece herramientas prácticas para que los docentes medien y potencien las capacidades de alumnos con TDAH, Dislexia y Discalculia mediante la expresión artística.
          </p>
        </div>
      </Reveal>

      {/* Selector de Pestañas Interactivas */}
      <Reveal delay={100}>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
          {CONDITIONS.map((cond) => {
            const isActive = cond.id === activeTab;
            return (
              <button
                key={cond.id}
                onClick={() => {
                  setActiveTab(cond.id);
                  // Apagar filtros del simulador si cambian de tab para evitar cruces
                  setSimFilter(cond.id);
                }}
                className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md ${
                  isActive
                    ? `bg-gradient-to-r ${cond.color} text-white shadow-lg scale-105`
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span className="text-xl sm:text-2xl">{cond.emoji}</span>
                <span>{cond.name}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Contenido Principal de la Pestaña */}
      <Reveal delay={200}>
        <div className={`card-organic p-6 sm:p-10 border-2 ${currentCondition.borderColor} ${currentCondition.bgColor} transition-all duration-500 rounded-3xl shadow-xl relative overflow-hidden`}>
          
          {/* Fondo sutil decorativo */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="grid lg:grid-cols-12 gap-8 relative z-10">
            {/* Columna Izquierda: Definición e Impacto */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{currentCondition.emoji}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    ¿Cómo entender el {currentCondition.name} en el aula?
                  </h3>
                </div>
                
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  {currentCondition.definition}
                </p>

                <div className="bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-white/80 mb-6 shadow-xs">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>🏫</span> Manifestación en el Salón de Clases
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                    {currentCondition.classroomManifestation}
                  </p>
                </div>

                <div className="bg-white/90 p-5 rounded-2xl border-l-4 border-teal-500 shadow-xs">
                  <h4 className="font-bold text-teal-800 text-sm sm:text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>🎨</span> Enfoque de Mediación Artística
                  </h4>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                    {currentCondition.artisticFocus}
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Estrategia en App y Consejos */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="bg-white/85 p-6 rounded-2xl border border-slate-200/60 shadow-xs flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span>📲</span> Estrategia en MovilArt Studio
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                    {currentCondition.practicalAppStrategy}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span>💡</span> Consejos Prácticos para el Docente
                  </h4>
                  <ul className="space-y-3">
                    {currentCondition.classroomTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                        <span className="text-teal-500 mt-1">✔</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Simulador de Empatía Sensorial Premium */}
      <Reveal delay={300}>
        <div className="mt-10 bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 relative overflow-hidden">
          {/* Fondo sutil */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 opacity-90 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold flex items-center gap-3 text-teal-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span>🕹️</span> Simulador de Empatía Sensorial
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
                  Experimenta en carne propia cómo influyen los filtros y barreras sensoriales y cognitivas en tus estudiantes mediante desafíos reales interactivos.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSim(!showSim);
                  if (!showSim) {
                    setSimFilter(activeTab); // Sincronizar automáticamente con el tab activo
                  } else {
                    setSimFilter("none");
                    setTdahState("idle");
                    setDislexiaState("idle");
                    setDiscalculiaState("idle");
                    stopTdahAudio();
                  }
                }}
                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg transform hover:scale-105 ${
                  showSim
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-teal-500/10"
                }`}
              >
                {showSim ? "Ocultar Simulador ✕" : "Probar Simulador Profesional 🕹️"}
              </button>
            </div>

            {showSim && (
              <div className="grid lg:grid-cols-12 gap-8 anim-fade-in">
                {/* Panel de Controles / Filtros */}
                <div className="lg:col-span-4 space-y-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Selecciona una condición a simular:</p>
                  
                  <button
                    onClick={() => {
                      setSimFilter("tdah");
                      setTdahState("idle");
                      setDislexiaState("idle");
                      setDiscalculiaState("idle");
                      stopTdahAudio();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between cursor-pointer transition-all ${
                      simFilter === "tdah"
                        ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/10 scale-[1.02]"
                        : "bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚡</span>
                      <div>
                        <p className="font-extrabold text-sm">Simulador de TDAH</p>
                        <p className={`text-[10px] ${simFilter === 'tdah' ? 'text-slate-900' : 'text-slate-500'}`}>Saturación y distractores</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">PROBAR TEST →</span>
                  </button>

                  <button
                    onClick={() => {
                      setSimFilter("dislexia");
                      setTdahState("idle");
                      setDislexiaState("idle");
                      setDiscalculiaState("idle");
                      stopTdahAudio();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between cursor-pointer transition-all ${
                      simFilter === "dislexia"
                        ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/10 scale-[1.02]"
                        : "bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✏️</span>
                      <div>
                        <p className="font-extrabold text-sm">Simulador de Dislexia</p>
                        <p className={`text-[10px] ${simFilter === 'dislexia' ? 'text-blue-200' : 'text-slate-500'}`}>Decodificación inestable</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">PROBAR TEST →</span>
                  </button>

                  <button
                    onClick={() => {
                      setSimFilter("discalculia");
                      setTdahState("idle");
                      setDislexiaState("idle");
                      setDiscalculiaState("idle");
                      stopTdahAudio();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between cursor-pointer transition-all ${
                      simFilter === "discalculia"
                        ? "bg-teal-500 border-teal-400 text-slate-950 shadow-lg shadow-teal-500/10 scale-[1.02]"
                        : "bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🧩</span>
                      <div>
                        <p className="font-extrabold text-sm">Simulador de Discalculia</p>
                        <p className={`text-[10px] ${simFilter === 'discalculia' ? 'text-slate-900' : 'text-slate-500'}`}>Espacialidad numérica</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">PROBAR TEST →</span>
                  </button>

                  <button
                    onClick={() => {
                      setSimFilter("none");
                      setTdahState("idle");
                      setDislexiaState("idle");
                      setDiscalculiaState("idle");
                      stopTdahAudio();
                    }}
                    className={`w-full py-3 rounded-xl border border-dashed text-xs font-bold cursor-pointer transition-all ${
                      simFilter === "none"
                        ? "bg-slate-800 border-slate-600 text-white"
                        : "bg-transparent border-slate-800 hover:bg-slate-900 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Restaurar Filtro (Vista Estándar)
                  </button>

                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
                    <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-2">
                      <span>💡</span> Consejo pedagógico:
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      El objetivo no es que sea imposible pasar, sino que sientas el tremendo gasto de energía mental adicional que requiere completar tareas sencillas con estas condiciones.
                    </p>
                  </div>
                </div>

                {/* Área Interactiva del Simulador */}
                <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 relative flex flex-col items-center justify-center min-h-[26rem] overflow-hidden">
                  
                  {/* FONDOS ORGÁNICOS SEGÚN FILTRO */}
                  <div className="absolute inset-0 pointer-events-none opacity-5 transition-all duration-700">
                    {simFilter === "tdah" && <div className="absolute inset-0 bg-radial-gradient from-amber-500 to-transparent blur-3xl" />}
                    {simFilter === "dislexia" && <div className="absolute inset-0 bg-radial-gradient from-blue-500 to-transparent blur-3xl" />}
                    {simFilter === "discalculia" && <div className="absolute inset-0 bg-radial-gradient from-teal-500 to-transparent blur-3xl" />}
                  </div>

                  {/* ======================================================== */}
                  {/* ---------- CASO 1: SIMULACIÓN DE TDAH ---------- */}
                  {/* ======================================================== */}
                  {simFilter === "tdah" && (
                    <div className="w-full relative z-10 flex flex-col h-full justify-between flex-1">
                      
                      {/* Estado: INICIO (Idle) */}
                      {tdahState === "idle" && (
                        <div className="text-center my-auto max-w-md mx-auto">
                          <span className="text-5xl animate-bounce inline-block mb-4">⚡</span>
                          <h4 className="text-xl font-extrabold text-amber-400 mb-2">Reto de Atención Selectiva</h4>
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                            Encuentra y haz clic en las <strong>5 palabras clave de arte</strong> ocultas en el texto en menos de <strong>25 segundos</strong>.
                            <br /><br />
                            Al iniciar, se activará una <strong>sobrecarga auditiva</strong> y burbujas con tus propios <strong>pensamientos e impulsos</strong> flotarán bloqueando tu vista.
                          </p>
                          <button
                            onClick={() => setTdahState("playing")}
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:brightness-110 cursor-pointer text-sm tracking-wide"
                          >
                            Iniciar Reto de Empatía TDAH 🚀
                          </button>
                        </div>
                      )}

                      {/* Estado: JUGANDO (Playing) */}
                      {tdahState === "playing" && (
                        <div className="flex flex-col h-full justify-between flex-1 select-none relative">
                          {/* Cabecera del test */}
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black animate-pulse">
                                ⏱️ {tdahTimer}s restantes
                              </span>
                              <span className="text-xs text-slate-400 font-bold">
                                Encontradas: {tdahFoundWords.length}/5
                              </span>
                            </div>

                            {/* Controles de sonido */}
                            <button
                              onClick={() => setTdahAudioMuted(!tdahAudioMuted)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-bold border border-slate-700/50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              {tdahAudioMuted ? "🔇 Silenciado" : "🔊 Sobrecarga Audio Activa"}
                            </button>
                          </div>

                          {/* Pista de palabras por buscar */}
                          <div className="mb-4 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex flex-wrap gap-2 justify-center">
                            <p className="text-[11px] font-black text-amber-500 w-full text-center uppercase tracking-wider mb-1">
                              Encuentra y haz clic en estas palabras exactas:
                            </p>
                            {TDAH_KEYWORDS.map((w) => {
                              const isFound = tdahFoundWords.includes(w);
                              return (
                                <span
                                  key={w}
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
                                    isFound
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 line-through"
                                      : "bg-slate-800 text-slate-400 border-slate-700"
                                  }`}
                                >
                                  {w}
                                </span>
                              );
                            })}
                          </div>

                          {/* Contenedor del Texto con Distracciones Físicas */}
                          <div className="relative p-6 bg-slate-950 border border-slate-850 rounded-2xl min-h-[12rem] flex items-center justify-center overflow-hidden">
                            
                            {/* Renderizado de palabras interactivas */}
                            <div className="relative z-10 flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed text-sm md:text-base font-semibold max-w-xl text-slate-200">
                              {TDAH_TEXT_WORDS.map((word, idx) => {
                                const clean = word.toLowerCase().replace(/[.,;:?¿!¡()]/g, "");
                                const isTarget = TDAH_KEYWORDS.includes(clean);
                                const isFound = tdahFoundWords.includes(clean);

                                return (
                                  <span
                                    key={idx}
                                    onClick={() => handleWordClick(word)}
                                    className={`transition-all duration-100 rounded px-0.5 cursor-pointer ${
                                      isTarget
                                        ? isFound
                                          ? "text-emerald-400 bg-emerald-500/10 font-bold border-b-2 border-emerald-500 animate-pulse"
                                          : "hover:bg-amber-500/20 hover:text-amber-300 font-bold border-b-2 border-dashed border-amber-500/40"
                                        : "hover:bg-slate-800"
                                    }`}
                                  >
                                    {word}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Distracciones flotantes (Thoughts) */}
                            {tdahActiveDistractions.map((d) => (
                              <div
                                key={d.id}
                                style={{
                                  position: "absolute",
                                  left: `${d.x}%`,
                                  top: `${d.y}%`,
                                  animationDelay: `${d.delay}s`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTdahDistractionsClicked(prev => prev + 1);
                                  setTdahActiveDistractions((prev) => prev.filter(item => item.id !== d.id));
                                }}
                                className="absolute z-20 animate-float-dist px-3 py-1.5 rounded-full bg-slate-900 border border-red-500/40 text-rose-300 text-[10px] md:text-xs font-black shadow-2xl cursor-pointer hover:bg-rose-950/80 hover:border-rose-500 transition-colors flex items-center gap-1.5 select-none"
                              >
                                <span>💭 {d.text}</span>
                                <span className="text-[9px] opacity-60 bg-red-950/60 px-1 rounded">✕</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 text-center">
                            <p className="text-[10px] text-slate-500 font-medium">
                              Las palabras del texto cambian y saltan levemente en tu enfoque visual. El zumbido constante drena tu capacidad de atención.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Estado: COMPLETADO (Scorecard) */}
                      {tdahState === "completed" && (
                        <div className="text-center my-auto max-w-lg mx-auto bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
                          <span className="text-4xl">📊</span>
                          <h4 className="text-2xl font-black text-amber-400 mt-2 mb-4">Resultado del Test de Atención</h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Palabras Halladas</p>
                              <p className="text-2xl font-black text-white mt-1">{tdahFoundWords.length} / 5</p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Distracciones Clickeadas</p>
                              <p className="text-2xl font-black text-rose-400 mt-1">{tdahDistractionsClicked}</p>
                            </div>
                          </div>

                          {tdahFoundWords.length === 5 ? (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                              🏆 ¡Reto Superado! Mantuviste una gran concentración a pesar de la cacofonía y los impulsos invasores de distracción.
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                              ⚠️ El tiempo expiró. La sobrecarga sensorial dificultó enormemente leer un párrafo tan corto.
                            </div>
                          )}

                          <div className="text-left text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-5 rounded-2xl border border-slate-850 mb-6 font-medium">
                            <p className="font-extrabold text-amber-400 mb-2">🧠 Reflexión Pedagógica:</p>
                            ¿Notaste lo cansado que es tener que filtrar voluntariamente el zumbido del aula, los tic-tacs de un reloj y tus propios pensamientos de fondo? Un estudiante con TDAH no carece de inteligencia; simplemente, sus "filtros de entrada" están saturados.
                            <br /><br />
                            <strong>Mediación en MovilArt:</strong> Evitamos bloques densos de texto. Usamos micro-desafíos creativos táctiles que ofrecen dopamina inmediata y feedback de logros rápido.
                          </div>

                          <button
                            onClick={() => setTdahState("idle")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3 rounded-xl cursor-pointer transition-all"
                          >
                            Volver a Intentar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* ---------- CASO 2: SIMULACIÓN DE DISLEXIA ---------- */}
                  {/* ======================================================== */}
                  {simFilter === "dislexia" && (
                    <div className="w-full relative z-10 flex flex-col h-full justify-between flex-1">
                      
                      {/* Estado: IDLE */}
                      {dislexiaState === "idle" && (
                        <div className="text-center my-auto max-w-md mx-auto">
                          <span className="text-5xl animate-pulse inline-block mb-4">✏️</span>
                          <h4 className="text-xl font-extrabold text-blue-400 mb-2">Reto de Decodificación y Comprensión</h4>
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                            Experimenta cómo el esfuerzo de procesar letras que rotan, se espejan y flotan afecta directamente tu comprensión lectora.
                            <br /><br />
                            <strong>Tu objetivo:</strong> Leer el fragmento constitucional sobre arte e intentar responder 3 preguntas de opción múltiple al finalizar.
                          </p>
                          <button
                            onClick={() => setDislexiaState("reading")}
                            className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:brightness-110 cursor-pointer text-sm tracking-wide"
                          >
                            Iniciar Reto de Lectura 📖
                          </button>
                        </div>
                      )}

                      {/* Estado: LEYENDO (Reading) */}
                      {dislexiaState === "reading" && (
                        <div className="flex flex-col h-full justify-between flex-1 select-none">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black">
                              ⏱️ Tiempo leyendo: {dislexiaTimeElapsed}s
                            </span>
                            
                            {/* Botón de la Regla de Lectura */}
                            <button
                              onClick={() => setDislexiaUseRuler(!dislexiaUseRuler)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                                dislexiaUseRuler
                                  ? "bg-amber-400 text-slate-950 border-amber-300"
                                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                              }`}
                            >
                              🔖 {dislexiaUseRuler ? "Desactivar Regla Amarilla" : "Activar Regla de Lectura"}
                            </button>
                          </div>

                          {/* Contenedor de Lectura */}
                          <div 
                            onMouseMove={(e) => {
                              if (dislexiaUseRuler) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDislexiaRulerY(e.clientY - rect.top);
                              }
                            }}
                            className="relative p-6 bg-slate-950 border border-slate-850 rounded-2xl min-h-[12rem] flex items-center justify-center overflow-hidden cursor-crosshair"
                          >
                            {/* Regla de lectura móvil */}
                            {dislexiaUseRuler && (
                              <div 
                                className="absolute left-0 right-0 reading-ruler-overlay" 
                                style={{ 
                                  top: `${dislexiaRulerY - 18}px`,
                                  height: "36px",
                                }}
                              />
                            )}

                            {/* Párrafo interactivo disléxico */}
                            <p className="relative z-10 text-base md:text-lg font-medium leading-loose text-slate-200 max-w-xl text-justify select-none filter blur-[0.4px]">
                              {dyslexiaText.split(" ").map((word, wIdx) => {
                                // Aplicar transformaciones visuales aleatorias por letra
                                return (
                                  <span key={wIdx} className="inline-block mr-1.5">
                                    {word.split("").map((char, cIdx) => {
                                      // Simular distorsión de letras específicas en dislexia
                                      const isUnstable = ['b', 'd', 'p', 'q', 'u', 'n'].includes(char.toLowerCase());
                                      const shouldMirror = isUnstable && Math.random() > 0.85;
                                      
                                      return (
                                        <span 
                                          key={cIdx} 
                                          className={`inline-block transition-transform duration-300 ${
                                            shouldMirror ? (Math.random() > 0.5 ? 'dyslexic-mirror' : 'dyslexic-rotate') : ''
                                          }`}
                                        >
                                          {char}
                                        </span>
                                      );
                                    })}
                                  </span>
                                );
                              })}
                            </p>
                          </div>

                          <div className="mt-4 text-center">
                            <p className="text-[11px] text-slate-500 font-bold mb-4">
                              ¿Sientes el agotamiento visual tratando de estabilizar las palabras? ¡La regla amarilla ayuda a anclar tu enfoque por renglón!
                            </p>
                            <button
                              onClick={() => setDislexiaState("questioning")}
                              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-xl transition-all cursor-pointer shadow-lg"
                            >
                              Terminar de Leer y Responder Test 📋
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Estado: RESPONDIENDO PREGUNTAS (Questioning) */}
                      {dislexiaState === "questioning" && (
                        <div className="flex flex-col h-full justify-between flex-1">
                          <div className="border-b border-slate-800 pb-3 mb-4">
                            <h4 className="text-base font-black text-blue-400">Evaluación de Comprensión Lectora</h4>
                            <p className="text-xs text-slate-400">Demuestra qué tanto lograste asimilar del texto a pesar de la inestabilidad de las letras.</p>
                          </div>

                          <div className="space-y-6 max-h-[18rem] overflow-y-auto pr-2 select-none">
                            {dislexiaQuestions.map((q) => (
                              <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                                <p className="text-xs sm:text-sm font-extrabold text-slate-200 mb-3 leading-relaxed">
                                  {q.q.split(" ").map((word, wIdx) => {
                                    // Poner distorsión muy ligera también a las preguntas
                                    return (
                                      <span key={wIdx} className="inline-block mr-1">
                                        {word.split("").map((char, cIdx) => {
                                          const shouldMirror = ['b', 'd', 'p', 'q'].includes(char.toLowerCase()) && Math.random() > 0.9;
                                          return (
                                            <span key={cIdx} className={`inline-block ${shouldMirror ? 'dyslexic-mirror' : ''}`}>
                                              {char}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    );
                                  })}
                                </p>
                                <div className="grid sm:grid-cols-3 gap-2">
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = dislexiaAnswers[q.id] === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        onClick={() => handleDyslexiaAnswer(q.id, optIdx)}
                                        className={`p-2.5 rounded-lg text-xs font-bold border transition-all text-left cursor-pointer ${
                                          isSelected
                                            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleDislexiaSubmit}
                            disabled={Object.keys(dislexiaAnswers).length < 3}
                            className={`w-full font-black py-4 rounded-xl transition-all mt-4 cursor-pointer shadow-lg ${
                              Object.keys(dislexiaAnswers).length < 3
                                ? "bg-slate-800 text-slate-650 cursor-not-allowed border border-slate-750"
                                : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:brightness-115"
                            }`}
                          >
                            Finalizar Test y Ver Resultados 📊
                          </button>
                        </div>
                      )}

                      {/* Estado: COMPLETADO (Resultados) */}
                      {dislexiaState === "completed" && (
                        <div className="text-center my-auto max-w-lg mx-auto bg-slate-900 border border-blue-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
                          <span className="text-4xl">📊</span>
                          <h4 className="text-2xl font-black text-blue-400 mt-2 mb-4">Evaluación de Lectura Realizada</h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tiempo Empleado</p>
                              <p className="text-2xl font-black text-white mt-1">{dislexiaTimeElapsed} segundos</p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Respuestas Correctas</p>
                              <p className="text-2xl font-black text-emerald-400 mt-1">{calculateDyslexiaScore()} / 3</p>
                            </div>
                          </div>

                          <div className="text-left text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-5 rounded-2xl border border-slate-850 mb-6 font-medium">
                            <p className="font-extrabold text-blue-400 mb-2">🧠 Reflexión Pedagógica:</p>
                            Cuando un estudiante sin dislexia lee, gasta el <strong>15%</strong> de su energía en <em>decodificar</em> letras y el <strong>85%</strong> en <em>comprender</em> el significado.
                            <br /><br />
                            Para un estudiante con dislexia, esto se **invierte**: gasta el **85%** de su esfuerzo en desenredar, rotar y anclar los símbolos en su mente, dejándole solo el **15%** para comprender. ¡Esto provoca agotamiento cerebral severo en tan solo unos minutos!
                            <br /><br />
                            <strong>Mediación en MovilArt:</strong> Minimizamos los muros de texto. Las Galerías 3D de Colombia Viva y el color en vez de letras actúan como lenguajes alternos y liberadores.
                          </div>

                          <button
                            onClick={() => setDislexiaState("idle")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3 rounded-xl cursor-pointer transition-all"
                          >
                            Volver a Intentar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* ---------- CASO 3: SIMULACIÓN DE DISCALCULIA ---------- */}
                  {/* ======================================================== */}
                  {simFilter === "discalculia" && (
                    <div className="w-full relative z-10 flex flex-col h-full justify-between flex-1">
                      
                      {/* Estado: IDLE */}
                      {discalculiaState === "idle" && (
                        <div className="text-center my-auto max-w-md mx-auto">
                          <span className="text-5xl animate-pulse inline-block mb-4">🧩</span>
                          <h4 className="text-xl font-extrabold text-teal-400 mb-2">Reto de Procesamiento Numérico</h4>
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                            La discalculia altera la capacidad natural de estimar magnitudes (subitización), calcular proporciones y retener secuencias numéricas.
                            <br /><br />
                            Completa <strong>3 mini-desafíos de lógica y proporciones</strong> donde los números y figuras cambian de tamaño y posición de forma inestable.
                          </p>
                          <button
                            onClick={() => {
                              setDiscalculiaScore(0);
                              setDiscalculiaState("round1");
                            }}
                            className="bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:brightness-110 cursor-pointer text-sm tracking-wide"
                          >
                            Iniciar Test Discalculia 📐
                          </button>
                        </div>
                      )}

                      {/* Ronda 1: Subitización */}
                      {discalculiaState === "round1" && (
                        <div className="flex flex-col h-full justify-between flex-1">
                          <div className="border-b border-slate-800 pb-3 mb-4">
                            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase">Fase 1: Subitización Instantánea</span>
                            <h4 className="text-sm font-extrabold text-slate-200 mt-2">¿Cuántos círculos azules hay en el lienzo? Intenta responder al instante, sin contarlos uno a uno.</h4>
                          </div>

                          {/* Lienzo con figuras flotando */}
                          <div className="relative w-full h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850">
                            {calcDotsPositions.map((dot) => (
                              <div
                                key={dot.id}
                                className="absolute bg-radial-gradient from-cyan-400 to-blue-600 rounded-full animate-dot-wander"
                                style={{
                                  left: `${dot.x}%`,
                                  top: `${dot.y}%`,
                                  width: `${dot.size}px`,
                                  height: `${dot.size}px`,
                                  animationDelay: `${dot.delay}s`,
                                  boxShadow: "0 0 10px rgba(6, 182, 212, 0.4)",
                                }}
                              />
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-500 text-center mt-3 mb-4">
                            La estimación de cantidades pequeñas se ve bloqueada por el movimiento y la falta de un sentido intuitivo del número.
                          </p>

                          {/* Botones numéricos inestables */}
                          <div className="grid grid-cols-4 gap-3">
                            {[5, 6, 7, 8].map((num) => (
                              <button
                                key={num}
                                onClick={() => handleDiscalculiaRound1(num)}
                                className={`p-4 bg-slate-900 border border-slate-800 rounded-xl font-black text-xl transition-all cursor-pointer hover:bg-slate-800 hover:border-teal-500/40 text-teal-400 ${
                                  calcSymbolsMirrored ? "dyslexic-mirror" : ""
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ronda 2: Proporciones de Color */}
                      {discalculiaState === "round2" && (
                        <div className="flex flex-col h-full justify-between flex-1">
                          <div className="border-b border-slate-800 pb-3 mb-4">
                            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase">Fase 2: Proporción Visual Artística</span>
                            <h4 className="text-sm font-extrabold text-slate-200 mt-2">
                              En el arte usamos proporciones espaciales. Selecciona la mezcla que tiene exactamente <strong>2 partes de azul por 1 de amarillo (Proporción 2:1)</strong>.
                            </h4>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 my-auto">
                            {/* Proporción 1:1 */}
                            <button
                              onClick={() => setSelectedProportion(0)}
                              className={`p-4 bg-slate-950 border rounded-2xl text-left cursor-pointer transition-all flex flex-col items-center gap-3 ${
                                selectedProportion === 0 ? "border-amber-400 bg-amber-500/5" : "border-slate-850 hover:bg-slate-900"
                              }`}
                            >
                              <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-blue-600 flex-1 w-full" />
                                <div className="bg-amber-400 flex-1 w-full" />
                              </div>
                              <span className="text-xs font-black text-slate-300">Mezcla A (Proporción 1:1)</span>
                            </button>

                            {/* Proporción 2:1 (Correcta) */}
                            <button
                              onClick={() => setSelectedProportion(1)}
                              className={`p-4 bg-slate-950 border rounded-2xl text-left cursor-pointer transition-all flex flex-col items-center gap-3 ${
                                selectedProportion === 1 ? "border-teal-400 bg-teal-500/5" : "border-slate-850 hover:bg-slate-900"
                              }`}
                            >
                              <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-blue-600 h-[66%] w-full" />
                                <div className="bg-amber-400 h-[34%] w-full" />
                              </div>
                              <span className="text-xs font-black text-slate-300">Mezcla B (Proporción 2:1)</span>
                            </button>

                            {/* Proporción 5:1 */}
                            <button
                              onClick={() => setSelectedProportion(2)}
                              className={`p-4 bg-slate-950 border rounded-2xl text-left cursor-pointer transition-all flex flex-col items-center gap-3 ${
                                selectedProportion === 2 ? "border-amber-400 bg-amber-500/5" : "border-slate-850 hover:bg-slate-900"
                              }`}
                            >
                              <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-blue-600 h-[83%] w-full" />
                                <div className="bg-amber-400 h-[17%] w-full" />
                              </div>
                              <span className="text-xs font-black text-slate-300">Mezcla C (Proporción 5:1)</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDiscalculiaRound2(selectedProportion ?? 0)}
                            disabled={selectedProportion === null}
                            className={`w-full py-3.5 rounded-xl font-black mt-4 transition-all shadow-md ${
                              selectedProportion === null
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750"
                                : "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 hover:brightness-110"
                            }`}
                          >
                            Confirmar Mezcla y Avanzar 🎨
                          </button>
                        </div>
                      )}

                      {/* Ronda 3: Memoria de Trabajo Simbólica */}
                      {discalculiaState === "round3" && (
                        <div className="flex flex-col h-full justify-between flex-1">
                          <div className="border-b border-slate-800 pb-3 mb-4">
                            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase">Fase 3: Memoria de Trabajo Simbólica</span>
                            <h4 className="text-sm font-extrabold text-slate-200 mt-2">
                              Resuelve rápido mentalmente y responde: ¿Cuánto es <strong>4 pinceles verdes + 3 pinceles rojos</strong>?
                            </h4>
                          </div>

                          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 text-center my-auto flex flex-col items-center justify-center min-h-[6rem]">
                            <div className="flex items-center gap-3 text-xl font-bold">
                              <span className="text-teal-400 font-extrabold">✏️ ✏️ ✏️ ✏️</span>
                              <span className="text-slate-500 font-extrabold">+</span>
                              <span className="text-rose-400 font-extrabold">✏️ ✏️ ✏️</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium mt-3">
                              ¡Los números de los botones de respuesta a continuación saltan espacialmente y se invierten para simular la desorientación analógica!
                            </span>
                          </div>

                          {/* Botones que cambian de orden y se espejan dinámicamente */}
                          <div className="grid grid-cols-4 gap-3 mt-4">
                            {round3Positions.map((num) => (
                              <button
                                key={num}
                                onClick={() => handleDiscalculiaRound3(num)}
                                className={`p-4 bg-slate-900 border border-slate-800 rounded-xl font-black text-xl text-teal-400 hover:bg-slate-800 hover:border-teal-500/40 cursor-pointer transition-all duration-300 ${
                                  calcSymbolsMirrored ? "dyslexic-mirror" : ""
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estado: COMPLETADO (Scorecard) */}
                      {discalculiaState === "completed" && (
                        <div className="text-center my-auto max-w-lg mx-auto bg-slate-900 border border-teal-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
                          <span className="text-4xl">🧩</span>
                          <h4 className="text-2xl font-black text-teal-400 mt-2 mb-4">Evaluación Lógico-Matemática</h4>
                          
                          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aciertos del Test</p>
                            <p className="text-4xl font-black text-teal-300 mt-2">{discalculiaScore} / 3</p>
                          </div>

                          <div className="text-left text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-5 rounded-2xl border border-slate-850 mb-6 font-medium">
                            <p className="font-extrabold text-teal-400 mb-2">🧠 Reflexión Pedagógica:</p>
                            Para un estudiante con discalculia, los símbolos abstractos como <strong>"7"</strong> o <strong>"3"</strong> no representan instantáneamente un tamaño o volumen de objetos; son jeroglíficos resbaladizos y sin anclaje visual.
                            <br /><br />
                            <strong>Mediación en MovilArt:</strong> 
                            En vez de memorizar fórmulas, enseñamos conceptos geométricos y ritmos de manera auditiva e intuitiva. Las proporciones de color de nuestro test demuestran que es posible resolver y diseñar con éxito sin verse obstaculizado por la ansiedad matemática.
                          </div>

                          <button
                            onClick={() => setDiscalculiaState("idle")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3 rounded-xl cursor-pointer transition-all"
                          >
                            Volver a Intentar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* ---------- CASO ESTÁNDAR: SIMULADOR INACTIVO ---------- */}
                  {/* ======================================================== */}
                  {simFilter === "none" && (
                    <div className="text-center z-10 max-w-sm">
                      <span className="text-5xl block mb-4 animate-pulse">🧠</span>
                      <h4 className="text-slate-200 text-lg font-bold mb-2">Filtro de Empatía Inactivo</h4>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                        Usa los botones de la izquierda para seleccionar un simulador e interactuar con los desafíos del TDAH, la Dislexia o la Discalculia.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
