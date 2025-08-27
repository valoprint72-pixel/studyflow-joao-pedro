-- =====================================================
-- INSERIR DADOS INICIAIS - EXECUTAR APÓS AS MIGRATIONS
-- =====================================================

-- Limpar dados existentes (opcional)
-- DELETE FROM achievements;
-- DELETE FROM inspirational_content;

-- Conquistas padrão
INSERT INTO achievements (title, description, icon, category, points_required, streak_required) VALUES
('Primeiro Passo', 'Complete seu primeiro hábito', '🎯', 'habits', 10, 1),
('Consistente', 'Mantenha um hábito por 7 dias seguidos', '🔥', 'streaks', 50, 7),
('Determinado', 'Mantenha um hábito por 30 dias seguidos', '💪', 'streaks', 200, 30),
('Conquistador', 'Complete 10 metas', '🏆', 'goals', 500, 0),
('Estudioso', 'Complete 10 sessões de estudo', '📚', 'study', 100, 0),
('Focado', 'Complete uma sessão Pomodoro de 25 minutos', '⏰', 'focus', 25, 0),
('Motivado', 'Earn 1000 pontos', '⭐', 'special', 1000, 0),
('Lendário', 'Mantenha um hábito por 100 dias seguidos', '👑', 'streaks', 1000, 100)
ON CONFLICT (title) DO NOTHING;

-- Conteúdo inspiracional
INSERT INTO inspirational_content (type, title, content, author, category) VALUES
('quote', 'Sucesso', 'O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.', 'Winston Churchill', 'motivation'),
('quote', 'Estudo', 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', 'Nelson Mandela', 'study'),
('quote', 'Foco', 'Concentre-se em ser produtivo em vez de estar ocupado.', 'Tim Ferriss', 'focus'),
('quote', 'Persistência', 'A persistência é o caminho do êxito.', 'Charles Chaplin', 'motivation'),
('quote', 'Crescimento', 'O crescimento é doloroso. A mudança é dolorosa. Mas nada é tão doloroso quanto ficar preso onde você não pertence.', 'Mandy Hale', 'success')
ON CONFLICT (title) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 'Achievements inseridos:' as status, COUNT(*) as total FROM achievements;
SELECT 'Conteúdo inspiracional inserido:' as status, COUNT(*) as total FROM inspirational_content;
