# 🔧 Configuração das Variáveis de Ambiente - StudyFlow

## 📋 O que você precisa configurar:

### **1. Crie o arquivo `.env.local` na raiz do projeto:**

```bash
# Na pasta do projeto, crie o arquivo:
touch .env.local
```

### **2. Adicione o conteúdo no arquivo `.env.local`:**

```env
# =====================================================
# CONFIGURAÇÃO DO STUDYFLOW - VARIÁVEIS DE AMBIENTE
# =====================================================

# SUPABASE CONFIGURAÇÃO
# Vá para: https://supabase.com/dashboard/project/[SEU_PROJETO]/settings/api
# Copie a URL e a chave anônima
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OPENAI API KEY
# Sua chave da OpenAI (forneça sua chave)
VITE_OPENAI_API_KEY=sua_chave_openai_aqui

# CONFIGURAÇÕES ADICIONAIS (OPCIONAIS)
VITE_APP_NAME=StudyFlow
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Sistema de autoconhecimento e produtividade
```

## 🔍 Como encontrar as chaves do Supabase:

### **1. Acesse o Supabase Dashboard:**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto StudyFlow

### **2. Vá para Settings > API:**
- No menu lateral, clique em **Settings**
- Clique em **API**
- Você verá duas seções importantes:

### **3. Copie as informações:**

#### **Project URL:**
```
https://[SEU_PROJETO_ID].supabase.co
```
- Copie esta URL e cole no `VITE_SUPABASE_URL`

#### **anon public:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Copie esta chave e cole no `VITE_SUPABASE_ANON_KEY`

## ✅ Exemplo de configuração completa:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example
VITE_OPENAI_API_KEY=sua_chave_openai_aqui
```

## 🚨 Importante:

### **1. Nunca commite o arquivo `.env.local`:**
- Este arquivo já está no `.gitignore`
- Contém informações sensíveis
- Não deve ser enviado para o GitHub

### **2. Para produção (AWS Amplify):**
- Configure as mesmas variáveis no painel da AWS
- Vá em **Environment variables**
- Adicione cada variável separadamente

### **3. Verificar se está funcionando:**
- Reinicie o servidor após criar o arquivo
- Verifique no console do navegador se não há erros
- Teste o login no app

## 🔧 Comandos para verificar:

```bash
# Verificar se o arquivo foi criado
ls -la .env.local

# Verificar conteúdo (sem mostrar a chave)
cat .env.local | grep -v "KEY"

# Reiniciar servidor
npm run dev
```

## 📞 Se precisar de ajuda:

1. **Verifique se o arquivo está na raiz do projeto**
2. **Confirme se as chaves estão corretas**
3. **Reinicie o servidor após criar o arquivo**
4. **Verifique o console do navegador para erros**

## 🎯 Próximos passos:

1. ✅ Criar arquivo `.env.local`
2. ✅ Configurar variáveis do Supabase
3. ✅ Configurar API Key da OpenAI
4. ✅ Reiniciar servidor
5. ✅ Testar login e funcionalidades
6. ✅ Executar SQL no Supabase
