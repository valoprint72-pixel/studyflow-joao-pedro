/*
  # Criar tabela de tarefas

  1. Nova Tabela
    - `tasks`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, chave estrangeira para auth.users)
      - `title` (text, obrigatório)
      - `description` (text, opcional)
      - `completed` (boolean, padrão false)
      - `priority` (text, obrigatório - low/medium/high)
      - `category` (text, obrigatório)
      - `due_date` (date, opcional)
      - `created_at` (timestamp, padrão now())

  2. Segurança
    - Habilitar RLS na tabela `tasks`
    - Adicionar política para usuários autenticados lerem apenas seus próprios dados
    - Adicionar política para usuários autenticados criarem suas próprias tarefas
    - Adicionar política para usuários autenticados atualizarem suas próprias tarefas
    - Adicionar política para usuários autenticados excluírem suas próprias tarefas
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
  category text NOT NULL,
  due_date date,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);