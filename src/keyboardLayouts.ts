import { KeyboardLayout } from './types';

export interface KeyItem {
  code: string;
  char: string;
  shiftChar?: string;
  finger: 'L1' | 'L2' | 'L3' | 'L4' | 'Thumb' | 'R4' | 'R3' | 'R2' | 'R1'; // L1 = left pinky, R1 = right pinky
  colorClass: string;
}

// Finger styles helper
export const FINGER_METRIC = {
  'L1': { name: 'Meñique Izquierdo', color: 'bg-rose-500/10 border-rose-500 text-rose-500 bg-rose-500' },
  'L2': { name: 'Anular Izquierdo', color: 'bg-amber-500/10 border-amber-500 text-amber-500 bg-amber-500' },
  'L3': { name: 'Medio Izquierdo', color: 'bg-emerald-500/10 border-emerald-500 text-emerald-500 bg-emerald-500' },
  'L4': { name: 'Índice Izquierdo', color: 'bg-blue-500/10 border-blue-500 text-blue-500 bg-blue-500' },
  'Thumb': { name: 'Pulgar', color: 'bg-slate-500/10 border-slate-500 text-slate-500 bg-slate-500' },
  'R4': { name: 'Índice Derecho', color: 'bg-indigo-500/10 border-indigo-500 text-indigo-500 bg-indigo-500' },
  'R3': { name: 'Medio Derecho', color: 'bg-purple-500/10 border-purple-500 text-purple-500 bg-purple-500' },
  'R2': { name: 'Anular Derecho', color: 'bg-pink-500/10 border-pink-500 text-pink-500 bg-pink-500' },
  'R1': { name: 'Meñique Derecho', color: 'bg-teal-500/10 border-teal-500 text-teal-500 bg-teal-500' },
};

// Layout configurations
export const LAYOUT_ROWS: Record<KeyboardLayout, string[][]> = {
  QWERTY: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
  ],
  AZERTY: [
    ['&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '='],
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù', '*'],
    ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!']
  ],
  Dvorak: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
    ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '='],
    ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-'],
    [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z']
  ],
  // Hand-optimized standard Dvorak variants:
  DvorakLeft: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
    ['q', 'f', 'm', 'l', 'w', 'b', 'y', 'u', 'r', 's', 'o', '-'],
    ['a', 'z', 'h', 't', 'd', 'c', 'k', 'n', 'e', 'i', 'p'],
    ['x', 'g', 'v', 'j', 't', 'm', 'k', 'l', 'b', 'y']
  ],
  DvorakRight: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
    ['j', 'l', 'm', 'f', 'p', 'v', 'c', 'x', 'd', 'g', 'u'],
    ['h', 'o', 'r', 's', 't', 'n', 'e', 'i', 'a', 'b', 'y'],
    ['z', 'q', 'k', 'w', 'v', 'x', 'b', 'm', 'p', 'l']
  ]
};

// Maps letters or keys to targeted fingers & colors for styling
export function getKeyAssignment(char: string, layout: KeyboardLayout): {
  finger: keyof typeof FINGER_METRIC;
  color: string;
} {
  const normChar = char.toLowerCase();
  
  // Spacebar is always thumb
  if (normChar === ' ' || normChar === 'space') {
    return { finger: 'Thumb', color: 'border-slate-400 bg-slate-100 text-slate-700' };
  }

  // Find position in QWERTY layout grid for color groupings (by columns as finger bands)
  // Let's deduce Column Index of the key in this layout to assign the natural anatomical fingers
  const currentLayoutRows = LAYOUT_ROWS[layout] || LAYOUT_ROWS['QWERTY'];
  let foundRow = -1;
  let foundCol = -1;

  for (let r = 0; r < currentLayoutRows.length; r++) {
    const colIdx = currentLayoutRows[r].indexOf(normChar);
    if (colIdx !== -1) {
      foundRow = r;
      foundCol = colIdx;
      break;
    }
  }

  if (foundRow === -1) {
    // Default fallback to general right index finger
    return { finger: 'R4', color: 'border-indigo-400 bg-indigo-50 text-indigo-700' };
  }

  // Fingering allocation based on columns mapping standard layout
  let finger: keyof typeof FINGER_METRIC = 'Thumb';
  if (foundCol <= 1) {
    finger = 'L1';
  } else if (foundCol === 2) {
    finger = 'L2';
  } else if (foundCol === 3) {
    finger = 'L3';
  } else if (foundCol === 4 || foundCol === 5) {
    finger = 'L4';
  } else if (foundCol === 6 || foundCol === 7) {
    finger = 'R4';
  } else if (foundCol === 8) {
    finger = 'R3';
  } else if (foundCol === 9) {
    finger = 'R2';
  } else {
    finger = 'R1';
  }

  const colorData = FINGER_METRIC[finger];

  // Map to soft border/text colors for visual layout
  let borderTextColor = 'border-slate-300 text-slate-700 hover:bg-slate-50';
  switch (finger) {
    case 'L1': borderTextColor = 'border-rose-400 bg-rose-50/70 text-rose-700'; break;
    case 'L2': borderTextColor = 'border-amber-400 bg-amber-50/70 text-amber-700'; break;
    case 'L3': borderTextColor = 'border-emerald-400 bg-emerald-50/70 text-emerald-700'; break;
    case 'L4': borderTextColor = 'border-blue-400 bg-blue-50/70 text-blue-700'; break;
    case 'R4': borderTextColor = 'border-indigo-400 bg-indigo-50/70 text-indigo-700'; break;
    case 'R3': borderTextColor = 'border-purple-400 bg-purple-50/70 text-purple-700'; break;
    case 'R2': borderTextColor = 'border-pink-400 bg-pink-50/70 text-pink-700'; break;
    case 'R1': borderTextColor = 'border-teal-400 bg-teal-50/70 text-teal-700'; break;
  }

  return { finger, color: borderTextColor };
}
