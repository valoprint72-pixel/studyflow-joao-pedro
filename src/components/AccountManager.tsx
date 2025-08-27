import React, { useEffect, useState } from 'react';
import { Plus, CreditCard, Wallet, TrendingUp, PiggyBank, Banknote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AccountForm from './AccountForm';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'cash';
  balance: number;
  color: string;
  created_at: string;
  user_id: string;
}

interface AccountManagerProps {
  onAccountSelect: (accountId: string) => void;
  selectedAccountId?: string;
}

export default function AccountManager({ onAccountSelect, selectedAccountId }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Todas as transações associadas serão desvinculadas.')) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return CreditCard;
      case 'savings': return PiggyBank;
      case 'investment': return TrendingUp;
      case 'credit': return CreditCard;
      default: return Wallet;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'investment': return 'Investimento';
      case 'credit': return 'Cartão de Crédito';
      default: return 'Dinheiro';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas</h2>
          <p className="text-gray-600">Gerencie suas contas financeiras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Saldo Total</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Banknote className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const IconComponent = getAccountIcon(account.type);
          return (
            <div
              key={account.id}
              className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedAccountId === account.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => onAccountSelect(account.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: account.color }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAccount(account);
                      setShowForm(true);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAccount(account.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{account.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{getAccountTypeName(account.type)}</p>
                <p className={`text-xl font-bold ${
                  account.balance >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira conta financeira</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Criar Primeira Conta
          </button>
        </div>
      )}

      {/* Account Form Modal */}
      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
          onSave={() => {
            fetchAccounts();
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}
    </div>
  );
}