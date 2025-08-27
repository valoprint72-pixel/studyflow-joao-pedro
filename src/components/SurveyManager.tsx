import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Heart,
  Brain,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OpenAIService } from '../lib/openai';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: 'personality' | 'mood' | 'productivity' | 'wellness' | 'motivation';
  questions: Array<{
    id: string;
    question: string;
    type: 'scale' | 'multiple_choice' | 'text';
    options?: string[];
  }>;
  is_active: boolean;
  created_at: string;
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  answers: { [questionId: string]: any };
  score: number;
  insights: any;
  completed_at: string;
}

export default function SurveyManager() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentResults, setCurrentResults] = useState<any>(null);

  useEffect(() => {
    fetchSurveys();
    fetchResponses();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSurvey = (survey: Survey) => {
    setCurrentSurvey(survey);
    setCurrentAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitSurvey = async () => {
    if (!currentSurvey) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gerar insights usando IA
      const insights = await OpenAIService.analyzeSurveyResponse(
        currentSurvey,
        currentAnswers
      );

      // Calcular score baseado nas respostas
      const score = calculateScore(currentAnswers);

      const { error } = await supabase
        .from('survey_responses')
        .insert([{
          survey_id: currentSurvey.id,
          user_id: user.id,
          answers: currentAnswers,
          score,
          insights,
          completed_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setCurrentResults({ score, insights });
      setShowResults(true);
      fetchResponses();
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const calculateScore = (answers: { [key: string]: any }): number => {
    // Lógica simples de cálculo de score
    const totalQuestions = Object.keys(answers).length;
    if (totalQuestions === 0) return 0;

    let totalScore = 0;
    Object.values(answers).forEach(answer => {
      if (typeof answer === 'number') {
        totalScore += answer;
      } else if (typeof answer === 'string' && answer.length > 0) {
        totalScore += 5; // Pontos para respostas textuais
      }
    });

    return Math.round((totalScore / totalQuestions) * 10);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personality': return <Brain className="h-5 w-5" />;
      case 'mood': return <Heart className="h-5 w-5" />;
      case 'productivity': return <Zap className="h-5 w-5" />;
      case 'wellness': return <Activity className="h-5 w-5" />;
      case 'motivation': return <Target className="h-5 w-5" />;
      default: return <ClipboardList className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personality': return 'bg-purple-100 text-purple-600';
      case 'mood': return 'bg-pink-100 text-pink-600';
      case 'productivity': return 'bg-blue-100 text-blue-600';
      case 'wellness': return 'bg-green-100 text-green-600';
      case 'motivation': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'personality': return 'Personalidade';
      case 'mood': return 'Humor';
      case 'productivity': return 'Produtividade';
      case 'wellness': return 'Bem-estar';
      case 'motivation': return 'Motivação';
      default: return 'Geral';
    }
  };

  const stats = {
    totalSurveys: surveys.length,
    completedSurveys: responses.length,
    averageScore: responses.length > 0 
      ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length)
      : 0,
    lastResponse: responses.length > 0 ? new Date(responses[0].completed_at) : null
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
          <ClipboardList className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Questionários de Autoconhecimento
          </h1>
        </div>
        <p className="text-gray-600">
          Descubra mais sobre si mesmo através de questionários inteligentes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalSurveys}</div>
          <div className="text-sm text-gray-600">Questionários</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completedSurveys}</div>
          <div className="text-sm text-gray-600">Respondidos</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.averageScore}/10</div>
          <div className="text-sm text-gray-600">Score Médio</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.lastResponse ? '✓' : '—'}
          </div>
          <div className="text-sm text-gray-600">Última Resposta</div>
        </div>
      </div>

      {/* Current Survey */}
      {currentSurvey && !showResults && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{currentSurvey.title}</h2>
              <p className="text-gray-600">{currentSurvey.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentSurvey.category)}`}>
              {getCategoryName(currentSurvey.category)}
            </span>
          </div>

          <div className="space-y-6">
            {currentSurvey.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <h3 className="font-semibold text-gray-800">
                  {index + 1}. {question.question}
                </h3>
                
                {question.type === 'scale' && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(question.id, value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          currentAnswers[question.id] === value
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                          currentAnswers[question.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <textarea
                    placeholder="Digite sua resposta..."
                    value={currentAnswers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="input-field h-24"
                  />
                )}
              </div>
            ))}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setCurrentSurvey(null);
                  setCurrentAnswers({});
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={submitSurvey}
                disabled={Object.keys(currentAnswers).length < currentSurvey.questions.length}
                className="btn-primary flex-1"
              >
                Enviar Respostas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey Results */}
      {showResults && currentResults && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Resultados do Questionário</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {currentResults.score}/10
              </div>
              <div className="text-gray-600">Seu Score</div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Insights da IA:</h3>
              <p className="text-gray-700">{currentResults.insights}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentSurvey(null);
              setShowResults(false);
              setCurrentResults(null);
            }}
            className="btn-primary mt-4"
          >
            Voltar aos Questionários
          </button>
        </div>
      )}

      {/* Available Surveys */}
      {!currentSurvey && !showResults && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Questionários Disponíveis</h2>
          
          {surveys.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum questionário disponível
              </h3>
              <p className="text-gray-500">
                Em breve teremos questionários para você responder!
              </p>
            </div>
          ) : (
            surveys.map((survey) => (
              <div key={survey.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getCategoryIcon(survey.category)}
                      <h3 className="text-lg font-semibold">{survey.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                        {getCategoryName(survey.category)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{survey.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        {survey.questions.length} perguntas
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        ~5 minutos
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startSurvey(survey)}
                    className="btn-primary ml-4"
                  >
                    Responder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recent Responses */}
      {responses.length > 0 && !currentSurvey && !showResults && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Histórico de Respostas</h2>
          
          <div className="space-y-3">
            {responses.slice(0, 5).map((response) => (
              <div key={response.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Questionário Respondido</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Score: {response.score}/10 • {new Date(response.completed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{response.score}/10</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
