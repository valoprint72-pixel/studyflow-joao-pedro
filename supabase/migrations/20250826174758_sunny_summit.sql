/*
  # Create gamification system for studies

  1. New Tables
    - `study_sessions`
      - Track study sessions with duration, subject, and XP earned
    - `achievements`
      - Define available achievements
    - `user_achievements`
      - Track user's unlocked achievements
    - `study_streaks`
      - Track daily study streaks

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - XP system based on study time and task completion
    - Achievement system for milestones
    - Study streak tracking
    - Subject-based progress
*/

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  xp_earned integer DEFAULT 0,
  notes text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  xp_reward integer DEFAULT 0,
  requirement_type text NOT NULL CHECK (requirement_type IN ('study_time', 'streak', 'tasks_completed', 'subjects')),
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Study streaks table
CREATE TABLE IF NOT EXISTS study_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_study_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

-- Study sessions policies
CREATE POLICY "Users can read own study sessions"
  ON study_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions"
  ON study_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Achievements policies (read-only for users)
CREATE POLICY "Users can read achievements"
  ON achievements FOR SELECT TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON user_achievements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Study streaks policies
CREATE POLICY "Users can read own streaks"
  ON study_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streaks"
  ON study_streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON study_streaks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('Primeiro Passo', 'Complete sua primeira sessão de estudos', '🎯', 50, 'study_time', 1),
('Dedicado', 'Estude por 5 horas no total', '📚', 100, 'study_time', 300),
('Persistente', 'Mantenha uma sequência de 7 dias estudando', '🔥', 200, 'streak', 7),
('Explorador', 'Estude 5 matérias diferentes', '🌟', 150, 'subjects', 5),
('Maratonista', 'Estude por 20 horas no total', '🏃‍♂️', 300, 'study_time', 1200),
('Consistente', 'Mantenha uma sequência de 30 dias', '💎', 500, 'streak', 30),
('Mestre', 'Complete 100 tarefas de estudo', '👑', 400, 'tasks_completed', 100);

-- Create indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_date_idx ON study_sessions(date);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS study_streaks_user_id_idx ON study_streaks(user_id);