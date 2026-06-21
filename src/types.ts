export type KeyDifficulty = 'ok' | 'difficult' | 'problematic';

export interface KeyStat {
  key: string;
  errors: number;
  delays: number[]; // response delay in ms
  status: KeyDifficulty;
}

export type KeyboardLayout = 'QWERTY' | 'AZERTY' | 'Dvorak' | 'DvorakLeft' | 'DvorakRight';

export type ActivityCategory = 'key' | 'word' | 'text';

export interface Lesson {
  id: string;
  title: string;
  category: ActivityCategory;
  content: string;
  targetWpm: number;
  minDuration?: number; // for optimized duration rules
  studiedKeys: string[];
}

export interface KeystrokeEvent {
  char: string;
  timestamp: number; // relative to start in ms
  isCorrect: boolean;
  expected: string;
}

export interface Attempt {
  id: string;
  studentName: string;
  studentGrade?: number;
  lessonId: string;
  lessonTitle: string;
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0-100
  kpm: number;
  timeSpent: number; // seconds
  date: string;
  keystrokeReplay: KeystrokeEvent[];
  suspicious: boolean;
}
