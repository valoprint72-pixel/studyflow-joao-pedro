import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Clock, 
  Target,
  Coffee,
  BookOpen,
  Settings,
  Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

interface PomodoroSession {
  id?: string;
  title: string;
  category: 'study' | 'work' | 'break';
  duration_minutes: number;
  completed_minutes: number;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4
  });

  // Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  // Notificação quando o timer termina
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      playNotification();
    }
  }, [timeLeft, isRunning]);

  const playNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: currentPhase === 'work' ? 'Hora do break! 🎉' : 'Hora de voltar ao trabalho! 💪',
        icon: '/favicon.ico'
      });
    }

    // Som de notificação (se disponível)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {}); // Ignora erros de áudio
  };

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    
    if (currentPhase === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      
      // Salvar sessão completada
      if (currentSession) {
        await saveSession({
          ...currentSession,
          status: 'completed',
          completed_minutes: settings.workDuration
        });
      }

      // Verificar se é hora do break longo
      const shouldTakeLongBreak = (completedPomodoros + 1) % settings.longBreakInterval === 0;
      setCurrentPhase(shouldTakeLongBreak ? 'longBreak' : 'shortBreak');
      setTimeLeft((shouldTakeLongBreak ? settings.longBreakDuration : settings.shortBreakDuration) * 60);
    } else {
      // Break terminou, voltar ao trabalho
      setCurrentPhase('work');
      setTimeLeft(settings.workDuration * 60);
    }
  }, [currentPhase, completedPomodoros, settings, currentSession]);

  const startTimer = () => {
    if (!sessionTitle.trim()) {
      alert('Por favor, insira um título para a sessão');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    
    const newSession: PomodoroSession = {
      title: sessionTitle,
      category: 'study',
      duration_minutes: settings.workDuration,
      completed_minutes: 0,
      status: 'active'
    };
    
    setCurrentSession(newSession);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
    
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'paused'
      });
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setIsRunning(true);
    
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'active'
      });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(settings.workDuration * 60);
    setCurrentPhase('work');
    setCurrentSession(null);
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  const saveSession = async (session: PomodoroSession) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const sessionData = {
        ...session,
        user_id: userData.user.id,
        notes: sessionNotes
      };

      if (session.id) {
        await supabase
          .from('pomodoro_sessions')
          .update(sessionData)
          .eq('id', session.id);
      } else {
        await supabase
          .from('pomodoro_sessions')
          .insert([sessionData]);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'work': return <BookOpen className="h-6 w-6" />;
      case 'shortBreak': return <Coffee className="h-6 w-6" />;
      case 'longBreak': return <Target className="h-6 w-6" />;
      default: return <Clock className="h-6 w-6" />;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'work': return 'from-blue-500 to-indigo-600';
      case 'shortBreak': return 'from-green-500 to-emerald-600';
      case 'longBreak': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'work': return 'Trabalho';
      case 'shortBreak': return 'Pausa Curta';
      case 'longBreak': return 'Pausa Longa';
      default: return 'Timer';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Timer Pomodoro
          </h1>
        </div>
        <p className="text-gray-600">
          Técnica de produtividade: 25min de foco + 5min de pausa
        </p>
      </div>

      {/* Timer Principal */}
      <div className="glass-card p-8 text-center">
        <div className={`inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br ${getPhaseColor()} text-white mb-6`}>
          {getPhaseIcon()}
        </div>
        
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          {getPhaseText()}
        </h2>
        
        <div className="text-6xl font-bold text-gray-800 mb-6 font-mono">
          {formatTime(timeLeft)}
        </div>

        {/* Controles */}
        <div className="flex justify-center space-x-4 mb-6">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="btn-primary flex items-center px-6 py-3"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeTimer}
              className="btn-primary flex items-center px-6 py-3"
            >
              <Play className="h-5 w-5 mr-2" />
              Continuar
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="btn-primary flex items-center px-6 py-3"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={skipPhase}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pomodoros Completos</span>
            <span>{completedPomodoros}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Configuração da Sessão */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuração da Sessão
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Sessão
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Ex: Estudar Matemática, Revisar Redação..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Anotações sobre a sessão..."
              rows={3}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração do Trabalho (min)
                </label>
                <input
                  type="number"
                  value={settings.workDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  className="input-field"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pausa Curta (min)
                </label>
                <input
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                  className="input-field"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pausa Longa (min)
                </label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                  className="input-field"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo para Pausa Longa
                </label>
                <input
                  type="number"
                  value={settings.longBreakInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                  className="input-field"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setTimeLeft(settings.workDuration * 60);
                setShowSettings(false);
              }}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Aplicar Configurações
            </button>
          </div>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-blue-600">{completedPomodoros}</div>
          <div className="text-sm text-gray-600">Pomodoros Hoje</div>
        </div>
        
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedPomodoros * settings.workDuration}min
          </div>
          <div className="text-sm text-gray-600">Tempo Focado</div>
        </div>
        
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.floor((completedPomodoros * settings.workDuration) / 60)}h
          </div>
          <div className="text-sm text-gray-600">Horas Produtivas</div>
        </div>
      </div>
    </div>
  );
}
