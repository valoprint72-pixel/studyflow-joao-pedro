import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Calendar, ArrowRightLeft, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TransactionForm from './TransactionForm';
import TransferForm from './TransferForm';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  created_at: string;
  user_id: string;
  account_id?: string;
}

interface FinanceManagerProps {
  selectedAccountId?: string;
}

export default function FinanceManager({ selectedAccountId }: FinanceManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [error, setError] = useState<string>('');
  const [accountsBalance, setAccountsBalance] = useState<number>(0);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('FinanceManager: Erro de autenticação:', authError);
        setError('Erro de autenticação: ' + authError.message);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      // Fetch transactions
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (selectedAccountId) {
        query = query.eq('account_id', selectedAccountId);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('FinanceManager: Erro ao buscar transações:', error);
        setError(error.message);
        throw error;
      }
      
      // Fetch accounts balance
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id);

      if (!accountsError && accounts) {
        const totalBalance = accounts.reduce((total, account) => {
          return total + (parseFloat(account.balance.toString()) || 0);
        }, 0);
        setAccountsBalance(totalBalance);
      }
      
      setTransactions(data || []);
      setError('');
    } catch (error) {
      console.error('FinanceManager: Erro geral:', error);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const deleteTransaction = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      // First, get the transaction details to rollback the balance
      const { data: transactionToDelete, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        console.error('Error fetching transaction for rollback:', fetchError);
        throw fetchError;
      }



      // Delete the transaction
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (deleteError) throw deleteError;

      // Rollback the account balance if the transaction had an account
      if (transactionToDelete?.account_id) {
        const amount = parseFloat(transactionToDelete.amount);
        // Reverse the balance change: if it was income, subtract; if expense, add back
        const balanceRollback = transactionToDelete.type === 'income' ? -amount : amount;
        


        const { error: balanceError } = await supabase.rpc('update_account_balance', {
          account_id: transactionToDelete.account_id,
          amount_change: balanceRollback
        });

        if (balanceError) {
          console.error('Error rolling back account balance:', balanceError);
          // Don't throw here, transaction was deleted successfully
        }
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Erro ao deletar transação: ' + (error as Error).message);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Note: The balance shown here is just for this view (income - expenses)
  // The real total balance is calculated from accounts in the Dashboard
  const calculatedBalance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
            <p className="text-gray-600 mt-2">Gerencie suas receitas e despesas</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => fetchTransactions()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-gray-600 mt-2">
            {selectedAccountId ? 'Transações da conta selecionada' : 'Gerencie suas receitas e despesas'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTransferForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            <ArrowRightLeft className="h-5 w-5" />
            <span>Transferir</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Real</p>
              <p className={`text-2xl font-bold mt-2 ${
                accountsBalance >= 0 ? 'text-blue-600' : 'text-red-500'
              }`}>
                {formatCurrency(accountsBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Soma das contas</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              accountsBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                accountsBalance >= 0 ? 'text-blue-600' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(totalIncome)}
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
                {formatCurrency(totalExpense)}
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
              <p className="text-sm font-medium text-gray-600">Diferença</p>
              <p className={`text-2xl font-bold mt-2 ${
                calculatedBalance >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {formatCurrency(calculatedBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Receitas - Despesas</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              calculatedBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                calculatedBalance >= 0 ? 'text-green-600' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece registrando sua primeira transação'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-6 w-6" />
                    ) : (
                      <TrendingDown className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {transaction.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {transaction.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    {transaction.description && (
                      <p className="text-gray-600 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setShowForm(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          selectedAccountId={selectedAccountId}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSave={() => {
            fetchTransactions();
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <TransferForm
          onClose={() => setShowTransferForm(false)}
          onSave={() => {
            fetchTransactions();
            setShowTransferForm(false);
          }}
        />
      )}
    </div>
  );
}