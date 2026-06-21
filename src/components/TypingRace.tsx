import React, { useState, useEffect, useRef } from 'react';
import { Car, Flag, RotateCcw, Play, Zap, Trophy } from 'lucide-react';

interface Racer {
  id: string;
  name: string;
  isBot: boolean;
  avatar: string;
  color: string;
  wpm: number;
  progress: number; // 0 to 100
  place?: number;
}

export default function TypingRace() {
  const [raceState, setRaceState] = useState<'idle' | 'countdown' | 'racing' | 'finished'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [typedText, setTypedText] = useState('');
  const [textToType] = useState('Los sistemas operativos de las computadoras modernas administran los recursos de hardware de manera eficiente, garantizando que el software de codificacion y ejecucion funcione sin latencia alguna.');
  const [playerWpm, setPlayerWpm] = useState(0);
  const [rankings, setRankings] = useState<Racer[]>([]);

  const startRaceTime = useRef<number | null>(null);
  const raceInterval = useRef<number | null>(null);

  const initRacers = () => {
    return [
      { id: 'player', name: 'Tú (Estudiante)', isBot: false, avatar: '🏎️', color: 'from-blue-500 to-indigo-600', wpm: 0, progress: 0 },
      { id: 'bot1', name: 'Bot Alumno_Estándar', isBot: true, avatar: '🚗', color: 'from-amber-500 to-orange-500', wpm: 28, progress: 0 },
      { id: 'bot2', name: 'Bot Profesor_Súper_Veloz', isBot: true, avatar: '🛸', color: 'from-purple-500 to-pink-500', wpm: 50, progress: 0 },
      { id: 'bot3', name: 'Bot Novato_Teclado', isBot: true, avatar: '🚜', color: 'from-slate-500 to-zinc-500', wpm: 18, progress: 0 }
    ];
  };

  const handleStartClicked = () => {
    setRaceState('countdown');
    setCountdown(3);
    setTypedText('');
    setPlayerWpm(0);
    setRankings([]);
    setRacers(initRacers());
  };

  // Countdown clock effect
  useEffect(() => {
    if (raceState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setRaceState('racing');
        startRaceTime.current = Date.now();
      }
    }
  }, [raceState, countdown]);

  // General Bot and progress controller
  useEffect(() => {
    if (raceState === 'racing') {
      const startTime = Date.now();
      
      const interval = window.setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        
        setRacers(prev => {
          let updated = prev.map(r => {
            if (r.place !== undefined) return r; // already finished
            
            let wpm = r.wpm;
            let progress = 0;

            if (r.isBot) {
              // Bot has a constant typing speed + small random variance
              const currentWpm = r.wpm + (Math.sin(elapsedSec) * 4);
              const charsTyped = (currentWpm * 5) * (elapsedSec / 60);
              progress = Math.min((charsTyped / textToType.length) * 100, 100);
            } else {
              // Player progress is managed through typing input
              progress = Math.min((typedText.length / textToType.length) * 100, 100);
              wpm = playerWpm;
            }

            const isDone = progress >= 100;
            return {
              ...r,
              progress,
              wpm: isDone ? wpm : Math.round(wpm)
            };
          });

          // Check if anyone new has crossed the line and assign dynamic places
          const unfinishedInOrder = updated
            .filter(r => r.place === undefined)
            .sort((a, b) => b.progress - a.progress);

          unfinishedInOrder.forEach(r => {
            if (r.progress >= 100) {
              const place = updated.filter(x => x.place !== undefined).length + 1;
              r.place = place;
              setRankings(curr => [...curr, r]);
            }
          });

          // If everyone is done (or player finished), finish race
          const playerRacer = updated.find(r => r.id === 'player');
          const allDone = updated.every(r => r.progress >= 100);
          if (allDone || (playerRacer && playerRacer.progress >= 100)) {
            // Force bots that didn't finish to complete with placeholder ranks
            updated.forEach(r => {
              if (r.progress < 100) {
                r.progress = 100;
                const place = updated.filter(x => x.place !== undefined).length + 1;
                r.place = place;
                setRankings(curr => [...curr, r]);
              }
            });
            setRaceState('finished');
          }

          return updated;
        });

      }, 250);

      raceInterval.current = interval;
      return () => clearInterval(interval);
    }
  }, [raceState, typedText, playerWpm]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (raceState !== 'racing') return;
    const input = e.target.value;
    
    // Check key bounds
    if (textToType.startsWith(input)) {
      setTypedText(input);
      
      // Calculate real-time player WPM
      const elapsedMin = (Date.now() - (startRaceTime.current || Date.now())) / 60000;
      if (elapsedMin > 0) {
        const currentWpm = Math.round((input.length / 5) / elapsedMin);
        setPlayerWpm(currentWpm);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white overflow-hidden shadow-2xl relative">
      <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-6">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 border border-blue-500/30">
          <Car className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-lg tracking-tight">Carreras en Tiempo Real (Estilo Nitro Type)</h3>
          <p className="text-xs text-slate-400">Compite contra tres oponentes virtuales autónomos. ¡Tu velocidad de escritura impulsa el motor!</p>
        </div>
      </div>

      {raceState === 'idle' && (
        <div className="h-72 flex flex-col justify-center items-center text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800/80">
          <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
          <h4 className="text-lg font-bold">Autódromo de Dactilografía Escolar</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Escribe un párrafo sobre tecnología educativa lo más rápido posible. Los errores de digitación bloquearán temporalmente la velocidad del karting.
          </p>
          <button
            onClick={handleStartClicked}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 px-6 font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-current" /> Calentar Motores y Comenzar
          </button>
        </div>
      )}

      {raceState === 'countdown' && (
        <div className="h-72 flex flex-col justify-center items-center bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-2">Comienza la Carrera en:</span>
          <span className="text-6xl font-black text-white px-6 py-2 bg-indigo-950 border border-indigo-400 rounded-2xl animate-ping duration-1000">
            {countdown > 0 ? countdown : '¡YA!'}
          </span>
        </div>
      )}

      {(raceState === 'racing' || raceState === 'finished') && (
        <div className="space-y-6">
          {/* Race Tracks View */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
            {racers.map(r => {
              const isPlayer = r.id === 'player';
              return (
                <div key={r.id} className="relative">
                  {/* Track line info */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className={isPlayer ? 'text-blue-400 font-bold' : ''}>
                      {r.avatar} {r.name} {r.place && <b className="text-yellow-400 opacity-90">({r.place}° Lugar)</b>}
                    </span>
                    <span>{r.wpm} WPM</span>
                  </div>

                  {/* Track Lane road */}
                  <div className="bg-slate-900 border border-slate-800 h-8 rounded-md relative overflow-hidden flex items-center pr-10">
                    {/* Bot or player car icon placement */}
                    <div
                      className="absolute transition-all duration-300 ease-out"
                      style={{ left: `calc(${r.progress}% - 30px)`, marginLeft: '30px' }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-2xl filter drop-shadow">{r.avatar}</span>
                        {isPlayer && <span className="text-[10px] font-bold text-white bg-blue-600 px-1 py-0.5 rounded animate-pulse">Tú</span>}
                      </div>
                    </div>

                    {/* Finish Line checkerboard flag */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] bg-slate-800 border-l border-slate-700 flex items-center justify-center">
                      <Flag className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Race text inputs */}
          {raceState === 'racing' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="text-sm font-mono leading-relaxed text-slate-300 text-left select-none">
                {textToType.split('').map((char, index) => {
                  let color = "text-slate-500";
                  if (index < typedText.length) {
                    color = "text-emerald-400 font-medium bg-emerald-500/10";
                  }
                  return <span key={index} className={color}>{char}</span>;
                })}
              </div>

              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 focus:outline-none focus:border-indigo-500 text-sm font-mono text-white"
                placeholder="Digita aquí para acelerar tu auto..."
                value={typedText}
                onChange={handleTypingChange}
                autoFocus
                autoComplete="off"
              />
              
              <div className="flex gap-4 justify-between text-xs text-slate-400 font-mono">
                <span>Progreso: {Math.round((typedText.length / textToType.length) * 100)}%</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Velocidad: {playerWpm} WPM</span>
              </div>
            </div>
          )}

          {raceState === 'finished' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-indigo-950 text-center space-y-4">
              <h4 className="text-lg font-bold text-indigo-400 flex items-center justify-center gap-2">
                🏆 ¡Gran Carrera Finalizada!
              </h4>
              
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-lg divide-y divide-slate-800">
                {rankings.map((r, i) => (
                  <div key={r.id} className="flex justify-between items-center p-3 text-sm font-mono">
                    <span className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold w-4">{i + 1}.</span>
                      <span>{r.avatar} {r.name}</span>
                    </span>
                    <span className="text-slate-300 font-bold">{r.wpm} WPM</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartClicked}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 px-5 mx-auto text-xs font-bold active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Correr Otra Vez
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
