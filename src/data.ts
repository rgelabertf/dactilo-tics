import { Lesson, Attempt } from './types';

export const INITIAL_LESSONS: Lesson[] = [
  // --- KEY DRILLS ---
  {
    id: 'key-1',
    title: 'Fila Guía Básica (F, J, D, K)',
    category: 'key',
    content: 'ffjj ddkk fjdf fjdj djkf djkf jkdf fjdj fjdk ffjj ddkk fj fj dk dk',
    targetWpm: 15,
    minDuration: 15,
    studiedKeys: ['f', 'j', 'd', 'k', ' ']
  },
  {
    id: 'key-2',
    title: 'Fila Guía Expandida (A, S, L, Ñ / Semi-colon)',
    category: 'key',
    content: 'asdf jkl; asdf jkl; asdf jkl; askf jld; lasd fjsk asdf jkl; slad jfks',
    targetWpm: 18,
    minDuration: 15,
    studiedKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'ñ', ' ']
  },
  {
    id: 'key-3',
    title: 'Teclas de Entrada de Datos (E, I, R, U)',
    category: 'key',
    content: 'fjei dkrf fjei dkrf eire urie reur ieie eeee rrrr iiii uuuu feji rkdf',
    targetWpm: 20,
    minDuration: 20,
    studiedKeys: ['e', 'i', 'r', 'u', 'f', 'j', 'd', 'k', ' ']
  },

  // --- WORD DRILLS ---
  {
    id: 'word-1',
    title: 'Terminología Esencial TICs',
    category: 'word',
    content: 'red web link link dato chip byte ram rom cpu disco red nodo wifi internet bit red',
    targetWpm: 25,
    minDuration: 30,
    studiedKeys: ['r', 'e', 'd', 'w', 'b', 'l', 'i', 'n', 'k', 'a', 't', 'o', 'c', 'h', 'p', 'y', 'm', 'u', 's', 'f', ' ']
  },
  {
    id: 'word-2',
    title: 'Variables y Operadores',
    category: 'word',
    content: 'suma resta variable funcion clase objeto bucle codigo script modulo retorno if else while true false',
    targetWpm: 28,
    minDuration: 30,
    studiedKeys: ['s', 'u', 'm', 'a', 'r', 'e', 't', 'v', 'i', 'b', 'l', 'f', 'n', 'c', 'o', 'd', 'g', 'p', 'h', 'w']
  },

  // --- TEXT DRILLS / EXAMS ---
  {
    id: 'text-1',
    title: 'Examen de Ciudadanía Digital',
    category: 'text',
    content: 'La ciudadania digital implica un uso seguro y responsable de la tecnologia. Un estudiante de TICs debe proteger sus datos personales y respetar siempre la propiedad intelectual de sus companeros.',
    targetWpm: 30,
    minDuration: 45,
    studiedKeys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'y', 'z']
  },
  {
    id: 'text-2',
    title: 'Integridad Académica vs. Plagio',
    category: 'text',
    content: 'Escribir usando tus propias palabras entrena tu mente para pensar de forma independiente. El copiar y pegar informacion debilita la capacidad de analisis critico. La dactilografia fluida te da la velocidad necesaria para redactar ensayos originales con soltura.',
    targetWpm: 35,
    minDuration: 60,
    studiedKeys: []
  },
  {
    id: 'text-3',
    title: 'El Hardware Detrás de Tu Pantalla',
    category: 'text',
    content: 'Debajo de las teclas se encuentra un circuito impreso que detecta cada pulsacion en milisegundos. Esta senal viaja directamente a la unidad central de procesamiento, permitiendo que tus dedos y la computadora se comuniquen al instante sin retrasos visibles.',
    targetWpm: 40,
    minDuration: 60,
    studiedKeys: []
  }
];

