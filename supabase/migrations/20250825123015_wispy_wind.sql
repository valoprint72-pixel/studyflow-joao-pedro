/*
  # Criar tabela de transações financeiras

  1. Nova Tabela
    - `transactions`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, chave estrangeira para auth.users)
      - `title` (text, obrigatório)
      - `amount` (numeric, obrigatório)
      - `type` (text, obrigatório - income/expense)
      - `category` (text, obrigatório)
      - `description` (text, opcional)
      - `date` (date, obrigatório)
      - `created_at` (timestamp, padrão now())

  2. Segurança
    - Habilitar RLS na tabela `transactions`
    - Adicionar política para usuários autenticados lerem apenas seus próprios dados
    - Adicionar política para usuários autenticados criarem suas próprias transações
    - Adicionar política para usuários autenticados atualizarem suas próprias transações
    - Adicionar política para usuários autenticados excluírem suas próprias transações
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  category text NOT NULL,
  description text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);