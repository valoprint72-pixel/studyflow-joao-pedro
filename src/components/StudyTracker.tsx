import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Trophy, Flame, Target, Clock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StudySessionForm from './StudySessionForm';
import { sendMotivationalNotification } from '../utils/notifications';

interface StudySession {
  id: string;
  subject: string;
  duration_minutes: number;
  xp_earned: number;
  notes?: string;
  date: string;
  created_at: string;
  user_id: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

interface StudyStats {
  totalXP: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xpToNextLevel: number;
  sessionsThisWeek: number;
  achievements: UserAchievement[];
}

export default function StudyTracker() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    totalXP: 0,
    totalHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    xpToNextLevel: 100,
    sessionsThisWeek: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch study sessions
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      // Fetch user achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select(`
          id,
          achievement_id,
          unlocked_at,
          achievements (
            id,
            name,
            description,
            icon,
            xp_reward,
            requirement_type,
            requirement_value
          )
        `)
        .eq('user_id', user.id);

      // Calculate stats
      const { data: allSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id);

      const totalXP = allSessions?.reduce((sum, session) => sum + session.xp_earned, 0) || 0;
      const totalMinutes = allSessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      // Calculate level (100 XP per level)
      const level = Math.floor(totalXP / 100) + 1;
      const xpToNextLevel = 100 - (totalXP % 100);

      // Calculate streak
      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Sessions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const sessionsThisWeek = allSessions?.filter(session => 
        new Date(session.date) >= oneWeekAgo
      ).length || 0;

      setSessions(sessionsData || []);
      setStats({
        totalXP,
        totalHours,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        level,
        xpToNextLevel,
        sessionsThisWeek,
        achievements: achievementsData || []
      });

      // Enviar notificação motivacional se necessário
      await sendMotivationalNotification(level, streakData?.current_streak || 0, totalXP);
    } catch (error) {
      console.error('Error fetching study data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão de estudos?')) return;

    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      await fetchStudyData();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Estudos</h1>
          <p className="text-gray-600 mt-2">Acompanhe seu progresso acadêmico, João Pedro</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Sessão</span>
        </button>
      </div>

      {/* Level and XP Progress */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Nível {stats.level}</h2>
            <p className="text-purple-100">Acadêmico Dedicado</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.totalXP} XP</p>
            <p className="text-purple-100">{stats.xpToNextLevel} XP para próximo nível</p>
          </div>
        </div>
        
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${((100 - stats.xpToNextLevel) / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Estudadas</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
              <p className="text-2xl font-bold text-orange-500 mt-2">{stats.currentStreak} dias</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Melhor Sequência</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.longestStreak} dias</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{stats.sessionsThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Conquistas Recentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.achievements.slice(0, 3).map((userAchievement) => (
              <div key={userAchievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{userAchievement.achievements.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{userAchievement.achievements.name}</h3>
                    <p className="text-sm text-gray-600">{userAchievement.achievements.description}</p>
                    <p className="text-xs text-yellow-600 font-medium">+{userAchievement.achievements.xp_reward} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Sessões Recentes</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma sessão registrada</h3>
              <p className="text-gray-600 mb-4">Comece sua jornada de estudos registrando sua primeira sessão</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Registrar Primeira Sessão
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.subject}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{session.duration_minutes} minutos</span>
                        <span>+{session.xp_earned} XP</span>
                        <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{session.xp_earned}</span>
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Study Session Form Modal */}
      {showForm && (
        <StudySessionForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            fetchStudyData();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}