// Generates simulated replay keystroke streams
function generateMockKeystrokeStream(text: string, withErrors: boolean, speedMultiplier: number = 1): { stream: any[], totalTimeSec: number } {
  const stream: any[] = [];
  let currentMs = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Simulating thinking delay (longer for space, punctuation, or complex transitions)
    const delay = (80 + Math.random() * 150 + (char === ' ' || char === ',' || char === '.' ? 180 : 0)) * speedMultiplier;
    currentMs += delay;
    
    if (withErrors && i > 0 && i % 18 === 0) {
      // Simulate an error
      const wrongChar = char === ' ' ? 'a' : 'x';
      stream.push({
        char: wrongChar,
        timestamp: currentMs,
        isCorrect: false,
        expected: char
      });
      // Backspace correction after 200ms
      currentMs += 250;
      // Re-type correct character
      currentMs += (80 + Math.random() * 100) * speedMultiplier;
      stream.push({
        char,
        timestamp: currentMs,
        isCorrect: true,
        expected: char
      });
    } else {
      stream.push({
        char,
        timestamp: currentMs,
        isCorrect: true,
        expected: char
      });
    }
  }
  
  return {
    stream,
    totalTimeSec: Math.max(1, Math.round(currentMs / 1000))
  };
}

const attempt1Data = generateMockKeystrokeStream(INITIAL_LESSONS[0].content, false, 0.82); // High speed, no errors
const attempt2Data = generateMockKeystrokeStream(INITIAL_LESSONS[5].content, true, 1.25); // Mid speed, some errors
const attempt3Data = generateMockKeystrokeStream(INITIAL_LESSONS[0].content, true, 3.50); // Very slow speed (less than 15 WPM)

// Let's create suspicious/cheat attempt data for fraud filtering demonstration (super fast typing, e.g. 150 WPM 100% accurate, completed in 2 seconds)
const cheatData: any[] = [];
let t = 0;
const cheatText = INITIAL_LESSONS[5].content;
for (let i = 0; i < cheatText.length; i++) {
  cheatData.push({
    char: cheatText[i],
    timestamp: t,
    isCorrect: true,
    expected: cheatText[i]
  });
  t += 20; // 20ms per character is inhuman speed
}

export const INITIAL_ATTEMPTS: Attempt[] = [
  {
    id: 'att-1',
    studentName: 'Mateo Fernández',
    studentGrade: 4,
    lessonId: 'key-1',
    lessonTitle: 'Fila Guía Básica (F, J, D, K)',
    grossWpm: 28,
    netWpm: 28,
    accuracy: 100,
    kpm: 140,
    timeSpent: attempt1Data.totalTimeSec,
    date: '2026-06-18T09:30:00Z',
    keystrokeReplay: attempt1Data.stream,
    suspicious: false
  },
  {
    id: 'att-2',
    studentName: 'Sofía Rodríguez',
    studentGrade: 6,
    lessonId: 'text-2',
    lessonTitle: 'Integridad Académica vs. Plagio',
    grossWpm: 38,
    netWpm: 36,
    accuracy: 94.7,
    kpm: 190,
    timeSpent: attempt2Data.totalTimeSec,
    date: '2026-06-19T14:15:00Z',
    keystrokeReplay: attempt2Data.stream,
    suspicious: false
  },
  {
    id: 'att-3',
    studentName: 'Lucas Mendoza',
    studentGrade: 4,
    lessonId: 'key-1',
    lessonTitle: 'Fila Guía Básica (F, J, D, K)',
    grossWpm: 11,
    netWpm: 9,
    accuracy: 81.8,
    kpm: 55,
    timeSpent: attempt3Data.totalTimeSec,
    date: '2026-06-20T08:45:00Z',
    keystrokeReplay: attempt3Data.stream,
    suspicious: false
  },
  {
    id: 'att-cheat',
    studentName: 'Felipe Hack',
    studentGrade: 5,
    lessonId: 'text-2',
    lessonTitle: 'Integridad Académica vs. Plagio',
    grossWpm: 182,
    netWpm: 182,
    accuracy: 100,
    kpm: 910,
    timeSpent: 2,
    date: '2026-06-20T10:12:00Z',
    keystrokeReplay: cheatData,
    suspicious: true
  }
];
