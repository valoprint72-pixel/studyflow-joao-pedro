# StudyFlow - Sistema de Gestão de Estudos e Finanças

Um aplicativo web completo para gerenciar estudos, finanças e tarefas, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### 📚 Gestão de Estudos
- Registro de sessões de estudo com XP e níveis
- Sistema de conquistas e sequências
- Organização por matérias do ENEM
- Notificações motivacionais

### 💰 Controle Financeiro
- Registro de receitas e despesas
- Gestão de múltiplas contas
- Transferências entre contas
- Relatórios e gráficos

### ✅ Gerenciamento de Tarefas
- Criação e edição de tarefas
- Sistema de prioridades
- Categorização
- Lembretes automáticos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Ícones**: Lucide React
- **Notificações**: Web Notifications API + Service Worker

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Configuração

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd project
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Configure o banco de dados Supabase**
   
   Execute as migrações SQL na pasta `supabase/migrations/` no seu projeto Supabase:
   - `20250825123008_copper_hall.sql`
   - `20250825123015_wispy_wind.sql`
   - `20250826174750_noisy_spark.sql`
   - `20250826174758_sunny_summit.sql`
   - `20250826175118_weathered_cherry.sql`
   - `20250827140305_misty_pond.sql`
   - `20250827140317_purple_disk.sql`

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

   O aplicativo estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── AccountForm.tsx
│   ├── AccountManager.tsx
│   ├── Dashboard.tsx
│   ├── FinanceManager.tsx
│   ├── Login.tsx
│   ├── Sidebar.tsx
│   ├── StudySessionForm.tsx
│   ├── StudyTracker.tsx
│   ├── TaskForm.tsx
│   ├── TaskManager.tsx
│   ├── TransactionForm.tsx
│   └── TransferForm.tsx
├── lib/
│   └── supabase.ts     # Cliente Supabase
├── utils/
│   └── notifications.ts # Sistema de notificações
├── App.tsx             # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🎯 Como Usar

1. **Cadastro/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize estatísticas gerais
3. **Estudos**: Registre sessões de estudo e acompanhe progresso
4. **Finanças**: Gerencie contas e transações
5. **Tarefas**: Organize suas atividades

## 🔒 Segurança

- Autenticação via Supabase Auth
- RLS (Row Level Security) habilitado
- Validação de dados no frontend e backend
- Variáveis de ambiente para configurações sensíveis

## 📱 PWA Features

- Service Worker para notificações offline
- Interface responsiva
- Instalação como app nativo

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
```

Os arquivos gerados estarão na pasta `dist/` e podem ser hospedados em qualquer servidor estático.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

João Pedro - Sistema de Gestão de Estudos e Finanças
