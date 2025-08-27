# 🚀 Instruções de Deploy AWS

## Passo 1: Conectar ao GitHub (Execute no terminal)

```bash
# Substitua YOUR_USERNAME pelo seu usuário do GitHub
git remote add origin https://github.com/valoprint72-pixel/studyflow-joao-pedro.git
git branch -M main
git push -u origin main
```

## Passo 2: Configurar AWS Amplify

### 2.1 Acessar AWS Console
1. Acesse [console.aws.amazon.com](https://console.aws.amazon.com)
2. Faça login na sua conta AWS
3. Procure por "AWS Amplify" na barra de busca
4. Clique em "AWS Amplify"

### 2.2 Criar Nova Aplicação
1. Clique em "New app" → "Host web app"
2. Selecione "GitHub" como source
3. Autorize a conexão com o GitHub (se solicitado)
4. Selecione o repositório: `studyflow-joao-pedro`
5. Selecione a branch: `main`

### 2.3 Configurar Build
1. **App name:** `studyflow-joao-pedro`
2. **Environment:** `production`
3. **Build settings:** O Amplify detectará automaticamente o `amplify.yml`
4. **Advanced settings:**
   - Clique em "Add environment variable"
   - Adicione suas variáveis do Supabase:
     - `VITE_SUPABASE_URL`: sua URL do Supabase
     - `VITE_SUPABASE_ANON_KEY`: sua chave anônima do Supabase

### 2.4 Deploy
1. Revise todas as configurações
2. Clique em "Save and deploy"
3. Aguarde o build (pode demorar alguns minutos)

## Passo 3: Configurar Domínio (Opcional)

### 3.1 Domínio AWS
- O Amplify fornecerá uma URL como: `https://main.d1234567890.amplifyapp.com`

### 3.2 Domínio Personalizado
1. No Amplify, vá em "Domain management"
2. Clique em "Add domain"
3. Digite seu domínio personalizado
4. Configure os registros DNS conforme instruído

## Passo 4: CI/CD Automático ✅

**Pronto!** Agora qualquer alteração que você fizer:
1. Commit no seu repositório local
2. Push para o GitHub
3. **Deploy automático** na AWS!

## URLs Importantes

### Desenvolvimento Local
- **Local:** http://localhost:5173

### Produção (após deploy)
- **AWS Amplify:** Será fornecida após o deploy
- **Supabase:** https://supabase.com/dashboard

## Comandos Úteis

### Para fazer alterações e deploy:
```bash
# 1. Fazer suas alterações no código
# 2. Commit e push:
git add .
git commit -m "Suas alterações"
git push origin main
# 3. O deploy acontece automaticamente!
```

### Para ver logs do build:
- Acesse o console do AWS Amplify
- Clique na sua app
- Vá em "Build history"

## Próximos Passos

1. ✅ Configure as variáveis de ambiente no Amplify
2. ✅ Teste o deploy fazendo uma alteração simples
3. ✅ Configure notificações de build (opcional)
4. ✅ Configure domínio personalizado (opcional)
