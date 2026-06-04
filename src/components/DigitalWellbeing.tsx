"use client";

import { useState } from "react";
import Reveal from "./Reveal";

interface Tip {
  title: string;
  desc: string;
  icon: string;
}

const FAMILY_TIPS: Tip[] = [
  {
    title: "Zonas Libres de Pantallas",
    desc: "Establecer áreas sagradas en el hogar (como el comedor y las habitaciones) donde los celulares estén prohibidos, fomentando el diálogo cara a cara.",
    icon: "🍽️",
  },
  {
    title: "El Celular como Puente de Co-creación",
    desc: "Evita el uso de pantallas como 'anestesia' o 'niñera'. Si tu hijo usa el móvil, que sea para crear juntos: tomar fotos artísticas de la naturaleza o jugar minijuegos interactivos de MovilArt que promuevan la conversación.",
    icon: "🎨",
  },
  {
    title: "Ayuno Digital Nocturno",
    desc: "Apagar todas las pantallas al menos 1 hora antes de dormir. La luz azul suprime la melatonina, alterando el ciclo del sueño y provocando irritabilidad al día siguiente.",
    icon: "🌙",
  },
  {
    title: "Contratos de Tiempo Consciente",
    desc: "Acordar con el niño tiempos diarios de uso de forma democrática. Al finalizar, invitarlo a hacer una transición activa a una actividad física (pintar, armar legos, pasear).",
    icon: "📜",
  },
];

const TEACHER_TIPS: Tip[] = [
  {
    title: "Uso Híbrido y Pedagógico",
    desc: "No prohibir el dispositivo, sino transformarlo en herramienta: usar la cámara para documentar texturas en el patio, o medir proporciones visuales reales, conectando la pantalla con lo físico.",
    icon: "📸",
  },
  {
    title: "Transiciones Emocionales Activas",
    desc: "Si los estudiantes han usado tecnología para una actividad (como un test digital), guíalos de regreso al aula mediante un breve ejercicio de respiración o estiramiento táctil.",
    icon: "🧘",
  },
  {
    title: "Neurodiversidad y Pantallas",
    desc: "Para alumnos con TDAH o autismo, las pantallas pueden ser altamente adictivas debido al bucle de dopamina rápido. Estructura el uso con alarmas visuales claras de 'inicio' y 'fin'.",
    icon: "🧠",
  },
  {
    title: "Debates de Ciudadanía Digital",
    desc: "Aprovechar la expresión plástica para que los niños dibujen 'cómo se siente su cerebro' cuando pasan mucho tiempo en el celular, abriendo un canal de autocrítica saludable.",
    icon: "🗣️",
  },
];

