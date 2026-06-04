"use client";
import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const MODULES = [
  {
    id: 1, icon: "🧠", title: "Fundamentos de la Regulación Emocional", color: "#10B981", // Green
    duration: "45 min", level: "Introductorio",
    intro: "La regulación emocional es la capacidad de gestionar y responder a una experiencia emocional de forma socialmente aceptable y suficientemente flexible para permitir reacciones espontáneas, así como la capacidad de demorar reacciones espontáneas cuando sea necesario.",
    sections: [
      { title: "¿Qué son las emociones?", content: "Las emociones son respuestas complejas del organismo que involucran tres componentes: el fisiológico (cambios corporales como taquicardia o sudoración), el cognitivo (interpretación y evaluación del evento) y el conductual (la expresión externa como el llanto, la risa o la agresión). En el contexto educativo, un docente que comprende estos tres componentes puede identificar en sus alumnos señales tempranas de malestar emocional antes de que escalen a conductas disruptivas." },
      { title: "El modelo de Gross (2015)", content: "James Gross propone que la regulación emocional ocurre en cinco puntos: (1) Selección de la situación — elegir o evitar contextos, (2) Modificación de la situación — alterar el ambiente, (3) Despliegue atencional — redirigir el foco, (4) Cambio cognitivo — reinterpretar el significado del evento, y (5) Modulación de la respuesta — modificar directamente la reacción fisiológica o conductual. Para un docente en formación, dominar estos cinco puntos significa tener cinco herramientas distintas para intervenir en un conflicto de aula." },
      { title: "Regulación vs. Represión", content: "Un error frecuente es confundir regular con reprimir. Reprimir una emoción es suprimirla sin procesarla, lo cual genera acumulación de tensión y eventualmente estallidos desproporcionados. Regular, en cambio, implica reconocer la emoción, aceptar su presencia y elegir conscientemente cómo canalizarla. El arte ofrece un canal expresivo seguro: pintar la ira no es reprimirla ni actuarla, es transformarla." },
      { title: "Neurociencia de la regulación", content: "La corteza prefrontal (CPF) es la región cerebral responsable de la regulación emocional. En jóvenes de 18 a 23 años, la CPF aún está madurando — lo cual explica por qué la impulsividad y la reactividad emocional son más frecuentes en esta etapa. Las actividades artísticas activan simultáneamente la CPF y el sistema límbico, creando puentes neuronales que fortalecen la capacidad regulatoria con la práctica." },
    ]
  },
  {
    id: 2, icon: "🎵", title: "Música como Herramienta Terapéutica", color: "#3B82F6", // Blue
    duration: "50 min", level: "Intermedio",
    intro: "La música tiene la capacidad única de alterar estados emocionales en tiempo real. Un tempo de 60-80 BPM puede reducir la frecuencia cardíaca y la ansiedad, mientras que ritmos rápidos activan el sistema nervioso simpático. Para un docente, comprender este mecanismo transforma la música de simple entretenimiento a herramienta pedagógica de regulación.",
    sections: [
      { title: "El principio ISO en regulación", content: "El principio ISO (del griego 'igual') establece que para regular un estado emocional mediante música, primero debes emparejar el estímulo musical con la emoción actual del individuo, y luego modificar gradualmente las características musicales hacia el estado deseado. Ejemplo práctico: si un grupo de alumnos está agitado después del recreo, inicias con música rítmica y enérgica (emparejamiento) y gradualmente reduces el tempo y la intensidad durante 3-4 minutos hasta llegar a un estado de calma. Esto es más efectivo que imponer silencio directamente." },
      { title: "Elementos musicales y su efecto emocional", content: "Tempo: <60 BPM induce calma, >120 BPM genera activación. Modo: tonalidad mayor se asocia con alegría, menor con tristeza o introspección. Dinámica: crescendos generan anticipación y tensión, diminuendos producen resolución. Timbre: instrumentos de cuerda evocan intimidad y nostalgia; percusión activa el cuerpo; vientos de madera transmiten serenidad. Un docente que maneja estos cuatro parámetros puede crear playlists específicas para diferentes momentos del día escolar." },
      { title: "Protocolo de intervención musical en el aula", content: "Paso 1: Identifica el clima emocional del grupo (observa lenguaje corporal, volumen de conversaciones, nivel de movimiento). Paso 2: Selecciona música que empate con ese clima. Paso 3: Reproduce a volumen medio durante 30 segundos. Paso 4: Reduce gradualmente tempo/volumen durante 2-3 minutos. Paso 5: Al alcanzar el estado deseado, mantén la música como fondo suave o retírala. Este protocolo de 5 pasos es replicable en cualquier contexto educativo sin necesidad de formación musical formal." },
      { title: "Creación musical como catarsis", content: "Más allá de escuchar, crear música — aunque sea golpear rítmicamente una superficie — permite externalizar emociones que el lenguaje verbal no puede expresar. En contextos de conflicto escolar, pedir a los involucrados que 'toquen cómo se sienten' en instrumentos de percusión simple antes de verbalizar, reduce los niveles de cortisol y facilita un diálogo posterior más constructivo. Esto se fundamenta en el concepto de 'prosodia emocional' de la neuropsicología." },
    ]
  },
  {
    id: 3, icon: "🎨", title: "Expresión Visual y Procesamiento Emocional", color: "#F97316", // Orange
    duration: "55 min", level: "Intermedio",
    intro: "El arte visual permite externalizar estados internos que a menudo no tienen palabras. Cuando un joven dice 'no sé qué siento', ponerle un pincel en la mano y decirle 'muéstramelo' puede desbloquear un canal expresivo que el lenguaje verbal no alcanza.",
    sections: [
      { title: "Teoría del color y emoción", content: "Los colores no son emocionalmente neutros. El rojo activa el sistema nervioso autónomo y se asocia con urgencia, pasión o ira. El azul reduce la presión arterial y la frecuencia cardíaca, generando sensación de calma y profundidad. El amarillo estimula la actividad cognitiva y se vincula con optimismo. El negro puede representar tanto protección como vacío. Para el docente, pedir a un alumno que 'elija un color para su estado de ánimo' es una técnica de evaluación emocional no invasiva que funciona incluso con quienes tienen dificultades de verbalización." },
      { title: "El trazo como indicador emocional", content: "La presión, dirección y velocidad del trazo revelan estados internos. Trazos pesados y angulares pueden indicar tensión o frustración. Líneas suaves y curvas sugieren calma o apertura. Movimientos repetitivos pueden señalar ansiedad o necesidad de control. Un docente entrenado en lectura de trazos puede utilizar actividades de 'dibujo libre de 2 minutos' como herramienta diagnóstica rápida del clima emocional del aula sin necesidad de hacer preguntas directas que muchos jóvenes perciben como invasivas." },
      { title: "Técnica del autorretrato emocional", content: "Protocolo: Se le pide al alumno que dibuje dos autorretratos abstractos — uno de 'cómo me siento' y otro de 'cómo quiero sentirme'. No se requiere habilidad artística; se usan solo formas, colores y líneas. La comparación entre ambos dibujos genera una conversación natural sobre el gap emocional sin necesidad de preguntas directas. Esta técnica es especialmente poderosa en situaciones post-conflicto porque despersonaliza la discusión: se habla del dibujo, no del problema." },
      { title: "El collage como herramienta de resignificación", content: "El collage permite tomar elementos fragmentados y construir un nuevo significado. En el contexto de resolución de conflictos, se puede pedir a los involucrados que creen un collage individual de 'lo que pasó' usando recortes de revistas, y luego un collage conjunto de 'cómo queremos que sea'. El acto físico de cortar, reorganizar y pegar es una metáfora activa de la reconstrucción emocional. A diferencia del diálogo verbal, el collage elimina la presión de 'encontrar las palabras correctas'." },
    ]
  },
  {
    id: 4, icon: "📖", title: "Literatura y Resolución de Conflictos", color: "#8B5CF6", // Purple
    duration: "40 min", level: "Avanzado",
    intro: "La narrativa tiene poder transformador. Cuando un docente le pide a un alumno que 'cuente lo que pasó como si fuera un cuento', está activando la corteza prefrontal medial — la misma región que nos permite distanciarnos emocionalmente de un evento y verlo desde una perspectiva más amplia.",
    sections: [
      { title: "La metáfora como puente cognitivo", content: "Las metáforas permiten hablar de emociones difíciles sin confrontación directa. 'El enojo es como un volcán' permite explorar intensidad, acumulación y erupción sin que el alumno sienta que está siendo juzgado por su conducta. Técnica práctica: ante un conflicto, pide a cada involucrado que complete la frase 'Lo que siento es como un/a ___ porque ___'. Las metáforas resultantes revelan capas emocionales que el relato literal nunca alcanza y además generan empatía natural entre los involucrados al descubrir que sus metáforas son más similares de lo esperado." },
      { title: "Micro-relatos y distanciamiento emocional", content: "El distanciamiento narrativo es una técnica donde el individuo cuenta su experiencia en tercera persona: 'Había un maestro que un día...' o 'Existía un alumno que sentía...'. Este simple cambio gramatical activa la corteza prefrontal y reduce la reactividad de la amígdala. Protocolo: después de un conflicto, pide 5 minutos de escritura libre en tercera persona sobre lo sucedido. Luego, cada uno lee su micro-relato. El resultado es que los participantes se escuchan con más apertura porque perciben la narrativa como ficción, aunque reconocen la verdad emocional subyacente." },
      { title: "Poesía como regulación", content: "El verso libre, sin reglas de rima ni métrica, permite la expresión emocional comprimida. Técnica del 'Haiku emocional': se pide al alumno que escriba exactamente 3 líneas sobre lo que siente, con la restricción de que la primera línea tenga 5 sílabas, la segunda 7 y la tercera 5. La restricción formal obliga al cerebro a pasar del modo reactivo al modo analítico, lo cual por sí solo ya es un acto de regulación. Ejemplo: 'Fuego en el pecho / las palabras no alcanzan / respiro y creo'." },
      { title: "Bibliotherapia aplicada al aula", content: "La biblioterapia utiliza textos literarios específicos como herramienta de intervención. El docente selecciona un cuento corto, poema o fragmento que refleje indirectamente la situación conflictiva del grupo, lo lee en voz alta y luego facilita una discusión sobre los personajes — nunca sobre los alumnos directamente. Este espejo narrativo permite que los jóvenes reconozcan sus patrones emocionales sin sentirse expuestos. Claves de selección del texto: debe ser ambiguo (permitir múltiples interpretaciones), breve (máximo 5 minutos de lectura) y emocionalmente resonante sin ser explícito." },
    ]
  },
  {
    id: 5, icon: "⚡", title: "Estrategias Prácticas para el Aula", color: "#EF4444", // Red
    duration: "35 min", level: "Aplicado",
    intro: "Este módulo traduce toda la teoría anterior en protocolos concretos que puedes aplicar mañana mismo en tu práctica docente. Cada estrategia incluye el contexto ideal, los materiales necesarios (mínimos) y el tiempo requerido.",
    sections: [
      { title: "El semáforo artístico (5 min diarios)", content: "Cada mañana, al iniciar la clase, los alumnos colocan una ficha de color en un panel visible: rojo (estoy alterado/no estoy bien), amarillo (estoy inquieto/algo me preocupa), verde (estoy tranquilo/disponible para aprender). No se pide explicación. Si más del 30% del grupo marca rojo o amarillo, el docente activa una micro-intervención artística de 3 minutos (respiración con música, dibujo libre o escritura flash). Este ritual crea cultura emocional sin necesidad de sesiones largas." },
      { title: "La caja de arena sonora (10 min)", content: "Materiales: objetos cotidianos que producen sonido (llaves, vasos, papeles, lápices contra la mesa). Protocolo: ante un conflicto entre dos o más alumnos, cada uno elige 3 objetos y crea una secuencia sonora de 15 segundos que represente cómo se siente. Los demás escuchan. Luego, entre todos crean una secuencia conjunta de 30 segundos que represente 'cómo queremos sentirnos'. El acto colaborativo de crear sonido juntos activa los circuitos de cooperación y reduce la hostilidad residual." },
      { title: "Escritura relámpago post-conflicto (7 min)", content: "Inmediatamente después de un conflicto (antes de que se enfríe la emoción pero después de una pausa de 30 segundos): cada involucrado escribe durante 3 minutos sin detenerse todo lo que siente — sin censura, sin puntuación, sin preocuparse por la forma. Luego, cada uno subraya las 3 palabras más importantes de su texto. Esas 6 palabras (3 por persona) se convierten en el punto de partida del diálogo. Esta técnica funciona porque el acto de escribir ya es regulatorio, y las 3 palabras eliminan el ruido emocional." },
      { title: "El mural colectivo de resolución (20 min)", content: "Materiales: papel grande (puede ser papel craft pegado a la pared), marcadores de colores. Se divide el papel en tres zonas: 'Antes' (izquierda), 'El momento' (centro) y 'Después' (derecha). Cada alumno involucrado contribuye con dibujos, palabras o símbolos en cada zona. El mural se construye en silencio durante 10 minutos. Los últimos 10 minutos son para que cada uno explique su contribución. El mural permanece visible en el aula como recordatorio del proceso de resolución, no del conflicto." },
    ]
  },
];

