-- =====================================================
-- SISTEMA COMPLETO DE AUTOCONHECIMENTO E PRODUTIVIDADE
-- =====================================================

-- 1. TABELA DE TAREFAS (NOVA)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'study', 'project', 'personal', 'work'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  due_date DATE NOT NULL,
  estimated_hours INTEGER DEFAULT 1,
  actual_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE METAS
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'study', 'health', 'personal', 'career'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  unit VARCHAR(50), -- 'times', 'hours', 'pages', etc.
  deadline DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE HÁBITOS
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'morning', 'health', 'study', 'evening'
  frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  target_count INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  points_per_completion INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE LOGS DE HÁBITOS
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  points_earned INTEGER DEFAULT 0
);

-- 5. TABELA DE QUESTIONÁRIOS
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'personality', 'mood', 'productivity', 'wellness', 'motivation'
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE RESPOSTAS DOS QUESTIONÁRIOS
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  insights JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE PONTOS E GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  total_goals_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE CONQUISTAS
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  category VARCHAR(50), -- 'habits', 'goals', 'streaks', 'special'
  points_required INTEGER DEFAULT 0,
  streak_required INTEGER DEFAULT 0,
  goals_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE CONQUISTAS DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- 10. TABELA DE TIMER POMODORO
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  category VARCHAR(50), -- 'study', 'work', 'break'
  duration_minutes INTEGER NOT NULL,
  completed_minutes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 11. TABELA DE RELATÓRIOS E INSIGHTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'ai_analysis'
  data JSONB NOT NULL,
  insights JSONB,
  ai_feedback JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABELA DE CONTEÚDO INSPIRACIONAL
CREATE TABLE IF NOT EXISTS inspirational_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'quote', 'article', 'playlist'
  title VARCHAR(255),
  content TEXT,
  author VARCHAR(255),
  category VARCHAR(50), -- 'motivation', 'study', 'success', 'focus', 'politics', 'entrepreneurship'
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'reminder', 'achievement', 'motivation', 'ai_feedback'
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for);

-- =====================================================
-- FUNÇÕES RPC
-- =====================================================

-- Função para calcular pontos do usuário
CREATE OR REPLACE FUNCTION calculate_user_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER := 0;
BEGIN
  -- Pontos de hábitos completados
  SELECT COALESCE(SUM(hl.points_earned), 0) INTO total_points
  FROM habit_logs hl
  WHERE hl.user_id = user_uuid;
  
  -- Pontos de metas completadas
  SELECT total_points + COALESCE(SUM(g.points), 0) INTO total_points
  FROM goals g
  WHERE g.user_id = user_uuid AND g.status = 'completed';
  
  -- Pontos de conquistas
  SELECT total_points + COALESCE(SUM(ua.points_earned), 0) INTO total_points
  FROM user_achievements ua
  WHERE ua.user_id = user_uuid;
  
  RETURN total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar streak de hábitos
CREATE OR REPLACE FUNCTION update_habit_streak(habit_uuid UUID)
RETURNS void AS $$
DECLARE
  current_streak INTEGER;
  longest_streak INTEGER;
BEGIN
  -- Calcular streak atual
  SELECT COUNT(*) INTO current_streak
  FROM habit_logs hl
  WHERE hl.habit_id = habit_uuid
  AND hl.completed_at >= CURRENT_DATE - INTERVAL '1 day'
  AND hl.completed_at < CURRENT_DATE + INTERVAL '1 day';
  
  -- Atualizar streak no hábito
  UPDATE habits 
  SET current_streak = current_streak,
      longest_streak = GREATEST(longest_streak, current_streak),
      updated_at = NOW()
  WHERE id = habit_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar relatório semanal
