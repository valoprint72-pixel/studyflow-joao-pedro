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

interface AIFeedbackProps {
  onNavigate?: (page: string) => void;
}

export default function AIFeedback({ onNavigate }: AIFeedbackProps) {
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
      
      // Gerar insights usando IA
      const aiInsights = await OpenAIService.analyzeHabits(data.habits, data.goals, data.studySessions);
      
      // Converter insights da IA para o formato local
      const insights: FeedbackInsight[] = aiInsights.insights.map((insight: any) => ({
        type: insight.type,
        title: insight.title,
        message: insight.message,
        icon: insight.icon || '💡',
        action: insight.action,
        priority: insight.priority || 'medium'
      }));

      setInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Fallback para insights básicos se a IA falhar
      const fallbackInsights = await generateFallbackInsights(data);
      setInsights(fallbackInsights);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateFallbackInsights = async (data: UserData): Promise<FeedbackInsight[]> => {
    const insights: FeedbackInsight[] = [];
    
    if (data.habits.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Comece com Hábitos',
        message: 'Você ainda não tem hábitos cadastrados. Que tal começar com algo simples como "Beber água" ou "Ler 10 minutos"?',
        icon: '🌱',
        action: 'Criar primeiro hábito',
        priority: 'high'
      });
    }

    if (data.goals.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Defina Metas',
        message: 'Metas dão direção ao seu progresso. Que tal definir uma meta para esta semana?',
        icon: '🎯',
        action: 'Criar primeira meta',
        priority: 'high'
      });
    }

    if (data.studySessions.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Inicie uma Sessão de Estudo',
        message: 'Use o Timer Pomodoro para focar nos estudos. 25 minutos de foco podem fazer a diferença!',
        icon: '📚',
        action: 'Iniciar Pomodoro',
        priority: 'medium'
      });
    }

    if (data.financialData.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Controle Financeiro',
        message: 'Comece a registrar suas despesas e receitas para ter melhor controle financeiro.',
        icon: '💰',
        action: 'Registrar transação',
        priority: 'medium'
      });
    }

    return insights;
  };

  const handleInsightAction = (action: string) => {
    if (!onNavigate) return;

    // Mapear ações para páginas
    const actionMap: { [key: string]: string } = {
      'Criar primeiro hábito': 'self-knowledge',
      'Criar primeira meta': 'self-knowledge',
      'Iniciar Pomodoro': 'pomodoro',
      'Registrar transação': 'finances',
      'Completar hábitos': 'self-knowledge',
      'Revisar metas': 'self-knowledge',
      'Iniciar estudo': 'pomodoro',
      'Revisar finanças': 'finances'
    };

    const targetPage = actionMap[action];
    if (targetPage) {
      onNavigate(targetPage);
    }
  };



  const askAIQuestion = async () => {
    if (!userQuestion.trim() || !userData) return;

    const currentQuestion = userQuestion;
    setUserQuestion(''); // Limpar imediatamente para melhor UX

    try {
      setAnalyzing(true);
      
      // Adicionar pergunta ao histórico imediatamente
      setChatHistory(prev => [...prev, {
        question: currentQuestion,
        answer: 'Analisando...'
      }]);

      const context = `
        Dados do usuário:
        - Hábitos: ${userData.habits.length} ativos
        - Metas: ${userData.goals.length} definidas
        - Sessões de estudo: ${userData.studySessions.length}
        - Transações financeiras: ${userData.financialData.length}
        - Conquistas: ${userData.achievements.length}
        
        Histórico da conversa:
        ${chatHistory.map(chat => `P: ${chat.question}\nR: ${chat.answer}`).join('\n')}
        
        Nova pergunta: ${currentQuestion}
      `;

      const feedback = await OpenAIService.getPersonalizedAdvice(context, userData);
      
      // Atualizar a resposta no histórico
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = feedback.message;
        return newHistory;
      });
      
      setCurrentFeedback(feedback);
    } catch (error) {
      console.error('Error asking AI question:', error);
      
      // Atualizar com erro no histórico
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = 'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.';
        return newHistory;
      });
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
                        <button 
                          onClick={() => handleInsightAction(insight.action!)}
                          className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
                        >
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

      {/* Chat Contínuo */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Conversa com seu Coach IA
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Faça sua primeira pergunta ao seu coach IA!</p>
              <p className="text-sm mt-1">Ex: "Como posso melhorar meus hábitos?"</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className="space-y-3">
                {/* Pergunta do usuário */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                    <p className="text-sm">{chat.question}</p>
                  </div>
                </div>
                
                {/* Resposta da IA */}
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-xs lg:max-w-md">
                    <div className="flex items-center mb-2">
                      <Brain className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-xs font-medium text-gray-600">Coach IA</span>
                    </div>
                    <p className="text-sm text-gray-800">{chat.answer}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {analyzing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                  <span className="text-sm text-gray-600">Analisando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input para nova pergunta */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Digite sua pergunta..."
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
      </div>

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
