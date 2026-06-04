import Link from "next/link";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import DownloadNormativaPDF from "@/components/DownloadNormativaPDF";

export default function NormativaPage() {
  return (
    <main className="relative min-h-screen bg-mural-escolar py-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-0"></div>

      {/* Scattered Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-3 h-3 rounded-full bg-emerald-400 anim-breathe opacity-30" />
        <div className="absolute bottom-[20%] right-[10%] w-4 h-4 rounded-full bg-orange-400 anim-breathe opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="btn-secondary text-sm px-6 py-2 border-2 border-slate-900 bg-white text-slate-800 hover:bg-slate-50 font-bold rounded-full mb-6 inline-block">
            ← Volver al Inicio
          </Link>
          <Reveal>
            <div className="w-20 h-20 mx-auto bg-emerald-100 border-3 border-slate-900 flex items-center justify-center mb-6" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
              <span className="text-4xl">⚖️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
              Marco Normativo
            </h1>
            <p className="text-lg md:text-xl text-slate-700 max-w-xl mx-auto font-bold">
              Las leyes que respaldan la obligatoriedad y el valor de la Educación Artística y Cultural en Colombia.
            </p>
          </Reveal>
        </div>

        {/* Introduction Alert box */}
        <Reveal>
          <div className="bg-emerald-50 border-4 border-slate-900 p-6 rounded-2xl mb-8 shadow-[4px_4px_0_rgba(15,23,42,1)]" style={{ borderRadius: '15px 225px 15px 255px/225px 15px 255px 15px' }}>
            <h2 className="text-lg font-bold text-emerald-950 mb-2 flex items-center gap-2">
              📢 ¿Sabías que el Arte es Obligatorio?
            </h2>
            <p className="text-emerald-900 font-semibold text-sm leading-relaxed">
              El Ministerio de Educación Nacional (MEN) establece que la Educación Artística y Cultural no es una actividad extracurricular ni una materia opcional. Forma parte del núcleo fundamental y obligatorio para el desarrollo integral de todas las niñas, niños y adolescentes del país.
            </p>
          </div>
        </Reveal>

        {/* Download PDF Button */}
        <Reveal delay={50}>
          <div className="flex justify-center mb-10">
            <DownloadNormativaPDF />
          </div>
        </Reveal>

        {/* Cards Grid */}
        <div className="grid gap-6">
          
          <Reveal delay={100}>
            <div className="card-organic p-8 hover:border-emerald-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-3 bg-emerald-50 rounded-xl border border-slate-200">📖</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 uppercase">Constitución Nacional</span>
                    <span className="text-slate-500 text-sm font-bold">Artículo 67</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">La Educación como Derecho y Deber</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    Establece que la educación es un derecho de la persona y un servicio público que tiene una función social. Declara que el Estado tiene la responsabilidad de fomentar las ciencias, la tecnología y las **manifestaciones culturales y artísticas**, asegurando el desarrollo integral de los ciudadanos.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="card-organic p-8 hover:border-rose-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-3 bg-rose-50 rounded-xl border border-slate-200">🚨</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-300 uppercase">Ley 115 de 1994 (Ley General)</span>
                    <span className="text-slate-500 text-sm font-bold">Artículo 23</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Área Obligatoria y Fundamental</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    Define las **9 áreas obligatorias y fundamentales** de la educación básica que todos los colegios deben ofrecer. La <span className="underline decoration-wavy decoration-rose-400 font-extrabold">Educación Artística y Cultural</span> se consagra en el numeral 2 de este artículo, teniendo el mismo estatus y peso legal que Matemáticas, Ciencias o Lengua Castellana.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="card-organic p-8 hover:border-cyan-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-3 bg-cyan-50 rounded-xl border border-slate-200">🛠️</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-extrabold px-3 py-1 rounded-full border border-cyan-300 uppercase">Ley 115 de 1994</span>
                    <span className="text-slate-500 text-sm font-bold">Artículo 77</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Autonomía Escolar</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    Las instituciones educativas gozan de autonomía para organizar las áreas fundamentales definidas en la ley, adaptar el currículo a las necesidades del entorno local, y definir la malla de actividades artísticas y culturales en su **Proyecto Educativo Institucional (PEI)**, siempre guiadas por las orientaciones oficiales.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="card-organic p-8 hover:border-amber-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-3 bg-amber-50 rounded-xl border border-slate-200">🔍</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 uppercase">Decreto 1075 de 2015</span>
                    <span className="text-slate-500 text-sm font-bold">Decreto Único Reglamentario</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Regulación Curricular y Académica</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    Compila todas las normas educativas en Colombia. Regula la intensidad horaria mínima, los planes de estudio y define los sistemas de evaluación formativa del aprendizaje de la Educación Artística, impidiendo que el área sea desplazada o infravalorada.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div className="card-organic p-8 hover:border-purple-500">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-3 bg-purple-50 rounded-xl border border-slate-200">🎨</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full border border-purple-300 uppercase">Directrices MEN 2022</span>
                    <span className="text-slate-500 text-sm font-bold">Orientaciones Curriculares Vigentes</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Competencias Específicas Obligatorias</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    Establece el marco de obligatorio cumplimiento para que los docentes planifiquen y evalúen las clases a partir de tres competencias clave: **Sensibilidad perceptiva**, **Producción-creación** y **Comprensión crítico-cultural**, promoviendo el arte como dinamizador de la paz y las relaciones socioafectivas.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>

        {/* Legal Statement Badge */}
        <Reveal>
          <div className="mt-12 text-center text-xs text-slate-500 font-bold bg-slate-100 p-4 border border-slate-200 rounded-xl">
            Sustentado en la Constitución Política de Colombia, la Ley General de Educación (Ley 115 de 1994) y los lineamientos del Ministerio de Educación Nacional de Colombia actualizados al periodo escolar vigente.
          </div>
        </Reveal>

      </div>
    </main>
  );
}