export default function DigitalWellbeing() {
  const [screenTime, setScreenTime] = useState<number>(2.5);
  const [activeRole, setActiveRole] = useState<"family" | "school">("family");
  const [activeContrast, setActiveContrast] = useState<"passive" | "active">("active");

  // Lógica de cálculo de diagnóstico
  const getDiagnosis = (hours: number) => {
    if (hours <= 1.5) {
      return {
        title: "Equilibrio Saludable 🌿",
        desc: "El uso de dispositivos es controlado y mínimo. A esta edad, este rango permite al cerebro infantil desarrollarse con excelentes niveles de atención sostenida, reduciendo la ansiedad y favoreciendo el florecimiento de la creatividad manual y el juego analógico.",
        alternative: "¡Tu mente está fresca y receptiva! Te sugerimos realizar la actividad física del 'Lienzo Vivo': busca hojas secas, flores caídas o piedras en el jardín y crea un collage que represente la tranquilidad del viento.",
        color: "from-emerald-400 to-green-500",
        bg: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
        pill: "bg-emerald-200 text-emerald-800",
      };
    } else if (hours <= 3) {
      return {
        title: "Atención Compartida ⚠️",
        desc: "Límite moderado. Aunque está en un rango común, la estimulación lumínica prolongada empieza a competir con las actividades motrices gruesas y la conexión afectiva directa. Es vital vigilar el tipo de contenido consumido y evitar la pasividad extrema.",
        alternative: "Para balancear el esfuerzo visual, prueba a jugar 10 minutos al minijuego de 'Mezcla Cromática' en la app para inspirarte. Luego, apaga la pantalla y recrea esa misma combinación de tonos usando acuarelas o témperas en un papel real.",
        color: "from-amber-400 to-yellow-500",
        bg: "bg-amber-50/70 border-amber-200 text-amber-950",
        pill: "bg-amber-200 text-amber-800",
      };
    } else if (hours <= 5) {
      return {
        title: "Saturación Sensorial ⚡",
        desc: "Rango preocupante. La sobreexposición prolongada a estímulos ultrarápidos sobrecarga la corteza prefrontal, dificultando la autorregulación emocional y el control de impulsos. Es común notar mayor irritabilidad, fatiga mental y aislamiento en el niño.",
        alternative: "¡Es hora de un descanso digital urgente! Te proponemos el 'Reto del Emocionómetro de Papel': dibuja un gran círculo de colores en una hoja física y rasga tiras de papel periódico o revista con tus manos para pegarlas sobre el color que represente tu emoción. Esto liberará la tensión motora acumulada.",
        color: "from-orange-400 to-orange-600",
        bg: "bg-orange-50/70 border-orange-200 text-orange-950",
        pill: "bg-orange-200 text-orange-800",
      };
    } else {
      return {
        title: "Saturación Cognitiva Crítica 🚨",
        desc: "Estado de secuestro atencional. El cerebro infantil está expuesto a descargas masivas de dopamina artificial que alteran la plasticidad relacionada con la concentración a largo plazo. Hay un alto riesgo de desconexión del entorno físico y problemas severos de sueño.",
        alternative: "¡Detén el uso del celular por hoy! Te retamos a un 'Reto de Conexión Táctil': toma plastilina, arcilla o masa de harina y agua, cierra los ojos y moldea una pequeña paloma de la paz sintiendo únicamente la textura y temperatura del material. Devuelve tu atención al mundo físico de forma inmediata.",
        color: "from-rose-500 to-red-600",
        bg: "bg-rose-50/70 border-rose-200 text-rose-950",
        pill: "bg-rose-200 text-rose-800",
      };
    }
  };

  const diagnosis = getDiagnosis(screenTime);
  const currentTips = activeRole === "family" ? FAMILY_TIPS : TEACHER_TIPS;

  return (
    <section id="bienestar" className="relative py-28 px-4 md:px-6 bg-[#FAF9F6] border-t-4 border-dashed border-slate-300 overflow-hidden">
      
      {/* Fondo estético con figuras abstractas */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-teal-200 blur-2xl" />
        <div className="absolute bottom-[15%] right-[5%] w-40 h-40 rounded-full bg-rose-200 blur-2xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Cabecera Profesional */}
        <Reveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-gradient-to-r from-teal-500 to-transparent rounded-full"></span>
              <p className="text-xs tracking-[0.25em] uppercase text-teal-600 font-extrabold">📱 Reflexión y Bienestar Digital</p>
              <span className="w-10 h-[2px] bg-gradient-to-l from-teal-500 to-transparent rounded-full"></span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              Equilibrio en la Era Móvil:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600">
                El Arte como Puente Consciente
              </span>
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
              El celular no es un enemigo, sino un catalizador que requiere **intencionalidad**. En lugar de la prohibición absoluta, el proyecto <strong>MovilArt</strong> propone usar la tecnología como un puente interactivo hacia la creación física, la autorregulación socioemocional y la socialización en el mundo real.
            </p>
          </div>
        </Reveal>

        {/* Panel 1: El Dilema Digital (Interactividad de Contraste) */}
        <Reveal delay={100}>
          <div className="mb-20">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveContrast("passive")}
                className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
                  activeContrast === "passive"
                    ? "bg-rose-500 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                🔴 Consumo Pasivo (Anestesia)
              </button>
              <button
                onClick={() => setActiveContrast("active")}
                className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
                  activeContrast === "active"
                    ? "bg-teal-500 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                🟢 Creación Activa (El Puente)
              </button>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Columna de Texto Contrastante */}
              <div className="md:col-span-7">
                {activeContrast === "passive" ? (
                  <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-2xl font-extrabold text-rose-950 mb-4 flex items-center gap-2">
                      <span>📱</span> El Celular como Pantalla Pasiva
                    </h3>
                    <p className="text-rose-900/80 font-medium mb-6 leading-relaxed">
                      El consumo desatendido de videos rápidos y scroll infinito opera como un anestésico emocional. Al recibir ráfagas de entretenimiento sin esfuerzo, el cerebro de los niños debilita su capacidad para tolerar el aburrimiento y la frustración, esenciales para iniciar procesos creativos genuinos.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex gap-3 text-sm text-rose-900/70 font-semibold">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span><strong>Secuestro de Dopamina:</strong> Estímulos ultra-acelerados que reducen la concentración en el aula física.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-rose-900/70 font-semibold">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span><strong>Aislamiento Relacional:</strong> El dispositivo bloquea la lectura de microexpresiones corporales y la empatía grupal.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-rose-900/70 font-semibold">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span><strong>Fatiga Sensorial y Apatía:</strong> Sobrecarga la vista y la mente, dejando al niño sin energía para pintar o jugar activamente.</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-teal-50/50 border border-teal-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-2xl font-extrabold text-teal-950 mb-4 flex items-center gap-2">
                      <span>🎨</span> El Celular como Lienzo e Instrumento Co-creativo
                    </h3>
                    <p className="text-teal-900/80 font-medium mb-6 leading-relaxed">
                      Cuando la tecnología se usa con propósito, se convierte en un maravilloso amplificador del arte tradicional. Los recursos interactivos (como la música ambiente colombiana, la captura fotográfica de obras y los minijuegos pedagógicos de MovilArt) estimulan la imaginación y conectan al niño con el mundo físico.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex gap-3 text-sm text-teal-900/70 font-semibold">
                        <span className="text-teal-500 font-bold">✔</span>
                        <span><strong>Foco Cognitivo Activo:</strong> La pantalla interactiva como aliada para resolver acertijos artísticos y guiar la motricidad.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-teal-900/70 font-semibold">
                        <span className="text-teal-500 font-bold">✔</span>
                        <span><strong>Herramienta Híbrida:</strong> Usar la cámara para cazar texturas en el jardín, estimulando la exploración del entorno real.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-teal-900/70 font-semibold">
                        <span className="text-teal-500 font-bold">✔</span>
                        <span><strong>Puente de Socialización:</strong> Compartir las galerías 3D de forma presencial, propiciando el debate constructivo y la paz colectiva.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Columna Ilustrativa Dinámica (Visualización de Concepto) */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 transition-all duration-700 bg-gradient-to-tr ${
                    activeContrast === "passive" ? "from-rose-400 to-red-600" : "from-teal-400 to-emerald-600"
                  }`} />
                  <div className={`relative w-48 h-48 rounded-3xl border-4 flex flex-col items-center justify-center p-6 bg-white transition-all duration-500 shadow-xl ${
                    activeContrast === "passive" ? "border-rose-400" : "border-teal-400"
                  }`} style={{ borderRadius: '40px 10px 40px 10px/10px 40px 10px 40px' }}>
                    <span className="text-6xl mb-4 animate-bounce" style={{ animationDuration: "3s" }}>
                      {activeContrast === "passive" ? "😴" : "⚡"}
                    </span>
                    <span className={`text-center font-extrabold text-sm tracking-wider uppercase ${
                      activeContrast === "passive" ? "text-rose-600" : "text-teal-600"
                    }`}>
                      {activeContrast === "passive" ? "Anestesia Pasiva" : "Creación Activa"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

        {/* Panel 2: Calculadora de Equilibrio Digital (Herramienta Práctica Reflexiva) */}
        <Reveal delay={200}>
          <div className="card-organic p-6 sm:p-10 border-2 border-slate-900 bg-white shadow-xl relative overflow-hidden mb-20">
            
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-cyan-500 to-rose-400" />
            
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Explicación y Slider (Izquierda) */}
              <div className="lg:col-span-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span>⏳</span> Calculadora de Equilibrio Digital
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-6">
                  Arrastra el selector para indicar el promedio de horas diarias que el niño pasa frente al móvil. Descubre el impacto en su desarrollo y recibe una propuesta pedagógica alternativa en el mundo real.
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-700 font-extrabold text-xs uppercase tracking-wider">Tiempo de Pantalla Diario:</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-600 bg-teal-50 px-4 py-1.5 rounded-2xl border border-teal-200 flex items-center gap-1">
                      {screenTime} <span className="text-xs font-bold text-teal-800">horas</span>
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={screenTime}
                    onChange={(e) => setScreenTime(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 transition-all"
                  />
                  
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                    <span>0h (Analógico)</span>
                    <span>2h (Límite sano)</span>
                    <span>4h (Saturado)</span>
                    <span>8h+ (Sobrecarga)</span>
                  </div>
                </div>
              </div>

              {/* Diagnóstico Dinámico (Derecha) */}
              <div className="lg:col-span-6">
                <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-500 h-full ${diagnosis.bg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-xs ${diagnosis.pill}`}>
                      DIAGNÓSTICO
                    </span>
                    <h4 className="text-lg sm:text-xl font-extrabold leading-tight">
                      {diagnosis.title}
                    </h4>
                  </div>
                  
                  <p className="text-xs sm:text-sm font-medium leading-relaxed mb-6 border-b border-slate-900/10 pb-6 opacity-90">
                    {diagnosis.desc}
                  </p>

                  <div className="bg-white/90 p-5 rounded-2xl border-l-4 border-slate-900 shadow-xs">
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>🎨</span> Actividad Artística Recomendada:
                    </h5>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {diagnosis.alternative}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

        {/* Panel 3: Decálogo de Buenas Prácticas (Acordeón de Consejos) */}
        <Reveal delay={300}>
          <div>
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Decálogo del Buen Uso
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-lg mx-auto">
                Estrategias prácticas de higiene y bienestar digital adaptadas para cada ámbito de interacción.
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveRole("family")}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
                  activeRole === "family"
                    ? "bg-slate-900 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span>🏠</span> En el Hogar (Familia)
              </button>
              <button
                onClick={() => setActiveRole("school")}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
                  activeRole === "school"
                    ? "bg-slate-900 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span>🏫</span> En el Aula (Docentes)
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {currentTips.map((tip, i) => (
                <div
                  key={tip.title}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex items-start gap-4 hover:border-slate-350"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100 flex-shrink-0 shadow-2xs">
                    {tip.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1.5 flex items-center gap-2">
                      <span className="text-[10px] text-teal-500">0{i+1}.</span> {tip.title}
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cierre reflexivo */}
            <div className="text-center mt-12 bg-white border border-slate-200/80 py-5 px-8 rounded-full max-w-2xl mx-auto shadow-2xs flex items-center justify-center gap-3">
              <span className="text-xl">🕊️</span>
              <p className="text-xs sm:text-sm text-slate-700 font-extrabold">
                &quot;El arte educa el ojo que la pantalla hiperestimulada a veces ciega.&quot; — MovilArt Pedagógico.
              </p>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
