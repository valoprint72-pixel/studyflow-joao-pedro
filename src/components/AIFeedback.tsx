import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Calendar, 
  Activity,
  Lightbulb,
  Award,
  Clock,
  Heart,
  Zap,
  Star,
  RefreshCw,
  Send,
  User,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OpenAIService, AIFeedback as AIFeedbackType } from '../lib/openai';

interface UserData {
  habits: any[];
  goals: any[];
  studySessions: any[];
  financialData: any[];
  moodData: any[];
  achievements: any[];
}

interface FeedbackInsight {
  type: 'positive' | 'suggestion' | 'warning' | 'motivation';
  title: string;
  message: string;
  icon: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AIFeedback() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [insights, setInsights] = useState<FeedbackInsight[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedbackType | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{question: string, answer: string}>>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Buscar todos os dados do usuário
      const [habitsData, goalsData, studyData, financialData, achievementsData] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userData.user.id),
        supabase.from('goals').select('*').eq('user_id', userData.user.id),
        supabase.from('pomodoro_sessions').select('*').eq('user_id', userData.user.id),
        supabase.from('transactions').select('*').eq('user_id', userData.user.id),
        supabase.from('user_achievements').select('*').eq('user_id', userData.user.id)
      ]);

      const data: UserData = {
        habits: habitsData.data || [],
        goals: goalsData.data || [],
        studySessions: studyData.data || [],
        financialData: financialData.data || [],
        moodData: [], // Será implementado depois
        achievements: achievementsData.data || []
      };

      setUserData(data);
      await generateInsights(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (data: UserData) => {
    try {
      setAnalyzing(true);
      
      // Análise de hábitos
      const habitInsights = await analyzeHabits(data.habits);
      
      // Análise de metas
      const goalInsights = await analyzeGoals(data.goals);
      
      // Análise de estudos
      const studyInsights = await analyzeStudySessions(data.studySessions);
      
      // Análise financeira
      const financialInsights = await analyzeFinancialData(data.financialData);
      
      // Análise geral
      const generalInsights = await analyzeGeneralProgress(data);
      
      const allInsights = [
        ...habitInsights,
        ...goalInsights,
        ...studyInsights,
        ...financialInsights,
        ...generalInsights
      ].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setInsights(allInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeHabits = async (habits: any[]): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    if (habits.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Comece com Hábitos',
        message: 'Você ainda não tem hábitos cadastrados. Que tal começar com algo simples como "Beber água" ou "Ler 10 minutos"?',
        icon: '🌱',
        action: 'Criar primeiro hábito',
        priority: 'high'
      });
      return insights;
    }

    const activeHabits = habits.filter(h => h.is_active);
    const completedToday = habits.filter(h => h.current_streak > 0);
    const longestStreak = Math.max(...habits.map(h => h.longest_streak));

    if (completedToday.length === 0) {
      insights.push({
        type: 'warning',
        title: 'Hábitos Negligenciados',
        message: 'Você não completou nenhum hábito hoje. Lembre-se: consistência é a chave do sucesso!',
        icon: '⚠️',
        action: 'Completar hábitos',
        priority: 'high'
      });
    }

    if (longestStreak >= 7) {
      insights.push({
        type: 'positive',
        title: 'Consistência Impressionante!',
        message: `Você manteve um hábito por ${longestStreak} dias seguidos. Isso é incrível!`,
        icon: '🔥',
        priority: 'medium'
      });
    }

    return insights;
  };

  const analyzeGoals = async (goals: any[]): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    if (goals.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Defina Metas',
        message: 'Metas dão direção ao seu progresso. Que tal definir uma meta para esta semana?',
        icon: '🎯',
        action: 'Criar primeira meta',
        priority: 'high'
      });
      return insights;
    }

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const overdueGoals = goals.filter(g => g.deadline && new Date(g.deadline) < new Date());

    if (completedGoals.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Metas Concluídas!',
        message: `Parabéns! Você completou ${completedGoals.length} meta(s). Continue assim!`,
        icon: '🏆',
        priority: 'medium'
      });
    }

    if (overdueGoals.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Metas Atrasadas',
        message: `Você tem ${overdueGoals.length} meta(s) atrasada(s). Que tal revisar e ajustar?`,
        icon: '⏰',
        action: 'Revisar metas',
        priority: 'high'
      });
    }

    return insights;
  };

  const analyzeStudySessions = async (sessions: any[]): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    if (sessions.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Inicie uma Sessão de Estudo',
        message: 'Use o Timer Pomodoro para focar nos estudos. 25 minutos de foco podem fazer a diferença!',
        icon: '📚',
        action: 'Iniciar Pomodoro',
        priority: 'medium'
      });
      return insights;
    }

    const todaySessions = sessions.filter(s => 
      new Date(s.completed_at).toDateString() === new Date().toDateString()
    );
    const totalStudyTime = sessions.reduce((total, s) => total + (s.completed_minutes || 0), 0);

    if (todaySessions.length === 0) {
      insights.push({
        type: 'suggestion',
        message: 'Você ainda não estudou hoje. Que tal uma sessão de 25 minutos?',
        title: 'Hora de Estudar',
        icon: '⏰',
        action: 'Iniciar estudo',
        priority: 'medium'
      });
    }

    if (totalStudyTime >= 120) {
      insights.push({
        type: 'positive',
        title: 'Estudioso Dedicado!',
        message: `Você já estudou ${Math.floor(totalStudyTime / 60)} horas. Incrível dedicação!`,
        icon: '🎓',
        priority: 'low'
      });
    }

    return insights;
  };

  const analyzeFinancialData = async (transactions: any[]): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    if (transactions.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Controle Financeiro',
        message: 'Comece a registrar suas despesas e receitas para ter melhor controle financeiro.',
        icon: '💰',
        action: 'Registrar transação',
        priority: 'medium'
      });
      return insights;
    }

    const recentTransactions = transactions.filter(t => 
      new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const expenses = recentTransactions.filter(t => t.type === 'expense');
    const income = recentTransactions.filter(t => t.type === 'income');

    if (expenses.length > income.length * 2) {
      insights.push({
        type: 'warning',
        title: 'Atenção aos Gastos',
        message: 'Você tem mais despesas que receitas recentemente. Que tal revisar seus gastos?',
        icon: '💸',
        action: 'Revisar finanças',
        priority: 'high'
      });
    }

    return insights;
  };

  const analyzeGeneralProgress = async (data: UserData): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    const totalAchievements = data.achievements.length;
    const totalHabits = data.habits.length;
    const totalGoals = data.goals.length;

    if (totalAchievements === 0 && totalHabits > 0) {
      insights.push({
        type: 'motivation',
        title: 'Primeira Conquista',
        message: 'Continue com seus hábitos! Você está próximo de sua primeira conquista.',
        icon: '⭐',
        priority: 'medium'
      });
    }

    if (totalHabits >= 3 && totalGoals >= 2) {
      insights.push({
        type: 'positive',
        title: 'Planejamento Completo',
        message: 'Você tem uma boa base de hábitos e metas. Isso mostra organização!',
        icon: '📋',
        priority: 'low'
      });
    }

    return insights;
  };

  const askAIQuestion = async () => {
    if (!userQuestion.trim() || !userData) return;

    try {
      setAnalyzing(true);
      
      const context = `
        Dados do usuário:
        - Hábitos: ${userData.habits.length} ativos
        - Metas: ${userData.goals.length} definidas
        - Sessões de estudo: ${userData.studySessions.length}
        - Transações financeiras: ${userData.financialData.length}
        - Conquistas: ${userData.achievements.length}
        
        Pergunta: ${userQuestion}
      `;

      const feedback = await OpenAIService.getPersonalizedAdvice(context, userData);
      setCurrentFeedback(feedback);
      
      setChatHistory(prev => [...prev, {
        question: userQuestion,
        answer: feedback.message
      }]);
      
      setUserQuestion('');
    } catch (error) {
      console.error('Error asking AI question:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'suggestion': return 'from-blue-500 to-indigo-500';
      case 'warning': return 'from-orange-500 to-red-500';
      case 'motivation': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-5 w-5" />;
      case 'suggestion': return <Lightbulb className="h-5 w-5" />;
      case 'warning': return <Target className="h-5 w-5" />;
      case 'motivation': return <Heart className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Feedback com IA
          </h1>
        </div>
        <p className="text-gray-600">
          Seu coach digital analisa seus dados e fornece insights personalizados
        </p>
      </div>

      {/* Chat com IA */}
      <div className="glass-card p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold">Pergunte ao seu Coach IA</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ex: Como posso melhorar meus hábitos? Como estudar melhor?"
              className="input-field flex-1"
              onKeyPress={(e) => e.key === 'Enter' && askAIQuestion()}
            />
            <button
              onClick={askAIQuestion}
              disabled={analyzing || !userQuestion.trim()}
              className="btn-primary flex items-center px-4"
            >
              {analyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {currentFeedback && (
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getInsightColor(currentFeedback.type)} text-white`}>
              <div className="flex items-start space-x-3">
                {getInsightIcon(currentFeedback.type)}
                <div className="flex-1">
                  <p className="font-medium">{currentFeedback.message}</p>
                  {currentFeedback.action && (
                    <p className="text-sm opacity-90 mt-1">Ação sugerida: {currentFeedback.action}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights Automáticos */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">Insights Automáticos</h2>
          </div>
          <button
            onClick={() => userData && generateInsights(userData)}
            disabled={analyzing}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {analyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Analisando seus dados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum insight disponível no momento.</p>
                <p className="text-sm">Continue usando o app para receber feedback personalizado!</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl bg-gradient-to-r ${getInsightColor(insight.type)} text-white`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-sm opacity-90">{insight.message}</p>
                      {insight.action && (
                        <button className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                          {insight.action}
                        </button>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      insight.priority === 'high' ? 'bg-red-500' :
                      insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {insight.priority === 'high' ? 'ALTA' : 
                       insight.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Histórico de Conversas */}
      {chatHistory.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Histórico de Conversas
          </h3>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Você:</p>
                  <p className="text-sm text-blue-700">{chat.question}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Coach IA:</p>
                  <p className="text-sm text-gray-700">{chat.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
          <div className="text-sm text-gray-600">Insights Gerados</div>
        </div>
        
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {insights.filter(i => i.type === 'positive').length}
          </div>
          <div className="text-sm text-gray-600">Conquistas</div>
        </div>
        
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {insights.filter(i => i.type === 'warning').length}
          </div>
          <div className="text-sm text-gray-600">Atenções</div>
        </div>
        
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-purple-600">{chatHistory.length}</div>
          <div className="text-sm text-gray-600">Conversas</div>
        </div>
      </div>
    </div>
  );
}