CREATE OR REPLACE FUNCTION generate_weekly_report(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  report_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'habits_completed', (
      SELECT COUNT(*) 
      FROM habit_logs hl 
      WHERE hl.user_id = user_uuid 
      AND hl.completed_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'goals_progress', (
      SELECT jsonb_agg(jsonb_build_object(
        'title', g.title,
        'progress', g.current_value,
        'target', g.target_value,
        'percentage', ROUND((g.current_value::float / g.target_value::float) * 100, 2)
      ))
      FROM goals g
      WHERE g.user_id = user_uuid AND g.status = 'active'
    ),
    'tasks_completed', (
      SELECT COUNT(*) 
      FROM tasks t 
      WHERE t.user_id = user_uuid 
      AND t.status = 'completed'
      AND t.updated_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'total_points', calculate_user_points(user_uuid),
    'streak_days', (
      SELECT COALESCE(MAX(current_streak), 0)
      FROM habits
      WHERE user_id = user_uuid
    ),
    'study_time', (
      SELECT COALESCE(SUM(completed_minutes), 0)
      FROM pomodoro_sessions
      WHERE user_id = user_uuid 
      AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
      AND category = 'study'
    )
  ) INTO report_data;
  
  RETURN report_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS (Row Level Security) - VERSÃO SEGURA
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Só cria se não existirem
DO $$
BEGIN
  -- Tasks policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can view own tasks') THEN
    CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can insert own tasks') THEN
    CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update own tasks') THEN
    CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can delete own tasks') THEN
    CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Goals policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can view own goals') THEN
    CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can insert own goals') THEN
    CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can update own goals') THEN
    CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can delete own goals') THEN
    CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Habits policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can view own habits') THEN
    CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can insert own habits') THEN
    CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can update own habits') THEN
    CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can delete own habits') THEN
    CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Habit logs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can view own habit logs') THEN
    CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can insert own habit logs') THEN
    CREATE POLICY "Users can insert own habit logs" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can update own habit logs') THEN
    CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'Users can delete own habit logs') THEN
    CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Survey responses policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'Users can view own survey responses') THEN
    CREATE POLICY "Users can view own survey responses" ON survey_responses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'Users can insert own survey responses') THEN
    CREATE POLICY "Users can insert own survey responses" ON survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- User points policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Users can view own points') THEN
    CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Users can insert own points') THEN
    CREATE POLICY "Users can insert own points" ON user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Users can update own points') THEN
    CREATE POLICY "Users can update own points" ON user_points FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- User achievements policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can insert own achievements') THEN
    CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Pomodoro sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can view own pomodoro sessions') THEN
    CREATE POLICY "Users can view own pomodoro sessions" ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can insert own pomodoro sessions') THEN
    CREATE POLICY "Users can insert own pomodoro sessions" ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can update own pomodoro sessions') THEN
    CREATE POLICY "Users can update own pomodoro sessions" ON pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pomodoro_sessions' AND policyname = 'Users can delete own pomodoro sessions') THEN
    CREATE POLICY "Users can delete own pomodoro sessions" ON pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Reports policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Users can view own reports') THEN
    CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Users can insert own reports') THEN
    CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Notifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can insert own notifications') THEN
    CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Políticas para conteúdo público
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'surveys' AND policyname = 'Anyone can view surveys') THEN
    CREATE POLICY "Anyone can view surveys" ON surveys FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Anyone can view achievements') THEN
    CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inspirational_content' AND policyname = 'Anyone can view inspirational content') THEN
    CREATE POLICY "Anyone can view inspirational content" ON inspirational_content FOR SELECT USING (true);
  END IF;

END $$;

-- Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas:' as status, COUNT(*) as total FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tasks', 'goals', 'habits', 'habit_logs', 'surveys', 'survey_responses', 'user_points', 'achievements', 'user_achievements', 'pomodoro_sessions', 'reports', 'inspirational_content', 'notifications');

SELECT 'Políticas RLS criadas:' as status, COUNT(*) as total FROM pg_policies WHERE schemaname = 'public';

SELECT 'Funções RPC criadas:' as status, COUNT(*) as total FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('calculate_user_points', 'update_habit_streak', 'generate_weekly_report');
