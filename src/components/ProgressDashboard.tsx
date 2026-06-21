import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Award, 
  Flame, 
  Zap, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Activity,
  ThumbsUp,
  Target
} from 'lucide-react';
import { Attempt } from '../types';

interface ProgressDashboardProps {
  attempts: Attempt[];
  studentName?: string;
}

interface Medal {
  id: string;
  name: string;
  targetWpm: number;
  unlocked: boolean;
  color: string;
  borderColor: string;
  glowColor: string;
  badge: string;
  description: string;
}

interface ChartBreakdown {
  lessonId: string;
  lessonTitle: string;
  minutes: number;
  percentage: number;
}

interface ChartDayData {
  label: string;
  date: string;
  totalMinutes: number;
  breakdown: ChartBreakdown[];
}

const PERIODS = [
  { id: 'this-week', label: 'Esta semana' },
  { id: 'last-7', label: 'Últ. 7 días' },
  { id: 'last-14', label: 'Últ. 14 días' },
  { id: 'last-30', label: 'Últ. 30 días' },
  { id: 'all', label: 'Todo' },
] as const;

type Period = (typeof PERIODS)[number]['id'];

const STACK_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#06b6d4', '#84cc16', '#a855f7', '#e11d48',
];

export default function ProgressDashboard({ 
  attempts = [], 
  studentName = 'Estudiante'
}: ProgressDashboardProps) {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 280 });
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('this-week');
  const [hoveredSegment, setHoveredSegment] = useState<{
    label: string;
    lessonTitle: string;
    minutes: number;
    percentage: number;
  } | null>(null);

  // Filter student attempts
  const studentAttempts = attempts.filter(a => a.studentName === studentName);
  
  // Speed metrics
  const maxWpm = studentAttempts.length > 0 
    ? Math.max(...studentAttempts.map(a => a.netWpm)) 
    : 0;

  const avgWpm = studentAttempts.length > 0
    ? Math.round(studentAttempts.reduce((sum, a) => sum + a.netWpm, 0) / studentAttempts.length)
    : 0;

  const maxAccuracy = studentAttempts.length > 0
    ? Math.max(...studentAttempts.map(a => a.accuracy))
    : 0;

  // 1. Calculate Nivel Alcanzado (Nivel 1 a Nivel 5)
  const getLevelInfo = (wpm: number) => {
    if (wpm >= 45) {
      return {
        level: 5,
        title: 'Maestro de Leyenda',
        subtitle: 'Velocidad de nivel experto, maestría táctil total.',
        color: 'from-amber-400 to-yellow-500',
        textColor: 'text-amber-400',
        nextMilestone: '¡Has alcanzado la cima!',
        progressPercent: 100
      };
    } else if (wpm >= 33) {
      return {
        level: 4,
        title: 'Técnico de Oro',
        subtitle: 'Fluidez excelente con velocidad óptima del sistema.',
        color: 'from-yellow-500 to-amber-600',
        textColor: 'text-yellow-500',
        nextMilestone: 'Maestro de Leyenda',
        targetWpm: 45,
        progressPercent: Math.round(((wpm - 33) / (45 - 33)) * 100)
      };
    } else if (wpm >= 22) {
      return {
        level: 3,
        title: 'Digitador de Plata',
        subtitle: 'Velocidad de digitación consistente y fluida.',
        color: 'from-slate-350 to-indigo-400',
        textColor: 'text-slate-300',
        nextMilestone: 'Técnico de Oro',
        targetWpm: 33,
        progressPercent: Math.round(((wpm - 22) / (33 - 22)) * 100)
      };
    } else if (wpm >= 11) {
      return {
        level: 2,
        title: 'Dactilógrafo de Bronce',
        subtitle: 'Velocidad de arranque para quienes comienzan a usar múltiples dedos.',
        color: 'from-amber-700 to-amber-500',
        textColor: 'text-amber-600',
        nextMilestone: 'Digitador de Plata',
        targetWpm: 22,
        progressPercent: Math.round(((wpm - 11) / (22 - 11)) * 100)
      };
    } else {
      return {
        level: 1,
        title: 'Iniciador del Teclado',
        subtitle: 'Familiarizándote con el mapeo espacial de dedos.',
        color: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-400',
        nextMilestone: 'Dactilógrafo de Bronce',
        targetWpm: 11,
        progressPercent: Math.round((wpm / 11) * 100)
      };
    }
  };

  const currentLevel = getLevelInfo(maxWpm);

  // 2. Medals definitions and lock statuses
  const medals: Medal[] = [
    {
      id: 'bronze',
      name: 'Medalla TICs de Bronce',
      targetWpm: 11,
      unlocked: maxWpm >= 11,
      color: 'from-amber-800 to-amber-650',
      borderColor: 'border-amber-700/60',
      glowColor: 'rgba(217,119,6,0.3)',
      badge: '🥉',
      description: 'Supera 11 pal/min. Nivel inicial del sistema dactilográfico.'
    },
    {
      id: 'silver',
      name: 'Medalla TICs de Plata',
      targetWpm: 22,
      unlocked: maxWpm >= 22,
      color: 'from-slate-400 to-indigo-400/80',
      borderColor: 'border-slate-500/50',
      glowColor: 'rgba(129,140,248,0.3)',
      badge: '🥈',
      description: 'Supera 22 pal/min. Dominio de palabras y oraciones fluidas.'
    },
    {
      id: 'gold',
      name: 'Medalla TICs de Oro',
      targetWpm: 33,
      unlocked: maxWpm >= 33,
      color: 'from-yellow-550 to-amber-500',
      borderColor: 'border-yellow-600/60',
      glowColor: 'rgba(245,158,11,0.4)',
      badge: '🥇',
      description: 'Supera 33 pal/min. Demuestra desempeño del sistema.'
    },
    {
      id: 'diamond',
      name: 'Gran Copa de Diamante',
      targetWpm: 45,
      unlocked: maxWpm >= 45,
      color: 'from-cyan-400 via-indigo-400 to-pink-500',
      borderColor: 'border-cyan-500/65',
      glowColor: 'rgba(34,211,238,0.5)',
      badge: '💎',
      description: 'Supera 45 pal/min o más. Leyenda dactilográfica con alta precisión.'
    }
  ];

  // Progress towards subsequent targets
  const getProgressToNextMedal = () => {
    const nextLocked = medals.find(m => !m.unlocked);
    if (!nextLocked) {
      return { name: 'Completado', percent: 100, remaining: 0, badge: '🏆' };
    }
    const previousTarget = nextLocked.id === 'bronze' ? 0 : (medals.find(m => m.targetWpm < nextLocked.targetWpm && !medals.find(inner => inner.targetWpm > m.targetWpm && inner.targetWpm < nextLocked.targetWpm))?.targetWpm || 0);
    const range = nextLocked.targetWpm - previousTarget;
    const currentOverBase = maxWpm - previousTarget;
    const pct = Math.max(0, Math.min(100, Math.round((currentOverBase / range) * 100)));
    return {
      name: nextLocked.name,
      percent: pct,
      remaining: nextLocked.targetWpm - maxWpm,
      badge: nextLocked.badge
    };
  };

  const nextMedalProg = getProgressToNextMedal();

  // 3. Prepare stacked bar chart data
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatShortDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

  const getChartData = (): ChartDayData[] => {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (selectedPeriod) {
      case 'this-week': {
        startDate = getMonday(now);
        break;
      }
      case 'last-7': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'last-14': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 13);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'last-30': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'all': {
        startDate = new Date(0);
        break;
      }
    }

    const filtered = studentAttempts.filter(a => {
      try {
        const d = new Date(a.date);
        return d >= startDate && d <= endDate;
      } catch {
        return false;
      }
    });

    const dateMap = new Map<string, Map<string, { lessonTitle: string; seconds: number }>>();
    filtered.forEach(a => {
      const dateKey = formatDateKey(new Date(a.date));
      if (!dateMap.has(dateKey)) dateMap.set(dateKey, new Map());
      const lessonMap = dateMap.get(dateKey)!;
      if (!lessonMap.has(a.lessonId)) {
        lessonMap.set(a.lessonId, { lessonTitle: a.lessonTitle, seconds: 0 });
      }
      lessonMap.get(a.lessonId)!.seconds += a.timeSpent;
    });

    const buildBreakdown = (lessonMap: Map<string, { lessonTitle: string; seconds: number }>, totalSec: number) =>
      Array.from(lessonMap.entries()).map(([lessonId, info]) => ({
        lessonId,
        lessonTitle: info.lessonTitle,
        minutes: Math.round(info.seconds / 60),
        percentage: totalSec > 0 ? Math.round((info.seconds / totalSec) * 100) : 0,
      }));

    if (selectedPeriod === 'all') {
      return Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, lessonMap]) => {
          const totalSec = Array.from(lessonMap.values()).reduce((s, v) => s + v.seconds, 0);
          const totalMin = Math.round(totalSec / 60);
          return {
            label: formatShortDate(new Date(dateKey)),
            date: dateKey,
            totalMinutes: totalMin,
            breakdown: buildBreakdown(lessonMap, totalSec),
          };
        });
    }

    const result: ChartDayData[] = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= endDate) {
      const dateKey = formatDateKey(cursor);
      const lessonMap = dateMap.get(dateKey);
      const totalSec = lessonMap ? Array.from(lessonMap.values()).reduce((s, v) => s + v.seconds, 0) : 0;
      const totalMin = Math.round(totalSec / 60);
      result.push({
        label: formatShortDate(cursor),
        date: dateKey,
        totalMinutes: totalMin,
        breakdown: lessonMap ? buildBreakdown(lessonMap, totalSec) : [],
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  };

  const chartData = getChartData();
  const totalPracticeSeconds = studentAttempts.reduce((acc, current) => acc + current.timeSpent, 0);
  const totalPracticeMinutesReal = Math.round(totalPracticeSeconds / 60) || 0;
  const scaledCumulativeHours = (totalPracticeSeconds / 3600).toFixed(1);

  // ResizeObserver hook implementation
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Calculate responsive dimensions
      const finalWidth = Math.max(300, width);
      setDimensions({
        width: finalWidth,
        height: 250
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 4. Render D3 stacked bar chart with per-lesson segments
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 25, right: 20, bottom: 35, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.label))
      .padding(0.3);

    const maxTotal = d3.max(chartData, d => d.totalMinutes) || 10;
    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, Math.max(10, maxTotal + 5)]);

    // Color map: stable assignment per lessonId
    const allLessonIds = Array.from(new Set(chartData.flatMap(d => d.breakdown.map(b => b.lessonId))));
    const colorMap = new Map<string, string>();
    allLessonIds.forEach((id, i) => colorMap.set(id, STACK_COLORS[i % STACK_COLORS.length]));

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.35)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''));

    // X Axis
    const xAxis = svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .attr('color', '#64748b');
    xAxis.selectAll('text')
      .style('font-size', chartData.length > 10 ? '8px' : '10px')
      .style('font-family', 'ui-monospace, monospace')
      .style('fill', '#94a3b8')
      .attr('transform', chartData.length > 10 ? 'rotate(45)' : null)
      .attr('text-anchor', chartData.length > 10 ? 'start' : 'middle');

    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-size', '9px')
      .style('font-family', 'ui-monospace, monospace')
      .style('fill', '#94a3b8');

    // Stacked segments per day
    chartData.forEach((day, idx) => {
      let cum = 0;

      day.breakdown.forEach(seg => {
        const yTop = y(cum + seg.minutes);
        const yBottom = y(cum);
        const barHeight = yBottom - yTop;
        const color = colorMap.get(seg.lessonId) || '#6366f1';

        svg.append('rect')
          .attr('x', x(day.label)!)
          .attr('width', x.bandwidth())
          .attr('y', height)
          .attr('height', 0)
          .attr('fill', color)
          .attr('rx', 2)
          .attr('opacity', 0.9)
          .style('cursor', 'pointer')
          .on('mouseover', function () {
            d3.select(this).attr('stroke', '#fff').attr('stroke-width', 1).attr('opacity', 1);
            setHoveredSegment({
              label: day.label,
              lessonTitle: seg.lessonTitle,
              minutes: seg.minutes,
              percentage: seg.percentage,
            });
          })
          .on('mouseout', function () {
            d3.select(this).attr('stroke', 'none').attr('opacity', 0.9);
            setHoveredSegment(null);
          })
          .transition()
          .delay(idx * 50)
          .duration(600)
          .attr('y', yTop)
          .attr('height', barHeight);

        cum += seg.minutes;
      });

      // Total label on top
      if (day.totalMinutes > 0) {
        svg.append('text')
          .attr('x', x(day.label)! + x.bandwidth() / 2)
          .attr('y', y(day.totalMinutes) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('font-family', 'ui-monospace, monospace')
          .style('font-weight', 'bold')
          .style('fill', '#818cf8')
          .text(`${day.totalMinutes}m`);
      }
    });

  }, [chartData, dimensions]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white overflow-hidden shadow-2xl relative space-y-6">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header section with profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-550 to-indigo-750 p-2.5 rounded-xl text-white border border-indigo-500/35 shadow-lg shadow-indigo-600/10">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">Estadísticas & Medallero Curricular</h3>
            <p className="text-xs text-slate-400">Controla tus progresos semanales y tu estado de insignias oficiales.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-850 text-xs font-mono">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Progreso Diario Activo:</span>
          <span className="text-indigo-400 font-extrabold">{scaledCumulativeHours} hrs totales</span>
        </div>
      </div>

      {/* Nivel alcanzado widget representation */}
      <div className="grid md:grid-cols-12 gap-5 items-stretch">
        
        {/* Nivel Card */}
        <div className="md:col-span-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[55px] select-none opacity-10 font-black font-sans leading-none">
            {currentLevel.level}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-tight bg-indigo-500/20 text-indigo-400 border border-indigo-500/15">
                Nivel dactilar
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-mono">RANGO ALCANZADO:</div>
              <h4 className={`text-xl font-black tracking-tight bg-gradient-to-r ${currentLevel.color} bg-clip-text text-transparent`}>
                {currentLevel.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">{currentLevel.subtitle}</p>
            </div>
          </div>

          <div className="space-y-2 mt-6 border-t border-slate-900/80 pt-4">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Siguiente Rango:</span>
              <span className="text-slate-300 font-semibold">{currentLevel.nextMilestone}</span>
            </div>
            {currentLevel.targetWpm && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentLevel.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-505">
                  <span>Actual: {maxWpm} pal/min</span>
                  <span>Meta: {currentLevel.targetWpm} pal/min</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medalla Siguiente Widget */}
        <div className="md:col-span-8 bg-slate-950/70 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-extrabold uppercase">SIGUIENTE MEDALLA COMPROMETIDA</span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                {nextMedalProg.badge} {nextMedalProg.name}
              </span>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850/60 flex items-center gap-4 relative overflow-hidden">
              <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] select-none">
                {nextMedalProg.badge}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">Progreso hacia el logro:</span>
                  <span className="text-indigo-455 font-black">{nextMedalProg.percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${nextMedalProg.percent}%` }}
                  />
                </div>
                {nextMedalProg.remaining > 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono">Necesitas aumentar <b className="text-slate-300">{nextMedalProg.remaining} pal/min más</b> para desbloquear este galardón.</p>
                ) : (
                  <p className="text-[10px] text-emerald-400 font-mono">¡Impresionante! Has desbloqueado todos los niveles de excelencia del currículum.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-900/80">
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 block font-mono font-extrabold">RENDIMIENTO MÁX</span>
              <span className="text-sm font-black text-white font-mono">{maxWpm} <sub className="text-[9px] font-normal text-slate-400">pal/min</sub></span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 block font-mono font-extrabold">MÁX PRECISIÓN</span>
              <span className="text-sm font-black text-emerald-450 font-mono">{maxAccuracy}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 block font-mono font-extrabold">PRÁCTICAS</span>
              <span className="text-sm font-black text-indigo-400 font-mono">{studentAttempts.length} <sub className="text-[9px] font-normal text-slate-400">drills</sub></span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 block font-mono font-extrabold">TIEMPO REAL</span>
              <span className="text-sm font-black text-amber-500 font-mono">{totalPracticeMinutesReal} <sub className="text-[9px] font-normal text-slate-400">min</sub></span>
            </div>
          </div>

        </div>
      </div>

      {/* D3 chart Practice Hours / Minutes representation */}
      <div className="bg-slate-950/65 rounded-2xl border border-slate-850 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-900/10 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-sm tracking-tight text-white">Minutos de Práctica</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-indigo-600/80 text-white border border-indigo-400/40'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div ref={containerRef} className="w-full bg-slate-950 rounded-xl relative p-3 border border-slate-900/60 overflow-hidden select-none">
          {/* Tooltip on hover */}
          {hoveredSegment && (
            <div className="absolute top-2 right-2 bg-slate-800/95 border border-slate-600/40 py-2 px-3.5 rounded-lg text-white font-mono text-[10px] shadow-lg z-20 space-y-1 min-w-[140px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">{hoveredSegment.label}</span>
                <span className="font-bold text-indigo-400">{hoveredSegment.minutes} min</span>
              </div>
              <div className="text-[11px] text-slate-200 font-sans leading-tight">{hoveredSegment.lessonTitle}</div>
              <div className="text-[9px] text-slate-500">{hoveredSegment.percentage}% del día</div>
            </div>
          )}

          <svg ref={chartRef} className="max-w-full block mx-auto overflow-visible" />
        </div>

        {/* Legend */}
        {(() => {
          const legendItems = Array.from(
            new Map(
              chartData.flatMap(d => d.breakdown.map(b => [b.lessonId, { lessonId: b.lessonId, lessonTitle: b.lessonTitle }]))
            ).values()
          );
          if (legendItems.length === 0) return null;
          const colorMap = new Map<string, string>();
          legendItems.forEach((item, i) => colorMap.set(item.lessonId, STACK_COLORS[i % STACK_COLORS.length]));
          return (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
              {legendItems.map(item => (
                <div key={item.lessonId} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: colorMap.get(item.lessonId) }} />
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{item.lessonTitle}</span>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="flex items-center gap-2 bg-indigo-950/15 border border-indigo-900/20 px-4 py-2.5 rounded-xl text-[11px] text-slate-400 leading-relaxed font-sans">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span><b>Alineación pedagógica:</b> Se aconseja realizar un mínimo de 10 minutos de ejercicios curriculares a diario para fortalecer la memoria muscular táctil de los dedos.</span>
        </div>
      </div>

      {/* Medallero interactivo general list */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm tracking-tight text-slate-200">Premios Curriculares y Copa Académica TICs</h4>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {medals.map(m => {
            const isUnlocked = m.unlocked;
            return (
              <div 
                key={m.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all relative overflow-hidden ${
                  isUnlocked 
                    ? 'bg-slate-950/70 border-slate-800' 
                    : 'bg-slate-950/10 border-slate-900 opacity-60'
                }`}
                style={{ 
                  boxShadow: isUnlocked ? `0 0 14px ${m.glowColor}` : 'none' 
                }}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl drop-shadow-md select-none">{m.badge}</span>
                    {isUnlocked ? (
                      <span className="text-[8px] bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Obtenido
                      </span>
                    ) : (
                      <span className="text-[8px] bg-slate-900 border border-slate-850 text-slate-500 font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                        Bloqueado
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-xs text-slate-100">{m.name}</h5>
                  <p className="text-[10px] text-slate-400 leading-snug">{m.description}</p>
                </div>

                <div className="text-[9px] font-mono text-slate-550 pt-2 border-t border-slate-900">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> ¡Completado! ({m.targetWpm} pal/min)
                    </span>
                  ) : (
                    <span>Objetivo: {m.targetWpm} pal/min</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
