import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Brain, 
  Calendar, 
  Clock, 
  Star,
  Trophy,
  Zap,
  Heart,
  BookOpen,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OpenAIService, AIAnalysis } from '../lib/openai';

interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  goalsCompleted: number;
  studyTime: number;
}

interface HabitData {
  id: string;
  title: string;
  current_streak: number;
  longest_streak: number;
  category: string;
}

interface GoalData {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
  category: string;
  status: string;
}

interface SelfKnowledgeDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function SelfKnowledgeDashboard({ onNavigate }: SelfKnowledgeDashboardProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [dailyQuote, setDailyQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchDailyQuote();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      console.log('Fetching data for user:', userData.user.id);

      // Buscar estatísticas do usuário com tratamento de erro
      let pointsData = null;
      try {
        const { data, error } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching user points:', error);
        } else {
          pointsData = data;
        }
      } catch (error) {
        console.log('User points table might not exist yet');
      }

      // Buscar hábitos com tratamento de erro
      let habitsData = [];
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('is_active', true);
        
        if (error) {
          console.error('Error fetching habits:', error);
        } else {
          habitsData = data || [];
        }
      } catch (error) {
        console.log('Habits table might not exist yet');
      }

      // Buscar metas com tratamento de erro
      let goalsData = [];
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userData.user.id);
        
        if (error) {
          console.error('Error fetching goals:', error);
        } else {
          goalsData = data || [];
        }
      } catch (error) {
        console.log('Goals table might not exist yet');
      }

      // Buscar conquistas com tratamento de erro
      let achievementsData = [];
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (*)
          `)
          .eq('user_id', userData.user.id);
        
        if (error) {
          console.error('Error fetching achievements:', error);
        } else {
          achievementsData = data || [];
        }
      } catch (error) {
        console.log('Achievements table might not exist yet');
      }

      // Calcular estatísticas
      const stats: UserStats = {
        totalPoints: pointsData?.points || 0,
        level: pointsData?.level || 1,
        currentStreak: pointsData?.current_streak || 0,
        longestStreak: pointsData?.longest_streak || 0,
        habitsCompleted: pointsData?.total_habits_completed || 0,
        goalsCompleted: pointsData?.total_goals_completed || 0,
        studyTime: 0 // Será calculado depois
      };

      console.log('Setting dashboard data:', { stats, habitsData, goalsData, achievementsData });

      setUserStats(stats);
      setHabits(habitsData);
      setGoals(goalsData);
      setAchievements(achievementsData);

      // Análise IA (opcional)
      try {
        if (habitsData.length > 0 || goalsData.length > 0) {
          const analysis = await OpenAIService.analyzeHabits(
            habitsData,
            goalsData,
            { studyTime: stats.studyTime }
          );
          setAiAnalysis(analysis);
        }
      } catch (error) {
        console.error('Error generating AI analysis:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyQuote = async () => {
    try {
      const quote = await OpenAIService.generateQuote('motivation');
      setDailyQuote(quote);
    } catch (error) {
      console.error('Error fetching daily quote:', error);
      setDailyQuote('A persistência é o caminho do êxito.');
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-purple-600 to-pink-600';
    if (level >= 5) return 'from-blue-600 to-purple-600';
    return 'from-green-600 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Quote */}
      <div className="glass-card p-6 text-center">
        <div className="mb-4">
          <Brain className="h-12 w-12 mx-auto text-blue-600 mb-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard de Autoconhecimento
          </h1>
        </div>
        <p className="text-lg italic text-gray-700 mb-4">
          "{dailyQuote || 'A persistência é o caminho do êxito.'}"
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-600">
          <span>🎯 Foco</span>
          <span>📈 Progresso</span>
          <span>🌟 Crescimento</span>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mobile-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Nível</p>
              <p className="text-2xl font-bold">{userStats?.level || 1}</p>
            </div>
            <Trophy className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="mobile-card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pontos</p>
              <p className="text-2xl font-bold">{userStats?.totalPoints || 0}</p>
            </div>
            <Star className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="mobile-card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Sequência</p>
              <p className="text-2xl font-bold">{userStats?.currentStreak || 0} dias</p>
            </div>
            <Zap className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="mobile-card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Recorde</p>
              <p className="text-2xl font-bold">{userStats?.longestStreak || 0} dias</p>
            </div>
            <Award className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Análise IA */}
      {aiAnalysis && aiAnalysis.insights && aiAnalysis.suggestions && (
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">Análise IA - Seu Coach Pessoal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">💡 Insights</h3>
              <ul className="space-y-2">
                {aiAnalysis.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🎯 Sugestões</h3>
              <ul className="space-y-2">
                {aiAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <p className="text-center text-gray-800 font-medium">
              {aiAnalysis.motivation || 'Continue focado nos seus objetivos!'}
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Score de Progresso</p>
              <div className="text-2xl font-bold text-blue-600">
                {aiAnalysis.score || 7}/10
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progresso de Metas */}
      <div className="glass-card p-6">
        <div className="flex items-center mb-4">
          <Target className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold">Progresso das Metas</h2>
        </div>
        
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="p-4 bg-white rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {goal.status === 'completed' ? 'Concluída' : 'Ativa'}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{goal.current_value} / {goal.target_value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(goal.current_value, goal.target_value)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hábitos e Sequências */}
      <div className="glass-card p-6">
        <div className="flex items-center mb-4">
          <Activity className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-bold">Hábitos e Sequências</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.slice(0, 4).map((habit) => (
            <div key={habit.id} className="p-4 bg-white rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{habit.title}</h3>
                <span className="text-sm text-gray-600">{habit.category}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Sequência atual</p>
                  <p className="text-lg font-bold text-orange-600">{habit.current_streak} dias</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Recorde</p>
                  <p className="text-lg font-bold text-purple-600">{habit.longest_streak} dias</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      <div className="glass-card p-6">
        <div className="flex items-center mb-4">
          <Award className="h-6 w-6 text-yellow-600 mr-2" />
          <h2 className="text-xl font-bold">Conquistas Recentes</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.slice(0, 4).map((achievement) => (
            <div key={achievement.id} className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl mb-2">{achievement.achievements?.icon}</div>
              <h3 className="font-semibold text-sm text-gray-800 mb-1">
                {achievement.achievements?.title}
              </h3>
              <p className="text-xs text-gray-600">
                {achievement.achievements?.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navegação Rápida */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-blue-600" />
          Módulos Disponíveis
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate?.('tasks')}
            className="mobile-card text-center p-4 hover:scale-105 transition-transform"
          >
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">Tarefas</span>
          </button>
          
          <button 
            onClick={() => onNavigate?.('surveys')}
            className="mobile-card text-center p-4 hover:scale-105 transition-transform"
          >
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium">Questionários</span>
          </button>
          
          <button 
            onClick={() => onNavigate?.('pomodoro')}
            className="mobile-card text-center p-4 hover:scale-105 transition-transform"
          >
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium">Pomodoro</span>
          </button>
          
          <button 
            onClick={() => onNavigate?.('inspiration')}
            className="mobile-card text-center p-4 hover:scale-105 transition-transform"
          >
            <Star className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <span className="text-sm font-medium">Inspiração</span>
          </button>
        </div>
      </div>

      {/* Áreas de Melhoria */}
      {aiAnalysis && (
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold">Áreas de Desenvolvimento</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">💪 Pontos Fortes</h3>
              <ul className="space-y-2">
                {aiAnalysis.areas.strength.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">🎯 Para Melhorar</h3>
              <ul className="space-y-2">
                {aiAnalysis.areas.improvement.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center">
                    <span className="text-orange-500 mr-2">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
