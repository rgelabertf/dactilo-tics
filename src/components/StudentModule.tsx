import React, { useState, useEffect, useRef } from 'react';
import { 
  Keyboard, Award, Flame, Zap, Play, CheckCircle, RotateCcw, 
  HelpCircle, EyeOff, Sparkles, BookOpen, Clock, AlertCircle, Heart,
  Settings, Layers, RefreshCw, FileText
} from 'lucide-react';
import { Lesson, Attempt, KeyboardLayout, KeystrokeEvent } from '../types';
import { getKeyAssignment, FINGER_METRIC, LAYOUT_ROWS } from '../keyboardLayouts';
import TypingRace from './TypingRace';

interface StudentModuleProps {
  lessons: Lesson[];
  attempts: Attempt[];
  onNewAttempt: (attempt: Attempt) => void;
}

export default function StudentModule({ lessons, attempts, onNewAttempt }: StudentModuleProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'lessons' | 'review' | 'meter' | 'race' | 'cert'>('lessons');
  
  // Custom states
  const [studentName, setStudentName] = useState('Mateo Fernández');
  const [studentGrade, setStudentGrade] = useState<number>(4);
  const [schoolId] = useState('sch-1');
  const [classId] = useState('cls-1');

  // Keyboard setup
  const [layout, setLayout] = useState<KeyboardLayout>('QWERTY');
  const [showHands, setShowHands] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  // Active Lesson Practice State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [typedInput, setTypedInput] = useState('');
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [wrongCharCount, setWrongCharCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [keysHistory, setKeysHistory] = useState<KeystrokeEvent[]>([]);

  // Statistics trackers
  const [grossWpm, setGrossWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [kpm, setKpm] = useState(0);

  // Custom Review state
  const [reviewMode, setReviewMode] = useState<'difficult' | 'studied' | 'manual'>('difficult');
  const [manualKeys, setManualKeys] = useState<string[]>([]);
  const [customReviewText, setCustomReviewText] = useState('');

  // TypingMeter Simulation
  const [meterInputText, setMeterInputText] = useState('Borrador de Correo: Estimado docente, solicito la revision de mi examen de dactilografia ya que obtuve una mejora substancial en mi velocidad de escritura neta.');
  const [meterTypedText, setMeterTypedText] = useState('');
  const [meterWpm, setMeterWpm] = useState(0);

  // Ergonomic breaks
  const [lastBreakTime, setLastBreakTime] = useState<number>(Date.now());
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  // Auto-focus container ref for capture keys without standard input block
  const typingAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Track session timer
  useEffect(() => {
    let interval: any = null;
    if (startTime !== null && activeLesson) {
      interval = setInterval(() => {
        const diff = Math.round((Date.now() - startTime) / 1000);
        setElapsedSeconds(diff);
        
        // Every 5 minutes (300 seconds), trigger ergonomics break reminder
        if (Date.now() - lastBreakTime > 300000) {
          setShowBreakReminder(true);
          setLastBreakTime(Date.now());
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, activeLesson, lastBreakTime]);

  // Calculate live statistics
  useEffect(() => {
    if (typedInput.length === 0 || !activeLesson) {
      setGrossWpm(0);
      setNetWpm(0);
      setAccuracy(100);
      setKpm(0);
      return;
    }

    const minutes = elapsedSeconds / 60 || 0.01;
    const grossWords = typedInput.length / 5;
    const computedGrossWpm = Math.round(grossWords / minutes);
    
    // Net WPM discounts letters with errors
    const errorPenalties = wrongCharCount;
    const computedNetWpm = Math.max(0, Math.round(((typedInput.length - errorPenalties) / 5) / minutes));
    const computedKpm = Math.round(typedInput.length / minutes);
    
    // Accuracy
    const totalStrikes = correctCharCount + wrongCharCount;
    const computedAccuracy = totalStrikes > 0 ? Math.round((correctCharCount / totalStrikes) * 100) : 100;

    setGrossWpm(computedGrossWpm);
    setNetWpm(computedNetWpm);
    setAccuracy(computedAccuracy);
    setKpm(computedKpm);
  }, [typedInput, correctCharCount, wrongCharCount, elapsedSeconds, activeLesson]);

  // Handle launch lesson
  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setTypedInput('');
    setCorrectCharCount(0);
    setWrongCharCount(0);
    setStartTime(null);
    setElapsedSeconds(0);
    setKeysHistory([]);
    setTimeout(() => {
      typingAreaRef.current?.focus();
    }, 150);
  };

  // Keyboard Stroke capture
  const handleKeyboardStroke = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeLesson) return;

    const val = e.target.value;
    if (val.length < typedInput.length) {
      // Don't allow backspace if user disables it, but let's allow corrections!
      setTypedInput(val);
      return;
    }

    if (startTime === null) {
      setStartTime(Date.now());
    }

    const lastCharIdx = val.length - 1;
    const typedChar = val[lastCharIdx];
    const expectedChar = activeLesson.content[lastCharIdx];

    const isCorrect = typedChar === expectedChar;

    if (isCorrect) {
      setCorrectCharCount(prev => prev + 1);
    } else {
      setWrongCharCount(prev => prev + 1);
    }

    // Save full keystroke logs for High Fidelity playbacks
    const event: KeystrokeEvent = {
      char: typedChar,
      timestamp: Date.now() - (startTime || Date.now()),
      isCorrect,
      expected: expectedChar
    };
    setKeysHistory(prev => [...prev, event]);
    setTypedInput(val);

    // End of Lesson Check
    if (val.length === activeLesson.content.length) {
      concludeAttempt();
    }
  };

  const concludeAttempt = () => {
    if (!activeLesson) return;

    // Check benchmarks validation based on netWpm and grade
    const gradeTarget = studentGrade === 4 ? 11 : studentGrade === 5 ? 22 : 33;
    const isSuspicious = netWpm > 120 && accuracy === 100; // detect robotic keyboard injections

    const newAttempt: Attempt = {
      id: 'att-' + Math.random().toString(36).substr(2, 9),
      studentName,
      studentGrade,
      schoolId,
      classId,
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      grossWpm,
      netWpm,
      accuracy,
      kpm,
      timeSpent: elapsedSeconds,
      date: new Date().toISOString(),
      keystrokeReplay: keysHistory,
      suspicious: isSuspicious
    };

    onNewAttempt(newAttempt);
    alert(`¡Práctica de Dactilografía Completada! \nVisual: ${activeLesson.title}\nVelocidad Neta: ${netWpm} WPM\nPrecisión: ${accuracy}%`);
    setActiveLesson(null);
  };

  // Optimized Duration system early out checker
  // Demonstrates premium EdTech logic monitoring speed / accuracy thresholds
  const canSkipEarly = () => {
    if (!activeLesson) return false;
    const minD = activeLesson.minDuration || 15;
    // Student can exit early if Accuracy > 95% AND speed qualifies
    return elapsedSeconds >= 10 && accuracy >= 95 && netWpm >= activeLesson.targetWpm;
  };

  const forcesCompletion = () => {
    if (!activeLesson) return false;
    // Forces completion if Net speed is less than 15 WPM
    return netWpm < 15;
  };

  const handleEarlyExit = () => {
    if (canSkipEarly()) {
      concludeAttempt();
    }
  };

  // Keyboard fingers highlighting calculation
  const nextTargetChar = activeLesson ? activeLesson.content[typedInput.length] : '';
  const currentKeyAssignment = nextTargetChar ? getKeyAssignment(nextTargetChar, layout) : null;

  const getTargetKeyStyle = (finger: string | undefined): string => {
    if (!finger) return 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]';
    switch (finger) {
      case 'L1': return 'border-rose-500/60 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
      case 'L2': return 'border-amber-500/60 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'L3': return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
      case 'L4': return 'border-blue-500/60 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
      case 'R4': return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]';
      case 'R3': return 'border-purple-500/60 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'R2': return 'border-pink-500/60 bg-pink-500/10 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]';
      case 'R1': return 'border-teal-500/60 bg-teal-500/10 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.3)]';
      case 'Thumb': return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]';
      default: return 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]';
    }
  };

  // Custom Practice Review Generation
  const generateCustomReview = () => {
    let baseText = '';
    
    if (reviewMode === 'difficult') {
      // Find problematic keys in user attempts history
      const studentAttempts = attempts.filter(a => a.studentName === studentName);
      const errorsMap: Record<string, number> = {};
      
      studentAttempts.forEach(a => {
        a.keystrokeReplay.forEach(k => {
          if (!k.isCorrect) {
            errorsMap[k.expected] = (errorsMap[k.expected] || 0) + 1;
          }
        });
      });

      const difficultKeys = Object.entries(errorsMap)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

      if (difficultKeys.length === 0) {
        baseText = 'asdf jkl; asdf jkl; asdf';
      } else {
        baseText = Array.from({ length: 15 }, () => {
          const keyIdx = Math.floor(Math.random() * difficultKeys.length);
          return difficultKeys[keyIdx] + difficultKeys[keyIdx] + ' ';
        }).join('').trim();
      }
    } else if (reviewMode === 'studied') {
      // Selected lesson keys
      const recentLesson = lessons[0];
      const keys = recentLesson.studiedKeys.filter(k => k !== ' ');
      baseText = Array.from({ length: 18 }, () => {
        const keyIdx = Math.floor(Math.random() * keys.length);
        return keys[keyIdx] + keys[keyIdx] + ' ';
      }).join('').trim();
    } else {
      // Manual selection
      if (manualKeys.length === 0) {
        baseText = 'ffjj dd kk fjdk';
      } else {
        baseText = Array.from({ length: 15 }, () => {
          const keyIdx = Math.floor(Math.random() * manualKeys.length);
          return manualKeys[keyIdx] + manualKeys[keyIdx] + ' ';
        }).join('').trim();
      }
    }

    setCustomReviewText(baseText);
    
    // Create simulated temporary Lesson and start custom drill
    const customLesson: Lesson = {
      id: 'custom-review',
      title: `Revisión Personalizada: ${reviewMode.toUpperCase()}`,
      category: 'word',
      content: baseText,
      targetWpm: 20,
      minDuration: 15,
      studiedKeys: manualKeys
    };
    
    startLesson(customLesson);
  };

  const handleManualKeyToggle = (key: string) => {
    setManualKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      if (prev.length >= 6) return prev; // max 6 keys
      return [...prev, key];
    });
  };

  // Background TypingMeter log ticker simulated
  const simulateTypingMeterEntry = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMeterTypedText(val);

    // Speed calculation
    const wordCount = val.length / 5;
    const mockWpm = Math.round(wordCount * 12); // simulated metric scale
    setMeterWpm(mockWpm);
  };

  // Grade Benchmarks lookup
  const getGradeRating = (wpmVal: number) => {
    if (wpmVal >= 45) return { name: 'Leyenda del Teclado (Diamante)', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500' };
    if (wpmVal >= 33) return { name: 'Nivel 6° Grado Excelente (Oro)', color: 'text-amber-500 bg-amber-950/40 border-amber-500' };
    if (wpmVal >= 22) return { name: 'Nivel 5° Grado Fluido (Plata)', color: 'text-slate-300 bg-slate-900 border-slate-600' };
    if (wpmVal >= 11) return { name: 'Nivel 4° Grado Inicial (Bronce)', color: 'text-amber-700 bg-amber-900/10 border-amber-800' };
    return { name: 'Práctica Básica Activa', color: 'text-rose-400 bg-rose-950/20 border-rose-900' };
  };

  // Student metrics
  const studentAttempts = attempts.filter(a => a.studentName === studentName);
  const studentMaxAccuracy = studentAttempts.length > 0
    ? Math.max(...studentAttempts.map(a => a.accuracy))
    : 0;
  const studentAvgAccuracy = studentAttempts.length > 0
    ? Math.round(studentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / studentAttempts.length * 10) / 10
    : 0;
  const studentMaxWpm = studentAttempts.length > 0
    ? Math.max(...studentAttempts.map(a => a.netWpm))
    : 0;

  return (
    <div className={`space-y-6 ${highContrast ? 'text-white' : ''}`}>
      {/* Student Top Header / Profile Info */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-indigo-600/90 text-white rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest uppercase shadow">ESTUDIANTE</span>
            <h2 className="text-xl font-bold tracking-tight text-white">{studentName}</h2>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            Grado: {studentGrade}° Primaria • Redacción • Colegio de Ciencias de la Computación
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-850/50 border border-slate-750/60 rounded-xl p-2.5 px-4 text-center shadow-inner hover:bg-slate-800/80 transition-all min-w-[90px]">
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase mb-0.5">Intentos</span>
            <span className="text-lg font-black text-indigo-400 font-mono">
              {studentAttempts.length}
            </span>
          </div>

          <div className="bg-slate-850/50 border border-slate-750/60 rounded-xl p-2.5 px-4 text-center shadow-inner hover:bg-slate-800/80 transition-all min-w-[120px]">
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase mb-0.5">Velocidad Promedio</span>
            <span className="text-lg font-black text-emerald-450 font-mono">
              {studentAttempts.length > 0
                ? Math.round(studentAttempts.reduce((acc, curr) => acc + curr.netWpm, 0) / studentAttempts.length)
                : 0
              } <sub className="text-xs font-normal">WPM</sub>
            </span>
          </div>

          <div className="bg-slate-850/50 border border-slate-750/60 rounded-xl p-2.5 px-4 text-center shadow-inner hover:bg-slate-800/80 transition-all min-w-[110px]">
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase mb-0.5">Máx Precisión</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {studentMaxAccuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Break reminders block */}
      {showBreakReminder && (
        <div className="bg-indigo-950/40 border border-indigo-505/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">¡Pausa Ergonómica Recomendada! ("Take a Break")</p>
              <p className="text-xs text-slate-300 mt-1">Has estado digitando continuamente. Aparta la mirada de la pantalla, relaja tus dedos y gira tus muñecas por 20 segundos.</p>
            </div>
          </div>
          <button 
            onClick={() => { setShowBreakReminder(false); setLastBreakTime(Date.now()); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold shrink-0 shadow shadow-indigo-600/30 transition-all"
          >
            Siguiente Drill
          </button>
        </div>
      )}

      {/* Module Navigation */}
      <div className="flex bg-slate-900/50 border border-slate-800/80 rounded-xl p-1 overflow-x-auto gap-1 shadow-inner backdrop-blur-md">
        <button
          onClick={() => { setActiveTab('lessons'); setActiveLesson(null); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeTab === 'lessons' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1.5" /> Ejercicios Curriculares
        </button>
        <button
          onClick={() => { setActiveTab('review'); setActiveLesson(null); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeTab === 'review' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" /> Práctica Inteligente
        </button>
        <button
          onClick={() => { setActiveTab('meter'); setActiveLesson(null); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeTab === 'meter' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" /> TypingMeter Background
        </button>

        <button
          onClick={() => { setActiveTab('race'); setActiveLesson(null); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeTab === 'race' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          <Flame className="w-3.5 h-3.5 inline mr-1.5" /> Nitro Race
        </button>
        <button
          onClick={() => { setActiveTab('cert'); setActiveLesson(null); }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${activeTab === 'cert' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
        >
          <Award className="w-3.5 h-3.5 inline mr-1.5" /> Certificados RataType
        </button>
      </div>

      {/* --- ACTIVE RUNNING LESSON OVERLAY VIEW --- */}
      {activeLesson && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-6 lg:space-y-0 animate-fadeIn">
          
          {/* SLEEK SIDEBAR METRICS */}
          <aside className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-6 backdrop-blur-md">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Progreso de Sesión</label>
              
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 shadow-inner">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-mono font-bold text-white italic">{netWpm}</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-sans tracking-wide">WPM NETO</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.max(5, (netWpm / activeLesson.targetWpm) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Meta: {activeLesson.targetWpm} WPM (Grado {studentGrade})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono font-black mb-1">Precisión</span>
                  <span className={`text-base font-bold font-mono ${accuracy >= 95 ? 'text-emerald-400' : accuracy >= 85 ? 'text-amber-400' : 'text-rose-450'}`}>{accuracy}%</span>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-center">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono font-black mb-1">KPM</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{kpm}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Teclas Críticas</label>
              <div className="flex flex-wrap gap-2">
                {currentKeyAssignment ? (
                  <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded text-xs font-mono font-bold shadow shadow-indigo-500/10 animate-pulse">
                    {nextTargetChar.toUpperCase()}
                  </span>
                ) : null}
                <span className="w-8 h-8 flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-mono font-bold">
                  {wrongCharCount > 0 ? '⌫' : 'P'}
                </span>
                <span className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-xs font-mono font-bold">Q</span>
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-750 text-slate-400 rounded text-xs font-mono italic">+</span>
              </div>
            </div>

            <div className="mt-auto p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-xs font-semibold text-indigo-300">Optimized Duration: ON</p>
              <p className="text-[10px] text-indigo-400/70 mt-1 font-mono">El sistema finalizará el drill al alcanzar la meta de velocidad establecida.</p>
            </div>
          </aside>

          {/* MAIN TYPING AREA */}
          <section className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6 backdrop-blur-md">
            
            {/* Lesson Context */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-5">
              <div>
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-tighter">Nivel {activeLesson.id.replace('less-', '')}: Fluidez de Oraciones</span>
                <h2 className="text-2xl font-light text-slate-100 mt-2 italic font-serif underline underline-offset-8 decoration-slate-800">{activeLesson.title}</h2>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl py-1.5 px-4 h-fit">
                <span className="text-[10px] text-slate-500 font-mono">TIME:</span>
                <span className="text-xl font-mono font-bold text-indigo-400 bg-indigo-400/5 px-2.5 py-0.5 rounded border border-indigo-400/10">
                  {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Quick Layout & Controls Info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-405 bg-slate-950/45 p-3 rounded-xl border border-slate-805 gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">⚡ Layout Activo: <b className="text-indigo-400 font-black">{layout}</b> • Coloca las manos en fila guía</span>
                <button
                  type="button"
                  onClick={() => setShowHands(prev => !prev)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border transition-all font-mono uppercase cursor-pointer ${
                    showHands 
                      ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow shadow-indigo-600/10 hover:bg-indigo-600/55' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-805/50'
                  }`}
                >
                  {showHands ? '🖐️ Ocultar Guía' : '🖐️ Mostrar Guía'}
                </button>
              </div>
              <button 
                onClick={() => setActiveLesson(null)}
                className="text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors text-xs font-mono font-bold"
              >
                [ GUARDAR / SALIR ]
              </button>
            </div>

            {/* Text Display */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 relative overflow-hidden select-none min-h-[140px] flex items-center shadow-inner">
              <div className="text-2xl leading-relaxed font-mono tracking-tight text-slate-550 break-words w-full">
                {activeLesson.content.split('').map((char, index) => {
                  let charStyle = "text-slate-600";
                  
                  if (index < typedInput.length) {
                    const wasCorrect = typedInput[index] === char;
                    charStyle = wasCorrect 
                      ? "text-white" 
                      : "text-rose-450 bg-rose-400/10 underline decoration-rose-500 font-black";
                  } else if (index === typedInput.length) {
                    charStyle = "text-white border-l-2 border-indigo-500 bg-indigo-500/20 px-0.5 animate-pulse font-bold";
                  }
                  
                  return (
                    <span key={index} className={charStyle}>
                      {char}
                    </span>
                  );
                })}
              </div>
              <div className="absolute bottom-3 right-4 text-[9px] text-slate-650 font-mono">
                TEXT SOURCE: CURRÍCULO_ESTRATÉGICO.DOCX
              </div>

              {/* Background Capture Text Input (invisible / overlayed styled) */}
              <textarea
                ref={typingAreaRef}
                className="absolute inset-0 opacity-0 cursor-default resize-none"
                value={typedInput}
                onChange={handleKeyboardStroke}
                autoFocus
                tabIndex={0}
                autoComplete="off"
              />
            </div>

            {/* Micro details panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Velocidad Bruta</span>
                <span className="text-xl font-bold text-slate-300 font-mono">{grossWpm} WPM</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Velocidad Neta</span>
                <span className="text-xl font-bold text-indigo-400 font-mono">{netWpm} WPM</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Precisión Real</span>
                <span className="text-xl font-bold text-emerald-450 font-mono">{accuracy}%</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">KPM Total</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{kpm}</span>
              </div>
            </div>

            {/* Speed-Up dynamic feedback */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800 gap-4 mt-2">
              <div className="text-xs text-left text-slate-400 leading-relaxed max-w-lg">
                {forcesCompletion() && (
                  <span className="text-rose-400 flex items-center gap-1.5 font-semibold font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    Memoria Rígida: Tu velocidad es &lt; 15 WPM. Completa todo el ejercicio para fijar memoria táctil.
                  </span>
                )}
                {canSkipEarly() && (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Optimización de Duración: Has superado el benchmark. ¡Puedes completar la lección ahora!
                  </span>
                )}
                {!canSkipEarly() && !forcesCompletion() && (
                  <span className="font-mono">Tu objetivo es un mínimo de <b className="text-white font-bold">{activeLesson.targetWpm} WPM</b>. Sigue manteniendo la constancia y el ritmo continuo.</span>
                )}
              </div>

              {canSkipEarly() && (
                <button
                  onClick={handleEarlyExit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full md:w-auto font-mono"
                >
                  Saltar / Guardar Práctica
                </button>
              )}
            </div>

            {/* VIRTUAL KEYBOARD WITH ACTIVE HIGHLIGHTS */}
            <div className="mt-4 flex flex-col items-center">
              <div className="w-full relative">
                {/* Hand Overlay simulation halos shown if guide is active */}
                {showHands && (
                  <>
                    <div className="absolute -top-12 left-1/4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl border border-indigo-500/25"></div>
                    <div className="absolute -top-12 right-1/4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl border border-indigo-500/25"></div>
                  </>
                )}
                
                {/* Virtual Keyboard Rows */}
                <div className="grid gap-1.5 max-w-3xl mx-auto bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl">
                  {LAYOUT_ROWS[layout].map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1.5">
                      {row.map(k => {
                        const isTarget = nextTargetChar.toLowerCase() === k;
                        const keyStyleClass = isTarget
                          ? (showHands
                              ? getTargetKeyStyle(currentKeyAssignment?.finger)
                              : 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.25)]')
                          : 'border-slate-700/60 text-slate-300 bg-slate-800/85 hover:bg-slate-800 transition-colors';
                        return (
                          <div
                            key={k}
                            className={`w-11 h-11 border rounded flex items-center justify-center text-xs font-mono font-bold transition-all ${keyStyleClass}`}
                          >
                            {k.toUpperCase()}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {/* Space bar bottom row */}
                  <div className="flex justify-center gap-1.5 mt-1.5">
                    <div
                      className={`h-11 w-80 border rounded flex items-center justify-center text-[10px] uppercase font-mono transition-all ${
                        nextTargetChar === ' '
                          ? (showHands
                              ? getTargetKeyStyle('Thumb')
                              : 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.25)] font-bold')
                          : 'border-slate-700/60 bg-slate-800/80 text-slate-500'
                      }`}
                    >
                      Spacebar
                    </div>
                  </div>
                </div>

                {/* Finger Color Zones Indicator & Interactive Hands diagram - only shown if showHands is active */}
                {showHands ? (
                  <div className="space-y-4 mt-6">
                    {/* Interactive Hands Visualizer */}
                    <div className="flex justify-center gap-12 sm:gap-24">
                      {/* Left Hand SVG/Pills */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest font-extrabold uppercase mb-2">MANO IZQUIERDA</span>
                        <div className="flex items-end gap-2.5 h-20 px-5 bg-slate-950/20 border border-slate-850 rounded-2xl relative shadow-inner">
                          {/* Pinky L1 */}
                          <div className={`w-3.5 h-10 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'L1' 
                              ? 'bg-rose-500/85 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse h-11 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="L1: Meñique" />
                          {/* Ring L2 */}
                          <div className={`w-3.5 h-13 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'L2' 
                              ? 'bg-amber-500/85 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse h-14 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="L2: Anular" />
                          {/* Middle L3 */}
                          <div className={`w-3.5 h-15 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'L3' 
                              ? 'bg-emerald-500/85 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse h-16 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="L3: Medio" />
                          {/* Index L4 */}
                          <div className={`w-3.5 h-13 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'L4' 
                              ? 'bg-blue-500/85 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)] animate-pulse h-14 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="L4: Índice" />
                          {/* Thumb (left side) */}
                          <div className={`w-4 h-9 rounded-full border transition-all origin-bottom -rotate-15 ${
                            currentKeyAssignment?.finger === 'Thumb' 
                              ? 'bg-indigo-500/85 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse h-10 translate-y-[-2px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="Thumb: Pulgar" />
                        </div>
                      </div>

                      {/* Right Hand SVG/Pills */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest font-extrabold uppercase mb-2">MANO DERECHA</span>
                        <div className="flex items-end gap-2.5 h-20 px-5 bg-slate-950/20 border border-slate-850 rounded-2xl relative shadow-inner">
                          {/* Thumb (right side) */}
                          <div className={`w-4 h-9 rounded-full border transition-all origin-bottom rotate-15 ${
                            currentKeyAssignment?.finger === 'Thumb' 
                              ? 'bg-indigo-500/85 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse h-10 translate-y-[-2px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="Thumb: Pulgar" />
                          {/* Index R4 */}
                          <div className={`w-3.5 h-13 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'R4' 
                              ? 'bg-indigo-500/85 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse h-14 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="R4: Índice" />
                          {/* Middle R3 */}
                          <div className={`w-3.5 h-15 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'R3' 
                              ? 'bg-purple-500/85 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-pulse h-16 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="R3: Medio" />
                          {/* Ring R2 */}
                          <div className={`w-3.5 h-13 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'R2' 
                              ? 'bg-pink-500/85 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.4)] animate-pulse h-14 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="R2: Anular" />
                          {/* Pinky R1 */}
                          <div className={`w-3.5 h-10 rounded-full border transition-all ${
                            currentKeyAssignment?.finger === 'R1' 
                              ? 'bg-teal-500/85 border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.4)] animate-pulse h-11 translate-y-[-4px]' 
                              : 'bg-slate-800/50 border-slate-700/40'
                          }`} title="R1: Meñique" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-8 mt-2">
                       <div className="flex gap-2 items-center">
                         <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                         <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Guía de Dedos Activa</span>
                       </div>
                       <div className="flex gap-2 items-center font-mono text-[10px] text-indigo-400 font-bold">
                         <span>Dedo óptimo: <b className="text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{currentKeyAssignment ? FINGER_METRIC[currentKeyAssignment.finger]?.name : 'Ninguno'}</b></span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-3">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-medium">🖐️ Guías apagadas. Usa los controles superiores si deseas apoyo visual.</span>
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      )}

      {/* --- TAB 1: CURRICULAR LESSON SELECTION PANEL --- */}
      {activeTab === 'lessons' && !activeLesson && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Estructura Curricular TICs</h3>
                <p className="text-xs text-slate-400">Selecciona un módulo de aprendizaje alineado para tu entrenamiento de velocidad.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-xs h-fit">
                  <span className="text-slate-500 font-mono font-bold uppercase text-[10px]">Disposición:</span>
                  <select 
                    value={layout} 
                    onChange={e => setLayout(e.target.value as KeyboardLayout)}
                    className="bg-transparent text-indigo-400 border-none focus:outline-none focus:ring-0 font-bold cursor-pointer font-mono"
                  >
                    <option value="QWERTY" className="bg-slate-950 text-white">QWERTY Standard</option>
                    <option value="AZERTY" className="bg-slate-950 text-white">AZERTY Francesa</option>
                    <option value="Dvorak" className="bg-slate-950 text-white">Dvorak Simplificada</option>
                    <option value="DvorakLeft" className="bg-slate-950 text-white">Dvorak Mano Izquierda</option>
                    <option value="DvorakRight" className="bg-slate-950 text-white">Dvorak Mano Derecha</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowHands(prev => !prev)}
                  className={`text-xs font-bold py-1.5 px-4 rounded-xl border transition-all h-fit font-mono ${showHands ? 'bg-indigo-600/90 border-indigo-505 text-white shadow shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                >
                  {showHands ? 'Ocultar Manos' : 'Mostrar Manos'}
                </button>

                <button
                  onClick={() => setHighContrast(prev => !prev)}
                  className={`text-xs font-bold py-1.5 px-4 rounded-xl border transition-all h-fit font-mono ${highContrast ? 'bg-indigo-600/90 border-indigo-505 text-white shadow shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                >
                  {highContrast ? 'Modo Normal' : 'Modo Contraste'}
                </button>
              </div>
            </div>

            {/* Curriculum grid categorization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Category 1: Key Drills */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-4 shadow-sm backdrop-blur-xs">
                <div className="flex items-center gap-2 border-b border-slate-850/65 pb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse block" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider font-sans">1. Key Drills (Teclas Básicas)</h4>
                </div>
                <div className="space-y-2">
                  {lessons.filter(l => l.category === 'key').map(l => (
                    <div key={l.id} className="bg-slate-900/60 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 transition-all flex justify-between items-center group shadow-sm hover:border-indigo-500/20">
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block truncate max-w-[130px]">{l.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Meta: {l.targetWpm} WPM</span>
                      </div>
                      <button
                        onClick={() => startLesson(l)}
                        className="bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg p-2 text-xs font-bold shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Word/Sentence Drills */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-4 shadow-sm backdrop-blur-xs">
                <div className="flex items-center gap-2 border-b border-slate-850/65 pb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider font-sans">2. Word Drills (Tránsito Fino)</h4>
                </div>
                <div className="space-y-2">
                  {lessons.filter(l => l.category === 'word').map(l => (
                    <div key={l.id} className="bg-slate-900/60 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 transition-all flex justify-between items-center group shadow-sm hover:border-indigo-500/20">
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block truncate max-w-[130px]">{l.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Meta: {l.targetWpm} WPM</span>
                      </div>
                      <button
                        onClick={() => startLesson(l)}
                        className="bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg p-2 text-xs font-bold shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Text Drills/Exams */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-4 shadow-sm backdrop-blur-xs">
                <div className="flex items-center gap-2 border-b border-slate-850/65 pb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block animate-pulse" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider font-sans">3. Text Drills (Simulación Real)</h4>
                </div>
                <div className="space-y-2">
                  {lessons.filter(l => l.category === 'text').map(l => (
                    <div key={l.id} className="bg-slate-900/60 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 transition-all flex justify-between items-center group shadow-sm hover:border-indigo-500/20">
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block truncate max-w-[130px]">{l.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Meta: {l.targetWpm} WPM</span>
                      </div>
                      <button
                        onClick={() => startLesson(l)}
                        className="bg-slate-800 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg p-2 text-xs font-bold shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ADVANCED ADAPTIVE CUSTOM REVIEW MODULE --- */}
      {activeTab === 'review' && !activeLesson && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-left space-y-6 backdrop-blur-md shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white">Entrenamiento Personalizado Inteligente</h3>
            <p className="text-xs text-slate-400">Configura un módulo de práctica enfocado adaptativo basado en tus estadísticas históricas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: Difficult Keys */}
            <div 
              onClick={() => setReviewMode('difficult')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${reviewMode === 'difficult' ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-550/5' : 'bg-slate-950/40 border-slate-850 hover:border-slate-700/60'}`}
            >
              <span className="text-xs font-bold block mb-1">🔥 Difficult Keys (Estilo TypingMaster)</span>
              <p className="text-[11px] text-slate-400">Analiza tus pulsaciones y extrae automáticamente las teclas que más fallas.</p>
            </div>

            {/* Option 2: Studied Keys */}
            <div 
              onClick={() => setReviewMode('studied')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${reviewMode === 'studied' ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-550/5' : 'bg-slate-950/40 border-slate-850 hover:border-slate-700/60'}`}
            >
              <span className="text-xs font-bold block mb-1">📘 Studied Keys (Lección Actual)</span>
              <p className="text-[11px] text-slate-400">Práctica exclusiva basada únicamente en las teclas de la lección seleccionada.</p>
            </div>

            {/* Option 3: Manual Selection */}
            <div 
              onClick={() => setReviewMode('manual')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${reviewMode === 'manual' ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-550/5' : 'bg-slate-950/40 border-slate-850 hover:border-slate-700/60'}`}
            >
              <span className="text-xs font-bold block mb-1">⚙️ Selección Docente / Manual</span>
              <p className="text-[11px] text-slate-400">Fuerza la ejercitación en un subconjunto de hasta 6 letras específicas.</p>
            </div>
          </div>

          {reviewMode === 'manual' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <p className="text-xs text-slate-300 font-bold">Haz click en hasta 6 teclas para ejercitar:</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {"abcdefghijklmnopqrstuvwxyz".split('').map(char => {
                  const isSel = manualKeys.includes(char);
                  return (
                    <button
                      key={char}
                      onClick={() => handleManualKeyToggle(char)}
                      className={`w-8 h-8 rounded border text-xs font-bold font-mono transition-all ${isSel ? 'bg-indigo-600 border-indigo-500 text-white scale-110' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      {char.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 text-center font-mono">Teclas Seleccionadas ({manualKeys.length}/6): {manualKeys.join(', ').toUpperCase() || 'Ninguna'}</p>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={generateCustomReview}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 px-6 text-xs font-bold font-mono shadow shadow-indigo-600/20 transition-all hover:scale-102 active:scale-98"
            >
              Generar y Comenzar Ejercicio
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: TYPING METER SIMULATION TRACKER --- */}
      {activeTab === 'meter' && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-left space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/25">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Módulo TypingMeter (Simulador en Segundo Plano)</h3>
              <p className="text-xs text-slate-400">Simula el monitoreo de dactilografía mientras redactas correos o tareas externas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-mono">Pega o escribe tu correo de prueba para medir tu rendimiento:</p>
              
              <textarea
                value={meterTypedText}
                onChange={simulateTypingMeterEntry}
                rows={5}
                className="w-full bg-slate-950/60 border border-slate-800/85 focus:border-indigo-500 rounded-xl p-3 focus:outline-none text-xs font-mono text-white leading-relaxed focus:ring-1 focus:ring-indigo-500/25 transition-all"
                placeholder="Empieza a redactar aquí para medir tu ritmo..."
              />
            </div>

            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-850/80 flex flex-col justify-between shadow-inner">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase font-bold mb-1">MÉTRICAS DETECTADAS</span>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">El motor de segundo plano está analizando el flujo rítmico y la fatiga muscular virtual.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-2">
                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 text-center shadow-inner">
                  <span className="text-[10px] text-slate-500 font-mono block">RITMO ESTIMADO</span>
                  <span className="text-lg font-black text-indigo-400 font-mono mt-0.5 block">{meterWpm} WPM</span>
                </div>

                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 text-center shadow-inner">
                  <span className="text-[10px] text-slate-500 font-mono block">CARGA COGNITIVA</span>
                  <span className="text-lg font-black text-emerald-450 font-mono mt-0.5 block">Baja (-12%)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal font-mono mt-3">
                *La reducción de carga visual libera corteza cerebral prefrontal para concentrarte en el contenido de tus ensayos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: MULTIPLAYER RACING TRACK (NITRO TYPE) --- */}
      {activeTab === 'race' && (
        <TypingRace />
      )}

      {/* --- TAB 5: RATATYPE ACHIEVEMENT CERTIFICATE GENERATOR --- */}
      {activeTab === 'cert' && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-left space-y-6 backdrop-blur-md shadow-xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Certificados de Validación Dactilográfica</h3>
              <p className="text-xs text-slate-400">Verifica y descarga tus diplomas de maestría motriz alineados con los estándares TICs.</p>
            </div>

            {/* Certificate Display styling */}
            <div className="bg-gradient-to-r from-amber-500/5 via-slate-950/90 to-indigo-500/5 p-10 rounded-2xl border-2 border-dashed border-indigo-500/45 text-center relative overflow-hidden ring-1 ring-indigo-500/10 shadow-2xl">
              
              {/* Retro watermark lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-[0.03] [background-size:12px_12px]" />
              
              <div className="space-y-4 relative z-10">
                <span className="text-[11px] text-amber-500 tracking-widest font-mono block font-black uppercase">DIPLOMA OFICIAL TICS</span>
                
                <h4 className="text-2xl font-serif text-slate-105 italic">Certificado de Excelencia de Escritura</h4>
                <p className="text-xs text-slate-500 font-mono">Otorgado con orgullo y mérito técnico a:</p>
                
                <p className="text-2xl font-black text-white tracking-wide font-sans">{studentName}</p>
                
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Por demostrar habilidades ágiles excepcionales de digitación táctil autónoma, alcanzando una velocidad neta calificada de:
                </p>

                {/* Best speed banner */}
                <div className="w-fit mx-auto bg-slate-900/80 border border-indigo-500/30 rounded-xl py-3 px-6 my-4 flex items-center gap-4 shadow-lg backdrop-blur-sm">
                  <span className="text-3xl font-black font-mono text-emerald-450">
                    {studentMaxWpm || 24}
                  </span>
                  <div className="text-left font-mono">
                    <span className="text-xs text-white block font-bold tracking-tight">WPM NETOS</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Precisión promedio: {studentAvgAccuracy}%</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-900 max-w-sm mx-auto">
                  <span>ID Registro: CCC-849-01</span>
                  <span>Firma: Comité Técnico TICs</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => alert('¡Certificado preparado para impresión! Guardado en la caché curricular.')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 px-6 text-xs font-bold font-mono shadow shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Imprimir / Ver PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
