import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface TransactionFormProps {
  transaction?: Transaction | null;
  selectedAccountId?: string;
  onClose: () => void;
  onSave: () => void;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

export default function TransactionForm({ transaction, selectedAccountId, onClose, onSave }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    account_id: selectedAccountId || '',
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    if (transaction) {
      setFormData({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.date,
        account_id: transaction.account_id || selectedAccountId || '',
      });
    }
  }, [transaction, selectedAccountId]);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const transactionData = {
        ...formData,
        user_id: user.id,
        account_id: formData.account_id || null,
      };

      if (transaction) {
        // Update existing transaction
        
        // First rollback the old transaction balance
        if (transaction.account_id) {
          const oldAmount = parseFloat(transaction.amount.toString());
          const oldBalanceRollback = transaction.type === 'income' ? -oldAmount : oldAmount;

          const { error: rollbackError } = await supabase.rpc('update_account_balance', {
            account_id: transaction.account_id,
            amount_change: oldBalanceRollback
          });

          if (rollbackError) {
            console.error('Error rolling back old transaction balance:', rollbackError);
          }
        }

        // Update the transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);
        
        if (error) throw error;

        // Apply new transaction balance
        if (formData.account_id) {
          const newBalanceChange = formData.type === 'income' ? formData.amount : -formData.amount;

          const { error: balanceError } = await supabase.rpc('update_account_balance', {
            account_id: formData.account_id,
            amount_change: newBalanceChange
          });

          if (balanceError) {
            console.error('Error updating account balance:', balanceError);
          }
        }
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData])
          .select();
        
        if (error) {
          console.error('TransactionForm: Erro ao salvar:', error);
          throw error;
        }

        // Update account balance if account is selected
        if (formData.account_id) {
          const balanceChange = formData.type === 'income' ? formData.amount : -formData.amount;
          
          const { error: balanceError } = await supabase.rpc('update_account_balance', {
            account_id: formData.account_id,
            amount_change: balanceChange
          });
          
          if (balanceError) console.error('Error updating account balance:', balanceError);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Receita</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingDown className="h-5 w-5" />
              <span className="font-medium">Despesa</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Título da transação"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: Alimentação, Trabalho"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {accounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma conta (opcional)</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição da transação"
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
              className={`flex-1 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{transaction ? 'Atualizar' : 'Criar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}