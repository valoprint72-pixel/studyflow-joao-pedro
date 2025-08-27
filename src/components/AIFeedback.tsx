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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      // Buscar todos os dados do usuário com tratamento de erro individual
      const fetchData = async (table: string, userId: string) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('user_id', userId);
          
          if (error) {
            console.error(`Error fetching ${table}:`, error);
            return [];
          }
          
          return data || [];
        } catch (err) {
          console.error(`Error fetching ${table}:`, err);
          return [];
        }
      };

      const [habitsData, goalsData, studyData, financialData, achievementsData] = await Promise.all([
        fetchData('habits', userData.user.id),
        fetchData('goals', userData.user.id),
        fetchData('pomodoro_sessions', userData.user.id),
        fetchData('transactions', userData.user.id),
        fetchData('user_achievements', userData.user.id)
      ]);

      const data: UserData = {
        habits: habitsData,
        goals: goalsData,
        studySessions: studyData,
        financialData: financialData,
        moodData: [], // Será implementado depois
        achievements: achievementsData
      };

      setUserData(data);
      await generateInsights(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Erro ao carregar dados do usuário');
      // Gerar insights padrão mesmo com erro
      await generateDefaultInsights();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultInsights = async () => {
    const defaultInsights: FeedbackInsight[] = [
      {
        type: 'motivation',
        title: 'Bem-vindo ao seu Coach Digital!',
        message: 'Estou aqui para te ajudar a alcançar seus objetivos. Comece criando seus primeiros hábitos e metas.',
        icon: 'brain',
        action: 'Criar primeiro hábito',
        priority: 'high'
      },
      {
        type: 'suggestion',
        title: 'Configure suas Metas',
        message: 'Defina metas claras e mensuráveis para ter direção em sua jornada de autodesenvolvimento.',
        icon: 'target',
        action: 'Criar primeira meta',
        priority: 'high'
      },
      {
        type: 'positive',
        title: 'Pronto para Começar!',
        message: 'Você tem todas as ferramentas necessárias para transformar sua vida. Vamos começar?',
        icon: 'star',
        action: 'Iniciar Pomodoro',
        priority: 'medium'
      }
    ];
    
    setInsights(defaultInsights);
  };

  const generateInsights = async (data: UserData) => {
    try {
      setAnalyzing(true);
      
      // Se não há dados suficientes, usar insights padrão
      if (data.habits.length === 0 && data.goals.length === 0) {
        await generateDefaultInsights();
        return;
      }
      
      // Gerar insights usando IA
      const aiInsights = await OpenAIService.analyzeHabits(data.habits, data.goals, data.studySessions);
      
      // Converter insights da IA para o formato local
      const insights: FeedbackInsight[] = aiInsights.insights.map((insight: any) => ({
        type: insight.type,
        title: insight.title,
        message: insight.message,
        icon: insight.icon,
        action: insight.action,
        priority: insight.priority
      }));
      
      setInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Se der erro na IA, usar insights padrão
      await generateDefaultInsights();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInsightAction = (action: string) => {
    if (!onNavigate) return;
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

  const askQuestion = async () => {
    if (!userQuestion.trim()) return;

    const question = userQuestion;
    setUserQuestion('');
    
    // Adicionar pergunta ao histórico imediatamente
    const newChatEntry = { question, answer: '' };
    setChatHistory(prev => [...prev, newChatEntry]);

    try {
      // Gerar resposta da IA
      const context = `
        Dados do usuário:
        - Hábitos: ${userData?.habits.length || 0}
        - Metas: ${userData?.goals.length || 0}
        - Sessões de estudo: ${userData?.studySessions.length || 0}
        - Transações financeiras: ${userData?.financialData.length || 0}
        
        Histórico do chat:
        ${chatHistory.map(entry => `P: ${entry.question}\nR: ${entry.answer}`).join('\n')}
        
        Pergunta atual: ${question}
      `;

      const response = await OpenAIService.makeRequest(`
        Você é um coach digital especializado em produtividade e autodesenvolvimento.
        Responda à pergunta do usuário de forma motivacional e prática.
        
        Contexto: ${context}
        
        Responda em português de forma clara e objetiva, máximo 2 parágrafos.
      `);

      // Atualizar a resposta no histórico
      setChatHistory(prev => 
        prev.map((entry, index) => 
          index === prev.length - 1 ? { ...entry, answer: response } : entry
        )
      );
    } catch (error) {
      console.error('Error asking question:', error);
      // Atualizar com resposta de erro
      setChatHistory(prev => 
        prev.map((entry, index) => 
          index === prev.length - 1 ? { ...entry, answer: 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente.' } : entry
        )
      );
    }
  };

  // Garantir que o loading pare após um tempo máximo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (insights.length === 0) {
          generateDefaultInsights();
        }
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timer);
  }, [loading, insights.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <Brain className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Erro ao carregar</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={fetchUserData}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
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
            Coach Digital com IA
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Análise personalizada e feedback inteligente para seus objetivos
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userData?.habits.length || 0}</div>
            <div className="text-sm text-gray-600">Hábitos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userData?.goals.length || 0}</div>
            <div className="text-sm text-gray-600">Metas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userData?.studySessions.length || 0}</div>
            <div className="text-sm text-gray-600">Sessões</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{userData?.achievements.length || 0}</div>
            <div className="text-sm text-gray-600">Conquistas</div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchUserData}
          disabled={analyzing}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analisando...' : 'Atualizar Análise'}
        </button>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {insight.icon === 'brain' && <Brain className="h-6 w-6 text-blue-600 mr-2" />}
                {insight.icon === 'target' && <Target className="h-6 w-6 text-green-600 mr-2" />}
                {insight.icon === 'star' && <Star className="h-6 w-6 text-yellow-600 mr-2" />}
                {insight.icon === 'lightbulb' && <Lightbulb className="h-6 w-6 text-purple-600 mr-2" />}
                {insight.icon === 'trending' && <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />}
                {insight.icon === 'award' && <Award className="h-6 w-6 text-red-600 mr-2" />}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                  insight.type === 'suggestion' ? 'bg-blue-100 text-blue-600' :
                  insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-pink-100 text-pink-600'
                }`}>
                  {insight.type === 'positive' ? 'Positivo' :
                   insight.type === 'suggestion' ? 'Sugestão' :
                   insight.type === 'warning' ? 'Atenção' : 'Motivação'}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                insight.priority === 'high' ? 'bg-red-500' :
                insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
            </div>

            <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
            <p className="text-gray-600 mb-4">{insight.message}</p>
            
            {insight.action && (
              <button 
                onClick={() => handleInsightAction(insight.action!)}
                className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
              >
                {insight.action}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
          Chat com IA
        </h2>
        
        {/* Chat History */}
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
          {chatHistory.map((entry, index) => (
            <div key={index} className="space-y-2">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                  <div className="flex items-center mb-1">
                    <User className="h-3 w-3 mr-1" />
                    <span className="text-xs">Você</span>
                  </div>
                  <p className="text-sm">{entry.question}</p>
                </div>
              </div>
              
              {/* AI Answer */}
              {entry.answer && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                    <div className="flex items-center mb-1">
                      <Brain className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="text-xs text-gray-600">IA Coach</span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            placeholder="Faça uma pergunta ao seu coach digital..."
            className="flex-1 input-field"
          />
          <button
            onClick={askQuestion}
            disabled={!userQuestion.trim()}
            className="btn-primary px-4 py-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
