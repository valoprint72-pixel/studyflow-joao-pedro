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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas de Estudo</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalStudyHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
              <p className="text-3xl font-bold text-orange-500 mt-2">{stats.currentStreak}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nível Atual</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.level}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(stats.totalIncome || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-red-500 mt-2">
                {formatCurrency(stats.totalExpense || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold mt-2 ${
                (stats.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-500'
              }`}>
                {formatCurrency(stats.balance || 0)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (stats.balance || 0) >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                (stats.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Continue Evoluindo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Registrar Estudos</h3>
            <p className="text-sm opacity-90">Mantenha sua sequência e ganhe XP</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Registrar Transação</h3>
            <p className="text-sm opacity-90">Mantenha suas finanças organizadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}