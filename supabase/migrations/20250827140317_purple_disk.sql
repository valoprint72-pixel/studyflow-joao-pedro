/*
  # Atualizar Sistema de Estudos para ENEM

  1. Updates
    - Adicionar conquistas específicas do ENEM
    - Atualizar sistema de XP para ser mais simples
    - Criar categorias por área do conhecimento

  2. New Achievements
    - Conquistas por área do conhecimento do ENEM
    - Conquistas por tempo de estudo
    - Conquistas por consistência
*/

-- Limpar conquistas existentes e criar novas para ENEM
DELETE FROM user_achievements;
DELETE FROM achievements;

-- Conquistas por Área do Conhecimento
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('Linguista', 'Complete 5 sessões em Linguagens e Códigos', '📚', 50, 'subject_area', 5),
('Humanista', 'Complete 5 sessões em Ciências Humanas', '🏛️', 50, 'subject_area', 5),
('Cientista Natural', 'Complete 5 sessões em Ciências da Natureza', '🔬', 50, 'subject_area', 5),
('Matemático', 'Complete 5 sessões em Matemática', '🧮', 50, 'subject_area', 5),
('Redator', 'Complete 3 sessões de Redação', '✍️', 75, 'subject_area', 3);

-- Conquistas por Tempo de Estudo
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('Iniciante', 'Complete sua primeira sessão de estudos', '🌱', 25, 'study_time', 1),
('Dedicado', 'Acumule 10 horas de estudo', '⏰', 100, 'study_time', 600),
('Persistente', 'Acumule 25 horas de estudo', '💪', 200, 'study_time', 1500),
('Maratonista', 'Acumule 50 horas de estudo', '🏃‍♂️', 300, 'study_time', 3000);

-- Conquistas por Consistência
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('Consistente', 'Estude por 7 dias consecutivos', '🔥', 150, 'streak', 7),
('Disciplinado', 'Estude por 15 dias consecutivos', '⚡', 250, 'streak', 15),
('Imparável', 'Estude por 30 dias consecutivos', '🚀', 500, 'streak', 30);

-- Conquista Especial
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('ENEM Ready', 'Complete pelo menos 3 sessões em cada área', '🎯', 1000, 'all_areas', 3);