import React, { useState } from 'react';
import { X, Save, Clock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { scheduleNotification } from '../utils/notifications';

interface StudySessionFormProps {
  onClose: () => void;
  onSave: () => void;
}

// Matérias organizadas por área do ENEM
const enemSubjects = {
  'Linguagens e Códigos': [
    'Português', 'Literatura', 'Inglês', 'Espanhol', 'Artes', 'Educação Física'
  ],
  'Ciências Humanas': [
    'História', 'Geografia', 'Filosofia', 'Sociologia'
  ],
  'Ciências da Natureza': [
    'Física', 'Química', 'Biologia'
  ],
  'Matemática': [
    'Matemática'
  ],
  'Redação': [
    'Redação'
  ]
};

// const allSubjects = Object.values(enemSubjects).flat();

const subjectToArea = (subject: string): string => {
  for (const [area, subjects] of Object.entries(enemSubjects)) {
    if (subjects.includes(subject)) {
      return area;
    }
  }
  return 'Outros';
};

export default function StudySessionForm({ onClose, onSave }: StudySessionFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    duration_minutes: 30,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const calculateXP = (minutes: number): number => {
    // Sistema simplificado: 2 XP por minuto
    return minutes * 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const xp_earned = calculateXP(formData.duration_minutes);

      const sessionData = {
        ...formData,
        xp_earned,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('study_sessions')
        .insert([sessionData]);
      
      if (error) throw error;

      // Update or create study streak
      await updateStudyStreak(user.id, formData.date);

      // Check for new achievements
      await checkAchievements(user.id);

      // Agendar próxima notificação de estudo (24h depois)
      await scheduleNotification(
        'Hora de estudar! 📚',
        'Que tal uma nova sessão de estudos para manter o ritmo?',
        24 * 60 * 60 * 1000 // 24 horas
      );

      onSave();
    } catch (error) {
      console.error('Error saving study session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudyStreak = async (userId: string, studyDate: string) => {
    try {
      const { data: existingStreak } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      const today = new Date(studyDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (existingStreak) {
        const lastStudyDate = existingStreak.last_study_date ? new Date(existingStreak.last_study_date) : null;
        let newStreak = 1;

        if (lastStudyDate) {
          const daysDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0) {
            // Same day, don't update streak
            return;
          } else if (daysDiff === 1) {
            // Consecutive day
            newStreak = existingStreak.current_streak + 1;
          }
        }

        const longestStreak = Math.max(existingStreak.longest_streak, newStreak);

        await supabase
          .from('study_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_study_date: studyDate,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Create new streak record
        await supabase
          .from('study_streaks')
          .insert([{
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_study_date: studyDate
          }]);
      }
    } catch (error) {
      console.error('Error updating study streak:', error);
    }
  };

  const checkAchievements = async (userId: string) => {
    try {
      // Get all user's study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      // Get user's current achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const unlockedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];

      // Get all available achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');

      if (!sessions || !achievements) return;

      const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      
      // Calcular sessões por área do ENEM
      const sessionsByArea: { [key: string]: number } = {};
      sessions?.forEach(session => {
        const area = subjectToArea(session.subject);
        sessionsByArea[area] = (sessionsByArea[area] || 0) + 1;
      });
      
      // Get current streak
      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      const currentStreak = streakData?.current_streak || 0;

      // Check each achievement
      for (const achievement of achievements) {
        if (unlockedAchievementIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'study_time':
            shouldUnlock = totalMinutes >= achievement.requirement_value;
            break;
          case 'streak':
            shouldUnlock = currentStreak >= achievement.requirement_value;
            break;
          case 'subject_area': {
            // Para conquistas por área específica, verificar se tem sessões suficientes na área
            const areaName = achievement.name.includes('Linguista') ? 'Linguagens e Códigos' :
                           achievement.name.includes('Humanista') ? 'Ciências Humanas' :
                           achievement.name.includes('Cientista') ? 'Ciências da Natureza' :
                           achievement.name.includes('Matemático') ? 'Matemática' :
                           achievement.name.includes('Redator') ? 'Redação' : '';
            shouldUnlock = (sessionsByArea[areaName] || 0) >= achievement.requirement_value;
            break;
          }
          case 'all_areas': {
            // ENEM Ready: pelo menos 3 sessões em cada área principal
            const mainAreas = ['Linguagens e Códigos', 'Ciências Humanas', 'Ciências da Natureza', 'Matemática'];
            shouldUnlock = mainAreas.every(area => (sessionsByArea[area] || 0) >= achievement.requirement_value);
            break;
          }
        }

        if (shouldUnlock) {
          await supabase
            .from('user_achievements')
            .insert([{
              user_id: userId,
              achievement_id: achievement.id
            }]);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const estimatedXP = calculateXP(formData.duration_minutes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nova Sessão de Estudos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matéria *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma matéria</option>
              {Object.entries(enemSubjects).map(([area, subjects]) => (
                <optgroup key={area} label={area}>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {formData.subject && (
              <p className="text-sm text-blue-600 mt-1">
                Área: {subjectToArea(formData.subject)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração (minutos) *
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
              required
            />
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-blue-600">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(formData.duration_minutes / 60)}h {formData.duration_minutes % 60}m</span>
              </div>
              <div className="flex items-center space-x-1 text-yellow-600">
                <Star className="h-4 w-4" />
                <span>+{estimatedXP} XP</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anotações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="O que você estudou? Principais aprendizados..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Registrar Sessão</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}