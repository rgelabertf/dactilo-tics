import React from 'react';
import { ArrowLeft, BookOpen, RotateCcw, BarChart3, Flame, Award, Users, EyeOff, RefreshCw, Shield, FileText, Brain, Keyboard, Gamepad2, Target, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const ACTIVITIES = [
  {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Ejercicios Curriculares',
    desc: 'Drills progresivos organizados en tres categorías: Key Drills (posicionamiento de teclas básicas), Word Drills (transición a palabras completas) y Text Drills (redacción de párrafos temáticos TICs). Cada lección tiene una meta de velocidad personalizada.',
    skills: ['Velocidad de escritura', 'Precisión por tecla', 'Memoria muscular', 'Fluidez lectora']
  },
  {
    icon: RotateCcw,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'Práctica Inteligente',
    desc: 'Analiza tu historial de errores y genera automáticamente drills enfocados en las teclas que más se te dificultan. También puedes practicar teclas específicas de una lección en particular.',
    skills: ['Corrección de errores', 'Refuerzo de áreas débiles', 'Adaptabilidad', 'Autoevaluación']
  },
  {
    icon: BarChart3,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Dashboard de Progreso',
    desc: 'Visualiza tu evolución con gráficos interactivos D3.js. Incluye medallas y logros por cada hito alcanzado, seguimiento de velocidad neta, precisión promedio y consistencia entre sesiones.',
    skills: ['Automonitoreo', 'Establecimiento de metas', 'Análisis de tendencias', 'Motivación']
  },
  {
    icon: Flame,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'Nitro Race',
    desc: 'Modo carrera contrarreloj donde compites contra 3 bots de IA. El texto se revela por segmentos y debes mantener ritmo para no quedarte atrás. La velocidad de los bots se ajusta dinámicamente a tu rendimiento.',
    skills: ['Velocidad bajo presión', 'Ritmo constante', 'Reflejos', 'Resistencia a la fatiga']
  },
  {
    icon: Award,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    title: 'Certificados de Validación',
    desc: 'Genera diplomas oficiales con tu nombre, velocidad neta máxima alcanzada y precisión promedio. Ideal para portafolios escolares y reportes de progreso académico.',
    skills: ['Portafolio de evidencia', 'Validación de logros', 'Presentación de resultados']
  },
  {
    icon: Users,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    title: 'Portal del Docente',
    desc: 'Acceso completo a métricas de grupo: roster de estudiantes con rendimiento, reproductor de pulsaciones para verificar autenticidad, editor de lecciones personalizadas y exportación de reportes en CSV, XML, HTML y PDF.',
    skills: ['Gestión de grupo', 'Detección de anomalías', 'Personalización curricular', 'Reportes oficiales']
  }
];

const MECHANISMS = [
  {
    icon: Keyboard,
    title: 'Ergonomía Digital y Guías Físicas',
    desc: 'El currículo fomenta activamente la ubicación de los relieves especiales de las teclas de inicio (F y J) con los índices correspondientes. Esta es la base sensorial permanente de la memoria espacial dactilar.'
  },
  {
    icon: RefreshCw,
    title: 'Bucle Práctica-Error-Re-intento',
    desc: 'Al redactar, la aplicación resalta de inmediato las teclas erróneas en rojo, bloqueando temporalmente el avance continuo e instruyendo la pulsación consciente del carácter esperado. Esto crea un bucle neurosensorial rápido que previene la fijación de malos hábitos cinéticos.'
  },
  {
    icon: EyeOff,
    title: 'Mitigación del "Teclado Ocular"',
    desc: 'El diseño minimalista de la pantalla de prácticas promueve que mantengas la mirada fija exclusivamente en el texto modelo. Al forzar la mirada al frente, la corteza motriz se adapta mucho más rápido a la automatización.'
  },
  {
    icon: Clock,
    title: 'Pausas Ergonómicas Inteligentes',
    desc: 'Cada 5 minutos de digitación continua, el sistema recuerda tomar una pausa activa: apartar la mirada de la pantalla, relajar los dedos y girar las muñecas por 20 segundos. La salud articular es parte fundamental del entrenamiento.'
  }
];

const REPORT_FEATURES = [
  {
    icon: Shield,
    title: 'Fidelidad Mediante Replays Dinámicos',
    desc: 'Cada práctica queda registrada en una estructura de línea temporal milimétrica (keystroke logging). El docente puede "reproducir" en cámara rápida la sesión de escritura del estudiante para observar su ritmo exacto.'
  },
  {
    icon: AlertCircle,
    title: 'Sistema de Detección de Anomalías',
    desc: 'El backend analiza el ritmo de pulsaciones de cada evento, marcando como sospechosa cualquier sesión que carezca de variabilidad manual (velocidad uniforme artificial o emulaciones de software).'
  },
  {
    icon: FileText,
    title: 'Informes Oficiales Descargables',
    desc: 'Los boletines individuales y consolidados se exportan en formatos estándar (CSV, XML, HTML, PDF) para su integración con sistemas escolares y portafolios de evidencia académica.'
  }
];

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* NAV */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">DactiloTICs</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono ml-auto">Guía de Actividades</span>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-800/60 py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-mono font-bold">Guía de Actividades</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Actividades y habilidades</h1>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cada módulo de la plataforma ha sido diseñado con un propósito pedagógico específico.
              Conoce qué puedes hacer y qué habilidades desarrollarás en cada actividad.
            </p>
          </div>
        </section>

        {/* ACTIVITIES GRID */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" /> Actividades disponibles
          </h2>
          <div className="space-y-5">
            {ACTIVITIES.map((act, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-slate-700 transition-all">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className={`${act.bg} ${act.border} border w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                    <act.icon className={`w-6 h-6 ${act.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">{act.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{act.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {act.skills.map((skill, j) => (
                        <span key={j} className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIDACTIC MECHANISMS */}
        <section className="bg-slate-900/20 border-y border-slate-800/60 py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-indigo-300 font-mono font-bold">Diseño Instruccional</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-3">Mecanismos didácticos</h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                La robustez metodológica de la plataforma radica en estas funciones de diseño instruccional.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {MECHANISMS.map((m, i) => (
                <div key={i} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                      <m.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REPORT INTEGRITY */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-mono font-bold">Validez Académica</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-3">Integridad del reporte académico</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Para que un docente pueda registrar calificaciones sin dudar de la fidelidad del ejercicio, la plataforma integra capas de seguridad que blindan sus resultados.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {REPORT_FEATURES.map((f, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center">
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOR TEACHERS */}
        <section className="bg-gradient-to-r from-indigo-600/5 via-transparent to-indigo-600/5 border-t border-slate-800/60 py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-mono font-bold">Para Docentes</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-4">Herramientas para el aula</h2>
            <p className="text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed mb-6">
              El Portal del Docente permite monitorear el progreso de todo el grupo en tiempo real,
              reproducir el historial de pulsaciones de cada estudiante para verificar la autenticidad del ejercicio,
              crear lecciones personalizadas y exportar reportes oficiales para respaldar la evaluación curricular.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold text-white block mb-1">Roster de grupo</span>
                <span className="text-[10px] text-slate-400">Métricas individuales con estatus de nivelación</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold text-white block mb-1">Reproductor antifraude</span>
                <span className="text-[10px] text-slate-400">Verificación molecular de cada pulsación</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold text-white block mb-1">Exportación multicanal</span>
                <span className="text-[10px] text-slate-400">CSV · XML · HTML · PDF</span>
              </div>
            </div>
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
