import React from 'react';
import { Keyboard, Brain, ArrowRight, Layers, Target, Shield, Trophy, Users, BookOpen, Gamepad2, BarChart3, Award, RotateCcw } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreActivities: () => void;
}

const LEVELS = [
  { name: 'Iniciador del Teclado', range: '< 11 WPM', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', desc: 'Fase inicial de posicionamiento muscular e indexación guiada por las teclas F y J.' },
  { name: 'Dactilógrafo de Bronce', range: '11 - 21 WPM', color: 'text-amber-700', bg: 'bg-amber-900/10', border: 'border-amber-800', desc: 'Velocidad de despegue. Comienza a integrar la bimanualidad activa simétrica.' },
  { name: 'Digitador de Plata', range: '22 - 32 WPM', color: 'text-slate-300', bg: 'bg-slate-900', border: 'border-slate-600', desc: 'Nivel óptimo que denota éxito completo en la erradicación de la dependencia ocular del teclado.' },
  { name: 'Técnico de Oro', range: '33 - 44 WPM', color: 'text-amber-500', bg: 'bg-amber-950/40', border: 'border-amber-500', desc: 'Fluidez dactilar excelente, altamente idónea para redacción avanzada o bilingüe.' },
  { name: 'Maestro de Leyenda', range: '≥ 45 WPM', color: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-500', desc: 'Súper velocidad dactilográfica, reflejos y memoria del espacio tridimensional del teclado.' },
];

export default function LandingPage({ onGetStarted, onExploreActivities }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* NAV */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 select-none">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">DactiloTICs</h1>
              <p className="text-[10px] text-slate-400 font-mono">Maestría Motriz Táctil de Precisión</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onExploreActivities} className="text-xs text-slate-400 hover:text-white font-bold transition-colors px-3 py-1.5">
              Actividades
            </button>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
            >
              Comenzar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-800/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.05),transparent_50%)]" />
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-mono font-bold">Automatización Cognitiva · Destreza Motriz Primaria</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6">
              La dactilografía táctil es la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">caligrafía del siglo XXI</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 font-mono">
              En la era del conocimiento y la digitalización, escribir sin mirar el teclado libera tu memoria de trabajo,
              permitiéndote priorizar el pensamiento crítico, la redacción creativa y el análisis textual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25 text-sm flex items-center justify-center gap-2"
              >
                Comenzar ahora <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreActivities}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm border border-slate-700"
              >
                Explorar actividades
              </button>
            </div>
          </div>
        </section>

        {/* WHY IT MATTERS */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">¿Por qué es importante?</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              No se trata simplemente de velocidad, sino de un proceso de automatización cognitiva que transforma tu relación con la tecnología.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Liberación Cognitiva</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Al automatizar la digitación, tu cerebro libera memoria de trabajo para enfocarse en lo que realmente importa: generar ideas, no buscar teclas.
              </p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Productividad Real</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un digitador táctil eficiente redacta documentos, escribe código y produce contenido hasta 3 veces más rápido que quien usa el método de "picoteo selectivo".
              </p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Estándares Internacionales</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Alineado con los estándares ISTE (Sociedad Internacional para la Tecnología en la Educación) y los marcos de competencia digital.
              </p>
            </div>
          </div>
        </section>

        {/* LEVEL SYSTEM */}
        <section className="bg-slate-900/20 border-y border-slate-800/60 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-indigo-300 font-mono font-bold">Sistema de Progresión</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Niveles de Maestría Dactilográfica</h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Cada nivel representa un hito en tu camino hacia la automatización neuromuscular completa.
              </p>
            </div>
            <div className="space-y-4">
              {LEVELS.map((level, i) => (
                <div key={i} className={`${level.bg} ${level.border} border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all hover:brightness-110`}>
                  <div className="flex items-center gap-3 md:w-56 shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${level.bg} border ${level.border} flex items-center justify-center`}>
                      <span className={`text-lg font-black font-mono ${level.color}`}>{i + 1}</span>
                    </div>
                    <div>
                      <span className={`text-sm font-black ${level.color} block`}>{level.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{level.range}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{level.desc}</p>
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className={`w-2 h-2 rounded-full ${j <= i ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACTIVITIES PREVIEW */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Explora las actividades</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Cada actividad está diseñada para desarrollar habilidades específicas en un entorno motivador y con retroalimentación inmediata.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 border border-blue-500/20">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Ejercicios Curriculares</h3>
              <p className="text-xs text-slate-400">Drills progresivos de teclas, palabras y textos. Desde posicionamiento básico hasta redacción avanzada.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 border border-purple-500/20">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Nitro Race</h3>
              <p className="text-xs text-slate-400">Carrera de velocidad contra bots de IA. Mejora tu ritmo y precisión bajo presión.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 border border-emerald-500/20">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Dashboard de Progreso</h3>
              <p className="text-xs text-slate-400">Visualiza tu evolución con gráficos interactivos. Medallas y logros por cada hito alcanzado.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3 border border-amber-500/20">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Práctica Inteligente</h3>
              <p className="text-xs text-slate-400">Analiza tus errores históricos y genera drills personalizados para fortalecer tus áreas débiles.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-3 border border-rose-500/20">
                <Award className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Certificados</h3>
              <p className="text-xs text-slate-400">Genera diplomas oficiales con tu velocidad neta y precisión. Ideal para portafolios escolares.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3 border border-indigo-500/20">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Portal del Docente</h3>
              <p className="text-xs text-slate-400">Monitoreo de progreso, reproductor de pulsaciones antifraude y exportación de reportes oficiales.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={onExploreActivities}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors inline-flex items-center gap-1.5"
            >
              Ver descripción detallada de actividades <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gradient-to-r from-indigo-600/10 via-transparent to-amber-600/10 border-t border-slate-800/60 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Comienza tu viaje hoy</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-xl mx-auto">
            Cada sesión de práctica es un paso hacia la automatización. El único requisito es constancia.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/25 text-base inline-flex items-center gap-2"
            >
              Crear cuenta gratuita <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 md:px-8 py-5 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span>© 2026 DactiloTICs — Rolando Gelabert Fernández</span>
          <div className="flex gap-4">
            <span className="hover:text-indigo-400 transition-colors cursor-help">Licencia MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
