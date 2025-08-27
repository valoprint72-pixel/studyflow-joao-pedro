import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Calendar, DollarSign, Trophy, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalStudyHours: number;
  studySessionsThisWeek: number;
  currentStreak: number;
  totalXP: number;
  level: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyHours: 0,
    studySessionsThisWeek: 0,
    currentStreak: 0,
    totalXP: 0,
    level: 1,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchDashboardData();
  }, []);

  // Atualizar dashboard quando a página ganha foco
  useEffect(() => {
    const handleFocus = () => {

      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch study stats
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, xp_earned, date')
        .eq('user_id', user.id);

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      // Fetch accounts to calculate total balance
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id);

      if (accountsError) {
        console.error('Dashboard: Erro ao buscar contas:', accountsError);
      }

      // Fetch transactions for income/expense calculations
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('Dashboard: Erro ao buscar transações:', transactionsError);
      }

      // Calculate study stats
      const totalMinutes = studySessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10;
      const totalXP = studySessions?.reduce((sum, session) => sum + session.xp_earned, 0) || 0;
      const level = Math.floor(totalXP / 100) + 1;
      
      // Sessions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const studySessionsThisWeek = studySessions?.filter(session => 
        new Date(session.date) >= oneWeekAgo
      ).length || 0;

      // Calculate balance from accounts
      const balance = accounts?.reduce((total, account) => {
        return total + (parseFloat(account.balance.toString()) || 0);
      }, 0) || 0;

      // Calculate income and expenses from transactions
      const income = transactions?.filter(t => t.type === 'income')
        .reduce((total, t) => total + (parseFloat(t.amount.toString()) || 0), 0) || 0;
      
      const expense = transactions?.filter(t => t.type === 'expense')
        .reduce((total, t) => total + (parseFloat(t.amount.toString()) || 0), 0) || 0;

      setStats({
        totalStudyHours,
        studySessionsThisWeek,
        currentStreak: streakData?.current_streak || 0,
        totalXP,
        level,
        totalIncome: income,
        totalExpense: expense,
        balance: balance, // Use real account balance instead of calculated
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Mobile Welcome Header */}
      <div className="md:hidden">
        <div className="glass-card p-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Seu progresso de hoje 📊</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">👋</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date().toLocaleDateString('pt-BR', { 
                  day: 'numeric',
                  month: 'short'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta, João Pedro! Aqui está seu progresso</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="mobile-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">📚 Horas de Estudo</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStudyHours}h</p>
              <p className="text-xs text-blue-500 mt-1">Total acumulado</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="mobile-card bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-1">🔥 Sequência</p>
              <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
              <p className="text-xs text-orange-500 mt-1">Dias consecutivos</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="mobile-card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 mb-1">🏆 Nível Atual</p>
              <p className="text-3xl font-bold text-purple-600">{stats.level}</p>
              <p className="text-xs text-purple-500 mt-1">XP: {stats.totalXP}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="space-y-4">
        <div className="md:hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Finanças</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mobile-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">💚 Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome || 0)}
                </p>
                <p className="text-xs text-green-500 mt-1">Total do mês</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="mobile-card bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">💸 Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpense || 0)}
                </p>
                <p className="text-xs text-red-500 mt-1">Total do mês</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className={`mobile-card sm:col-span-2 lg:col-span-1 ${
            (stats.balance || 0) >= 0 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50' 
              : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${
                  (stats.balance || 0) >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  💰 Saldo Total
                </p>
                <p className={`text-3xl font-bold ${
                  (stats.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.balance || 0)}
                </p>
                <p className={`text-xs mt-1 ${
                  (stats.balance || 0) >= 0 ? 'text-blue-500' : 'text-red-500'
                }`}>
                  {(stats.balance || 0) >= 0 ? 'Situação positiva 📈' : 'Atenção necessária ⚠️'}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                (stats.balance || 0) >= 0 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                  : 'bg-gradient-to-br from-red-500 to-orange-500'
              }`}>
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card bg-gradient-to-br from-purple-600/90 to-blue-600/90 backdrop-blur-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">🚀 Continue Evoluindo</h2>
          <div className="text-2xl">⭐</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 mobile-card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-lg">📚</span>
              </div>
              <h3 className="font-semibold text-lg">Registrar Estudos</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Mantenha sua sequência ativa e ganhe XP! 🔥
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 mobile-card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-lg">💰</span>
              </div>
              <h3 className="font-semibold text-lg">Registrar Transação</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Mantenha suas finanças organizadas! 📊
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-white/60 text-center text-sm">
            💡 Dica: Estude 25 minutos por vez para maximizar seu foco
          </p>
        </div>
      </div>
    </div>
  );
}