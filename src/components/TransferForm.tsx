import React, { useState, useEffect } from 'react';
import { X, Save, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface TransferFormProps {
  onClose: () => void;
  onSave: () => void;
}

export default function TransferForm({ onClose, onSave }: TransferFormProps) {
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

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

      if (formData.from_account_id === formData.to_account_id) {
        alert('Não é possível transferir para a mesma conta');
        return;
      }

      const { error } = await supabase.rpc('process_transfer', {
        p_user_id: user.id,
        p_from_account_id: formData.from_account_id,
        p_to_account_id: formData.to_account_id,
        p_amount: formData.amount,
        p_description: formData.description || null,
        p_date: formData.date
      });

      if (error) throw error;
      onSave();
    } catch (error: unknown) {
      console.error('Error processing transfer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar transferência';
      alert(errorMessage);
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

  const getAccountById = (id: string) => accounts.find(acc => acc.id === id);
  const fromAccount = getAccountById(formData.from_account_id);
  const toAccount = getAccountById(formData.to_account_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nova Transferência</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta de Origem *
            </label>
            <select
              value={formData.from_account_id}
              onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione a conta de origem</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {formatCurrency(account.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta de Destino *
            </label>
            <select
              value={formData.to_account_id}
              onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione a conta de destino</option>
              {accounts
                .filter(account => account.id !== formData.from_account_id)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.balance)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
            {fromAccount && formData.amount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Saldo após transferência: {formatCurrency(fromAccount.balance - formData.amount)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Motivo da transferência (opcional)"
            />
          </div>

          {/* Preview da transferência */}
          {fromAccount && toAccount && formData.amount > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Resumo da Transferência</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">De:</span>
                  <span className="font-medium">{fromAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Para:</span>
                  <span className="font-medium">{toAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Valor:</span>
                  <span className="font-bold text-blue-900">{formatCurrency(formData.amount)}</span>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading || !formData.from_account_id || !formData.to_account_id || formData.amount <= 0}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Transferir</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}