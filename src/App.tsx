import React, { useState } from 'react';
import { 
  Keyboard, BookOpen, GraduationCap, Users, RefreshCw, Award, ShieldAlert, LogOut, User as UserIcon
} from 'lucide-react';
import { Lesson, Attempt } from './types';
import { INITIAL_LESSONS, INITIAL_ATTEMPTS } from './data';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import StudentModule from './components/StudentModule';
import TeacherModule from './components/TeacherModule';
import LoginPage from './components/LoginPage';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [attempts, setAttempts] = useState<Attempt[]>(INITIAL_ATTEMPTS);

  const handleNewAttempt = (attempt: Attempt) => {
    setAttempts(prev => [attempt, ...prev]);
  };

  const handleAddCustomLesson = (newLesson: Lesson) => {
    setLessons(prev => [...prev, newLesson]);
  };

  const handleDeleteAttempt = (attemptId: string) => {
    setAttempts(prev => prev.filter(a => a.id !== attemptId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* GLOBAL SYSTEM APP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Brand logo */}
          <div className="flex items-center gap-3 select-none">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Keyboard className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                DactiloTICs <span className="text-[10px] bg-slate-800 text-indigo-400 font-mono py-0.5 px-2 rounded-lg font-bold border border-slate-700">EdTech v1.0</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Maestría Motriz Táctil de Precisión</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Core high-level Student/Teacher Portal navigation toggle switch */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setRole('student')}
                className={`flex items-center gap-1.5 py-1.5 px-4 text-xs font-black rounded-lg transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <GraduationCap className="w-4 h-4" /> Centro de Estudiantes
              </button>
              <button
                onClick={() => setRole('teacher')}
                className={`flex items-center gap-1.5 py-1.5 px-4 text-xs font-black rounded-lg transition-all ${role === 'teacher' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Users className="w-4 h-4" /> Portal del Docente
              </button>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-2 bg-slate-950 py-1 px-1 pr-2 rounded-xl border border-slate-800">
              <div className="bg-indigo-600/20 p-1.5 rounded-lg">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-xs text-slate-300 font-bold max-w-[100px] truncate">{user.displayName || user.email}</span>
              <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors" title="Cerrar sesión">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* CORE WORKSPACE ENTRY CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fadeIn">
        
        {role === 'student' ? (
          <StudentModule
            lessons={lessons}
            attempts={attempts}
            onNewAttempt={handleNewAttempt}
            studentName={user.displayName || user.email || 'Estudiante'}
          />
        ) : (
          <TeacherModule
            lessons={lessons}
            attempts={attempts}
            onAddCustomLesson={handleAddCustomLesson}
            onDeleteAttempt={handleDeleteAttempt}
          />
        )}

      </main>

      {/* COMPLIANT SYSTEM FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 px-4 md:px-8 py-5 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span>© 2026 DactiloTICs — Rolando Gelabert Fernández</span>
          <div className="flex gap-4">
            <span className="hover:text-indigo-400 transition-colors cursor-help">Ayuda Ergonomía</span>
            <span className="hover:text-indigo-400 transition-colors cursor-help">Términos del Servicio</span>
            <span className="hover:text-indigo-400 transition-colors cursor-help">Licencia MIT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