export default function ModulesPage() {
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(null);

  const current = MODULES.find(m => m.id === openModule);

  return (
    <main className="min-h-screen px-4 pt-24 pb-28 relative bg-mesh-3">
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="text-xs text-blue-600 hover:text-blue-800 transition-colors tracking-wider uppercase font-bold mb-4 inline-block">← Inicio</Link>
        <h1 className="text-4xl md:text-5xl mt-2 mb-4 font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
          Módulos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">Aprender</span>
        </h1>
        <p className="text-base text-slate-500 mb-12 max-w-2xl leading-relaxed font-medium">
          Explora contenido formativo vibrante sobre regulación emocional, resolución de conflictos y el uso del arte como tu principal herramienta de paz.
        </p>

        {!current ? (
          <div className="space-y-6">
            {MODULES.map((mod, i) => (
              <Reveal key={mod.id} delay={i * 100}>
                <button onClick={() => { setOpenModule(mod.id); setOpenSection(null); }}
                  className="w-full text-left bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start md:items-center gap-6 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 transition-transform group-hover:scale-110 shadow-inner"
                       style={{ background: `${mod.color}20` }}>
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-2 text-slate-800 transition-colors" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>{mod.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{mod.intro}</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 tracking-wider uppercase">{mod.duration}</span>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase" style={{ background: `${mod.color}15`, color: mod.color }}>{mod.level}</span>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 tracking-wider uppercase">{mod.sections.length} secciones</span>
                    </div>
                  </div>
                  <div className="hidden md:flex text-slate-300 group-hover:text-blue-500 transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="anim-fade-in bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
            <button onClick={() => setOpenModule(null)} className="text-xs text-blue-600 hover:text-blue-800 transition-colors tracking-wider uppercase font-bold mb-8 flex items-center gap-2">
              <span>←</span> Volver a Módulos
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner" style={{ background: `${current.color}20` }}>
                {current.icon}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>{current.title}</h2>
                <div className="flex gap-3 mt-4">
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 tracking-wider uppercase">{current.duration}</span>
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase" style={{ background: `${current.color}15`, color: current.color }}>{current.level}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-12 border border-slate-100">
              <p className="text-lg text-slate-600 leading-relaxed font-medium">{current.intro}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>Temario del Módulo</h3>
              {current.sections.map((sec, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
                  <button onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-5">
                      <span className="text-sm font-bold bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full" style={{ color: current.color }}>{i + 1}</span>
                      <span className="text-lg font-bold text-slate-800">{sec.title}</span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {openSection === i && (
                    <div className="px-6 pb-6 animate-fade-in bg-white">
                      <div className="border-t border-slate-100 pt-5">
                        <p className="text-base text-slate-600 leading-relaxed font-medium">{sec.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
