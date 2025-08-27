# 🗄️ Configuração do Banco de Dados - StudyFlow

## 📋 Passos para Configurar o Supabase

### 1. **Acesse o Supabase Dashboard**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto StudyFlow

### 2. **Execute as Migrations**
- Vá para **SQL Editor** no menu lateral
- Execute o arquivo `supabase-migrations.sql` completo
- Isso criará todas as tabelas e funções

### 3. **Insira os Dados Iniciais**
- Execute o arquivo `insert-initial-data.sql`
- Isso adicionará as conquistas e conteúdo inspiracional

### 4. **Configure as Variáveis de Ambiente**
No arquivo `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_OPENAI_API_KEY=sua_chave_openai_aqui
```

### 5. **Verificar Configuração**
Execute no SQL Editor:
```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar dados inseridos
SELECT COUNT(*) as achievements_count FROM achievements;
SELECT COUNT(*) as content_count FROM inspirational_content;
```

## 🚨 Solução de Problemas

### **Erro: "column does not exist"**
- A tabela pode já existir com estrutura diferente
- Execute: `DROP TABLE IF EXISTS achievements CASCADE;`
- Reexecute as migrations

### **Erro: "permission denied"**
- Verifique se o RLS está configurado corretamente
- Execute as políticas RLS novamente

### **Erro: "function does not exist"**
- Verifique se as funções RPC foram criadas
- Reexecute a seção de funções RPC

## 📊 Estrutura das Tabelas

### **Tabelas Principais:**
- `goals` - Metas do usuário
- `habits` - Hábitos diários
- `habit_logs` - Logs de hábitos completados
- `user_points` - Sistema de pontos
- `achievements` - Conquistas disponíveis
- `user_achievements` - Conquistas do usuário
- `pomodoro_sessions` - Sessões de estudo
- `reports` - Relatórios e insights
- `inspirational_content` - Conteúdo motivacional
- `notifications` - Notificações do sistema

### **Funções RPC:**
- `calculate_user_points(user_uuid)` - Calcula pontos do usuário
- `update_habit_streak(habit_uuid)` - Atualiza sequência de hábitos
- `generate_weekly_report(user_uuid)` - Gera relatório semanal

## ✅ Checklist de Configuração

- [ ] Migrations executadas com sucesso
- [ ] Dados iniciais inseridos
- [ ] Variáveis de ambiente configuradas
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de segurança criadas
- [ ] Funções RPC funcionando
- [ ] Teste de conexão realizado

## 🔧 Comandos Úteis

```sql
-- Verificar estrutura de uma tabela
\d achievements

-- Verificar dados
SELECT * FROM achievements LIMIT 5;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar funções
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Execute os comandos de verificação
3. Consulte a documentação do Supabase
4. Entre em contato para suporte adicional
