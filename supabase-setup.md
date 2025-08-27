# 🗄️ Configuração Supabase para Produção

## Passo 1: Verificar Configurações do Supabase

### 1.1 Acessar Dashboard
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em "Settings" → "API"

### 1.2 Copiar Credenciais
```
Project URL: https://[SEU-PROJETO].supabase.co
Anon Key: [SUA-CHAVE-ANONIMA]
```

## Passo 2: Executar SQL de Configuração

### 2.1 Acessar SQL Editor
1. No dashboard do Supabase, vá em "SQL Editor"
2. Clique em "New query"

### 2.2 Executar SQL
Execute o conteúdo do arquivo `execute-in-supabase.sql`:

```sql
-- Execute este SQL no seu painel do Supabase (SQL Editor)
-- Para garantir que a função update_account_balance existe

CREATE OR REPLACE FUNCTION update_account_balance(account_id uuid, amount_change numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts 
  SET balance = balance + amount_change
  WHERE id = account_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with id % not found', account_id;
  END IF;
END;
$$;
```

### 2.3 Verificar Tabelas
Certifique-se de que estas tabelas existem:
- ✅ `tasks`
- ✅ `transactions`  
- ✅ `accounts`
- ✅ `study_sessions`
- ✅ `achievements`
- ✅ `user_achievements`
- ✅ `study_streaks`
- ✅ `transfers`

## Passo 3: Configurar RLS (Row Level Security)

Todas as tabelas devem ter RLS habilitado com políticas para:
- Usuários só podem ver/editar seus próprios dados
- Políticas baseadas em `auth.uid() = user_id`

## Passo 4: Configurar Autenticação

### 4.1 Providers de Auth
1. Vá em "Authentication" → "Providers"
2. Configure Email/Password como mínimo
3. Opcional: Configure Google, GitHub, etc.

### 4.2 URL de Redirecionamento
Adicione as URLs de produção:
- Desenvolvimento: `http://localhost:5173`
- Produção: `https://[SUA-URL-AMPLIFY].amplifyapp.com`

## Passo 5: Testar Conexão

Após o deploy, teste:
1. ✅ Login/Registro
2. ✅ Criação de dados
3. ✅ Atualização de dados
4. ✅ Exclusão de dados

## Problemas Comuns

### CORS Error
- Verifique as URLs de redirecionamento
- Certifique-se que o domínio está autorizado

### Função não encontrada
- Execute novamente o SQL do arquivo `execute-in-supabase.sql`

### Dados não aparecem
- Verifique as políticas RLS
- Confirme que o usuário está autenticado
