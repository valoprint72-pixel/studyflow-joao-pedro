# 🚀 Configuração AWS Amplify - StudyFlow

## 📋 Configuração Necessária para IA Funcionar

### **1. Acesse o AWS Amplify Console:**
- Vá para [AWS Amplify Console](https://console.aws.amazon.com/amplify)
- Selecione seu app **StudyFlow**

### **2. Configure as Variáveis de Ambiente:**

#### **Vá para: Settings > Environment variables**

#### **Adicione estas variáveis:**

| Nome da Variável | Valor |
|------------------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_OPENAI_API_KEY` | `sua_chave_openai_aqui` |

### **3. Como encontrar as chaves do Supabase:**

#### **Acesse: https://supabase.com/dashboard/project/[SEU_PROJETO]/settings/api**

#### **Copie:**
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** → `VITE_SUPABASE_ANON_KEY`

### **4. Redeploy após configuração:**

#### **Opção 1: Manual**
- Vá para **Hosting environments**
- Clique em **Redeploy this version**

#### **Opção 2: Trigger automático**
- Faça um commit vazio no GitHub:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

## ✅ Checklist de Configuração:

- [ ] Variáveis de ambiente configuradas na AWS
- [ ] Supabase configurado com SQL migrations
- [ ] Redeploy realizado
- [ ] Teste de login funcionando
- [ ] Chat com IA funcionando
- [ ] Insights automáticos funcionando

## 🚨 Problemas Comuns:

### **"API Key not found"**
- Verifique se `VITE_OPENAI_API_KEY` está configurada
- Confirme se o valor está correto

### **"Supabase connection failed"**
- Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Confirme se o projeto Supabase está ativo

### **"Function not found"**
- Execute o SQL do `supabase-migrations.sql`
- Verifique se as funções RPC foram criadas

## 🔧 Comandos Úteis:

```bash
# Verificar se as variáveis estão sendo carregadas
echo $VITE_OPENAI_API_KEY

# Testar conexão com Supabase
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
     "$VITE_SUPABASE_URL/rest/v1/"

# Trigger redeploy
git commit --allow-empty -m "Redeploy with env vars"
git push origin main
```

## 📞 Suporte:

Se a IA não funcionar após a configuração:
1. Verifique os logs do AWS Amplify
2. Confirme se as variáveis estão corretas
3. Teste a conexão com Supabase
4. Verifique se o SQL foi executado

## 🎯 Resultado Esperado:

Após a configuração, você deve conseguir:
- ✅ Fazer perguntas no Chat IA
- ✅ Receber insights automáticos
- ✅ Ver análise personalizada
- ✅ Usar todas as funcionalidades de IA
