import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Settings, CheckCircle, Trash2, Calendar, ShieldAlert,
  Play, Pause, FastForward, FileText, Download, Plus, CheckSquare, RefreshCw
} from 'lucide-react';
import { Attempt, Lesson } from '../types';

interface TeacherModuleProps {
  lessons: Lesson[];
  attempts: Attempt[];
  onAddCustomLesson: (lesson: Lesson) => void;
  onDeleteAttempt: (id: string) => void;
}

export default function TeacherModule({
  lessons,
  attempts,
  onAddCustomLesson,
  onDeleteAttempt
}: TeacherModuleProps) {
  
  // Tab controller
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'replays' | 'lessons-editor' | 'exports'>('roster');

  // Lesson Editor State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonCategory, setNewLessonCategory] = useState<'key' | 'word' | 'text'>('text');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonTargetWpm, setNewLessonTargetWpm] = useState(30);

  // RSS News Simulation State
  const [rssFeedLoading, setRssFeedLoading] = useState(false);

  // --- REPLAY PLAYER ENGINE STATE ---
  const [selectedAttemptToReplay, setSelectedAttemptToReplay] = useState<Attempt | null>(attempts[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5, 1, 2, 4
  const [replayTextOutput, setReplayTextOutput] = useState<{ char: string; isCorrect: boolean; isBlank: boolean }[]>([]);
  const [replayEventIndex, setReplayEventIndex] = useState<number>(0);
  const playbackTimer = React.useRef<any>(null);

  // Reset player when selection changes
  useEffect(() => {
    stopReplay();
    if (selectedAttemptToReplay) {
      setReplayTextOutput([]);
      setReplayEventIndex(0);
    }
  }, [selectedAttemptToReplay]);

  // Handle replayer tick
  useEffect(() => {
    if (isPlaying && selectedAttemptToReplay) {
      const events = selectedAttemptToReplay.keystrokeReplay;
      if (replayEventIndex >= events.length) {
        setIsPlaying(false);
        return;
      }

      const nextEvent = events[replayEventIndex];
      const prevTimestamp = replayEventIndex > 0 ? events[replayEventIndex - 1].timestamp : 0;
      const originalDelay = nextEvent.timestamp - prevTimestamp;
      const speedAdjustedDelay = Math.max(10, Math.min(2000, originalDelay / playbackSpeed));

      playbackTimer.current = setTimeout(() => {
        setReplayTextOutput(prev => {
          const item = {
            char: nextEvent.char,
            isCorrect: nextEvent.isCorrect,
            isBlank: nextEvent.char === ' '
          };
          return [...prev, item];
        });
        setReplayEventIndex(idx => idx + 1);
      }, speedAdjustedDelay);

      return () => clearTimeout(playbackTimer.current);
    }
  }, [isPlaying, selectedAttemptToReplay, replayEventIndex, playbackSpeed]);

  const stopReplay = () => {
    setIsPlaying(false);
    if (playbackTimer.current) clearTimeout(playbackTimer.current);
  };

  const startReplay = () => {
    if (replayEventIndex >= (selectedAttemptToReplay?.keystrokeReplay.length || 0)) {
      setReplayTextOutput([]);
      setReplayEventIndex(0);
    }
    setIsPlaying(true);
  };

  const stepBackwardReplay = () => {
    stopReplay();
    setReplayTextOutput([]);
    setReplayEventIndex(0);
  };

  // Simulated RSS World News Fetching (ICT contextual topics)
  const fetchSimulatedRSS = () => {
    setRssFeedLoading(true);
    setTimeout(() => {
      const mockNews = [
        "Nuevos avances en inteligencia artificial generativa descentralizada optimizan el desarrollo de aplicaciones escolares en la nube.",
        "Estudios recientes de alfabetizacion digital revelan que los alumnos con alta velocidad dactilográfica cometen un setenta por ciento menos de fraudes de copiado.",
        "La ciberseguridad corporativa exige que las contrasenas sean unicas y seguras para evitar vulnerabilidades de inyeccion SQL estructurada."
      ];
      const selectedNews = mockNews[Math.floor(Math.random() * mockNews.length)];
      setNewLessonTitle("Noticias TICs RSS: Adaptativas");
      setNewLessonContent(selectedNews);
      setNewLessonCategory("text");
      setNewLessonTargetWpm(35);
      setRssFeedLoading(false);
    }, 1200);
  };

  const handleCreateCustomLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonContent) {
      alert("Por favor completa el título y contenido de la lección.");
      return;
    }

    const nLesson: Lesson = {
      id: 'custom-' + Math.random().toString(36).substr(2, 9),
      title: newLessonTitle,
      category: newLessonCategory,
      content: newLessonContent,
      targetWpm: newLessonTargetWpm,
      minDuration: 30,
      studiedKeys: []
    };

    onAddCustomLesson(nLesson);
    setNewLessonTitle('');
    setNewLessonContent('');
    alert("¡Nueva lección curricular cargada exitosamente!");
  };

  // Benchmark check with fixed target
  const getBenchmarkStatus = (netWpm: number) => {
    const target = 22;
    if (netWpm >= target) {
      return { status: 'SUPERADO', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    return { status: 'BAJO META', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  // Unique students analytics calculation
  const uniqueStudentMap: Record<string, {
    name: string;
    attempts: number;
    avgSpeed: number;
    avgAccuracy: number;
  }> = {};

  attempts.forEach(a => {
    if (!uniqueStudentMap[a.studentName]) {
      uniqueStudentMap[a.studentName] = {
        name: a.studentName,
        attempts: 0,
        avgSpeed: 0,
        avgAccuracy: 0
      };
    }
    const record = uniqueStudentMap[a.studentName];
    record.attempts += 1;
    record.avgSpeed += a.netWpm;
    record.avgAccuracy += a.accuracy;
  });

  Object.values(uniqueStudentMap).forEach(std => {
    std.avgSpeed = Math.round(std.avgSpeed / std.attempts);
    std.avgAccuracy = Math.round(std.avgAccuracy / std.attempts);
  });

  const studentsList = Object.values(uniqueStudentMap);

  // Data Exporters
  const triggerExport = (format: 'csv' | 'xml' | 'html') => {
    let dataStr = '';
    let mimeType = 'text/plain';
    let fileName = `reporte-tics-distrital.${format}`;

    if (format === 'csv') {
      mimeType = 'text/csv';
      dataStr = "Estudiante,Lección,Rendimiento Bruto,Rendimiento Neto,Precisión %,Fecha,Fraude\n";
      attempts.forEach(a => {
        dataStr += `"${a.studentName}","${a.lessonTitle}",${a.grossWpm},${a.netWpm},${a.accuracy},"${a.date}",${a.suspicious ? 'SÍ' : 'NO'}\n`;
      });
    } else if (format === 'xml') {
      mimeType = 'text/xml';
      dataStr = '<?xml version="1.0" encoding="UTF-8"?>\n<DactilografiaReport>\n';
      attempts.forEach(a => {
        dataStr += `  <Intento id="${a.id}">\n`;
        dataStr += `    <Student>${a.studentName}</Student>\n`;
        dataStr += `    <Rendimiento>${a.netWpm}</Rendimiento>\n`;
        dataStr += `    <Accuracy>${a.accuracy}</Accuracy>\n`;
        dataStr += `    <Date>${a.date}</Date>\n`;
        dataStr += `    <RobotFlag>${a.suspicious}</RobotFlag>\n`;
        dataStr += `  </Intento>\n`;
      });
      dataStr += '</DactilografiaReport>';
    } else {
      mimeType = 'text/html';
      dataStr = `<html><head><title>Mapeo Curricular Docente</title><style>body { font-family: sans-serif; padding: 24px; }</style></head>
      <body><h2>Mapeo Curricular de TICs - Resumen de Rendimiento</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr style="background:#f1f5f9"><th>Estudiante</th><th>Lección</th><th>Rendimiento</th><th>Precisión %</th></tr>`;
      attempts.forEach(a => {
        dataStr += `<tr><td>${a.studentName}</td><td>${a.lessonTitle}</td><td>${a.netWpm}</td><td>${a.accuracy}%</td></tr>`;
      });
      dataStr += `</table></body></html>`;
    }

    // Dynamic browser downloads trigger
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`¡Archivo ${fileName.toUpperCase()} generado y descargado!`);
  };

  return (
    <div className="space-y-6 text-left text-slate-100">
      {/* Teacher Top Filter Board */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/70 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Portal del Docente y Coordinación TICs
            </h2>
            <p className="text-xs text-slate-400">Canaliza métricas escolares, gestiona fraudes con replayers de pulsaciones y mapea el Common Core.</p>
          </div>
          
          <div className="bg-slate-950/80 font-mono text-[10px] py-1 px-3 border border-slate-850 rounded-lg text-indigo-300">
            Escuela: <b className="text-white">Ada Lovelace CS</b>
          </div>
        </div>


      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl gap-1 overflow-x-auto backdrop-blur-md shadow-inner">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeSubTab === 'roster' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          Roster de Alumnos
        </button>
        <button
          onClick={() => setActiveSubTab('replays')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeSubTab === 'replays' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          Fidelidad de Pulsaciones (Antifraude)
        </button>
        <button
          onClick={() => setActiveSubTab('lessons-editor')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeSubTab === 'lessons-editor' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          Editor de Lecciones Currículum & RSS
        </button>
        <button
          onClick={() => setActiveSubTab('exports')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeSubTab === 'exports' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          Reportes de Exportación Distrital
        </button>
      </div>

      {/* --- SUB-TAB 1: STUDENT ROSTER & BENCHMARKS --- */}
      {activeSubTab === 'roster' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <h3 className="font-bold text-sm tracking-tight text-white">Nivelación y Mapeo de Estándares de Grado</h3>
            
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Intentos Totales</th>
                  <th className="p-3">Rendimiento</th>
                  <th className="p-3">Precisión Promedio</th>
                  <th className="p-3">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {studentsList.map(s => {
                  const benchmark = getBenchmarkStatus(s.avgSpeed);
                  return (
                    <tr key={s.name} className="hover:bg-slate-850/40">
                      <td className="p-3 font-sans font-bold text-white">{s.name}</td>
                      <td className="p-3">{s.attempts} escrituras</td>
                      <td className="p-3 text-emerald-400 font-bold">{s.avgSpeed} pal/min</td>
                      <td className="p-3 text-amber-400">{s.avgAccuracy}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wide ${benchmark.color}`}>
                          {benchmark.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 2: RAW KEYSTROKE REPLAY SYSTEM (ANTI-CHEAT) --- */}
      {activeSubTab === 'replays' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Attempts List select */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col h-[520px]">
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider font-bold mb-1 uppercase">Historial de Intentos Guardados</span>
            <p className="text-xs text-slate-400 mb-4 leading-normal">Selecciona un registro para ver la reproducción molecular exacta de sus pulsaciones rítmicas.</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {attempts.map(a => (
                <div 
                  key={a.id}
                  onClick={() => setSelectedAttemptToReplay(a)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${selectedAttemptToReplay?.id === a.id ? 'bg-indigo-950 border-indigo-400' : 'bg-slate-950 border-slate-850 hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-sans font-bold text-xs text-white block">{a.studentName}</span>
                    {a.suspicious && (
                      <span className="bg-rose-500 text-white rounded px-1.5 py-0.5 text-[8px] font-black tracking-widest animate-pulse flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> SOSPECHOSO
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block font-mono leading-tight">{a.lessonTitle}</span>
                  <div className="flex justify-between text-[10px] font-mono mt-2 text-slate-400">
                    <span>{a.netWpm} pal/min • {a.accuracy}%</span>
                    <span>{a.timeSpent}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Replay Visualizer Player Console */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 flex flex-col justify-between h-[520px]">
            {selectedAttemptToReplay ? (
              <div className="flex flex-col h-full justify-between space-y-4">
                
                {/* Replayer Top Header bar */}
                <div className="flex justify-between items-start border-b border-slate-850 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-mono block font-black">REPRODUCTOR DE PROCESO MOLECULAR</span>
                    <h4 className="font-bold text-sm text-white">{selectedAttemptToReplay.studentName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono leading-tight">Lección: {selectedAttemptToReplay.lessonTitle}</p>
                  </div>

                  {/* Flag / Delete action (Función X) */}
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar este intento por sospecha de fraude o trampas externas? Esto mantendrá la integridad rítmica.")) {
                        onDeleteAttempt(selectedAttemptToReplay.id);
                        setSelectedAttemptToReplay(null);
                        alert("Registro eliminado exitosamente.");
                      }
                    }}
                    className="flex items-center gap-1.5 bg-rose-900/50 hover:bg-rose-800 border border-rose-500/20 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Función X (Eliminar)
                  </button>
                </div>

                {/* Player Screen Area */}
                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-5 overflow-y-auto font-mono text-xs leading-relaxed text-left selection:bg-indigo-500 relative">
                  {replayTextOutput.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-[11px] px-6 text-center">
                      Consola lista. Presiona el botón PLAY para reproducir cómo escribió cada caracter secuencialmente.
                    </div>
                  )}
                  {replayTextOutput.map((item, idx) => (
                    <span 
                      key={idx} 
                      className={item.isCorrect ? 'text-emerald-400 font-bold underline bg-emerald-500/10' : 'text-rose-500 line-through bg-rose-500/20 font-black'}
                    >
                      {item.isBlank ? ' ' : item.char}
                    </span>
                  ))}
                </div>

                {/* Simulation diagnostics */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Pulsación: {replayEventIndex} / {selectedAttemptToReplay.keystrokeReplay.length}</span>
                  {selectedAttemptToReplay.suspicious ? (
                    <span className="text-red-400 font-black animate-pulse flex items-center gap-1">
                      ⚠️ Intervalos menores de 35ms: ALTO RIESGO DE MACRO/EXTERNO
                    </span>
                  ) : (
                    <span className="text-emerald-400">Intervalos estables promedio: {Math.round(selectedAttemptToReplay.timeSpent * 1000 / (selectedAttemptToReplay.keystrokeReplay.length || 1))}ms</span>
                  )}
                </div>

                {/* Player Controls bar */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-950 border border-slate-850 rounded-xl p-3 gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={stepBackwardReplay}
                      className="bg-slate-900 hover:bg-slate-850 text-white rounded-lg p-2 text-xs font-bold border border-slate-800"
                      title="Reiniciar reproducción"
                    >
                      Reiniciar
                    </button>

                    <button
                      onClick={isPlaying ? stopReplay : startReplay}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isPlaying ? 'Pausar' : 'Reproducir'}
                    </button>
                  </div>

                  {/* Playback speed dials */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">Velocidad:</span>
                    {[0.5, 1, 2, 4].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${playbackSpeed === speed ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 py-12">
                <ShieldAlert className="w-10 h-10 mb-2 text-indigo-500" />
                <span className="font-mono text-sm leading-normal">Selecciona un intento en el listado para inicializar el visualizador molecular.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- SUB-TAB 3: LESSONS EDITOR & RSS FEED --- */}
      {activeSubTab === 'lessons-editor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Generar Ejercicio Curricular Personalizado</h3>
              <p className="text-xs text-slate-400">Escribe o simula la importación de textos adaptados para su redacción autónoma.</p>
            </div>

            <form onSubmit={handleCreateCustomLesson} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Título de la Lección</label>
                <input
                  type="text"
                  placeholder="ej. Codificación en Python Básica"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 text-white"
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Categoría Pedagógica</label>
                  <select
                    value={newLessonCategory}
                    onChange={e => setNewLessonCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 text-white"
                  >
                    <option value="key">Key Drills (Posicionamiento)</option>
                    <option value="word">Word Drills (Palabras/Vocabulario)</option>
                    <option value="text">Text Drills (Artículos/Examen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Meta (pal/min)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 text-white"
                    value={newLessonTargetWpm}
                    onChange={e => setNewLessonTargetWpm(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Cuerpo de Texto</label>
                <textarea
                  placeholder="Escribe el párrafo que debe transcribir el estudiante..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 text-white"
                  value={newLessonContent}
                  onChange={e => setNewLessonContent(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Cargar Lección
                </button>
              </div>
            </form>
          </div>

          {/* RSS News simulated integration block */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-indigo-400 font-mono block font-black uppercase mb-1">MÓDULO DE INTEGRACIÓN DE CONTEXTUALIZACIÓN RSS</span>
              <h3 className="font-bold text-sm tracking-tight text-white mb-2">Importar Noticias TICs vía RSS / feeds</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Al usar RSS feeds del mundo real de TI (tecnologías de la información), enriquecemos las transcripciones académicas para que el estudiante lea noticias de seguridad y desarrollo mientras practica.
              </p>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-3 font-mono my-4">
              <p className="text-[10px] text-slate-400 uppercase font-black">Canales RSS Simulados recomendados:</p>
              <div className="divide-y divide-slate-900 text-xs text-slate-300">
                <div className="py-2 flex justify-between">
                  <span>Feed de Ciberseguridad TICs</span>
                  <span className="text-emerald-400">Conectado</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span>Feed de Nube y Redes Escolares</span>
                  <span className="text-emerald-400">Conectado</span>
                </div>
              </div>
            </div>

            <button
              onClick={fetchSimulatedRSS}
              disabled={rssFeedLoading}
              className="w-full hover:bg-slate-800 bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 font-bold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${rssFeedLoading ? 'animate-spin text-indigo-400' : ''}`} />
              {rssFeedLoading ? 'Conectando con Feed...' : 'Sincronizar y Generar con Noticias TICs'}
            </button>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 4: REPORTS AND DATA EXPORTS --- */}
      {activeSubTab === 'exports' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-6">
          <div>
            <h3 className="font-bold text-sm text-white">Exportación de Analytics del Distrito Escolar</h3>
            <p className="text-xs text-slate-400">Genera y descarga informes consolidados compatibles con sistemas escolares externos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CSV export */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-white block mb-1">DactiloReport - CSV</span>
                <p className="text-[11px] text-slate-400">Compatible con Microsoft Excel, Google Sheets, y cargadores de calificaciones universales.</p>
              </div>
              <button
                onClick={() => triggerExport('csv')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Descargar CSV
              </button>
            </div>

            {/* XML export */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-white block mb-1">DactiloReport - XML</span>
                <p className="text-[11px] text-slate-400">Estructurado jerárquicamente para integraciones API escolares o almacenamiento local.</p>
              </div>
              <button
                onClick={() => triggerExport('xml')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Descargar XML
              </button>
            </div>

            {/* HTML report */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-white block mb-1">Mapeo HTML</span>
                <p className="text-[11px] text-slate-400">Pagina web ligera formateada con tablas limpias para publicación en sitios o portales.</p>
              </div>
              <button
                onClick={() => triggerExport('html')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Descargar HTML
              </button>
            </div>

            {/* PDF preview/print */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-white block mb-1">Informe Imprimible PDF</span>
                <p className="text-[11px] text-slate-400">Genera una pestaña optimizada estéticamente limpia lista para guardar como PDF local.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Imprimir con Navegador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
