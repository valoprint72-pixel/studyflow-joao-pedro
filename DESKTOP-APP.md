# 🖥️ StudyFlow - App Desktop para macOS

## 📋 Visão Geral

O StudyFlow agora está disponível como um aplicativo desktop nativo para macOS! Isso significa que você pode baixar, instalar e usar o app diretamente no seu Mac, sem precisar de um navegador.

## 🚀 Como Usar

### 1. **Desenvolvimento (Teste Local)**

Para testar o app em modo de desenvolvimento:

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run electron-dev
```

Isso irá:
- Iniciar o servidor de desenvolvimento Vite
- Abrir o app Electron automaticamente
- Permitir hot-reload durante o desenvolvimento

### 2. **Build para Produção**

Para criar o arquivo de instalação (.dmg):

```bash
# Build da aplicação web
npm run build

# Criar o app desktop
npm run electron-dist
```

Isso irá gerar:
- `dist-electron/` - Arquivos do app
- `StudyFlow-1.0.0.dmg` - Instalador para macOS
- `StudyFlow-1.0.0-mac.zip` - Versão compactada

### 3. **Instalação no Mac**

1. **Baixe o arquivo .dmg**
2. **Clique duas vezes** no arquivo .dmg
3. **Arraste o StudyFlow** para a pasta Applications
4. **Abra o app** pela primeira vez (pode pedir permissão)

## 🎯 Funcionalidades do App Desktop

### ✅ **Vantagens sobre a versão web:**

1. **Performance Superior**
   - Carregamento mais rápido
   - Melhor responsividade
   - Menos uso de memória

2. **Integração com macOS**
   - Menu nativo do macOS
   - Atalhos de teclado padrão
   - Ícone no Dock
   - Notificações nativas

3. **Funcionalidades Desktop**
   - Cmd+Q para sair
   - Cmd+H para esconder
   - Cmd+M para minimizar
   - Cmd+R para recarregar
   - F11 para tela cheia

4. **Segurança**
   - Context isolation
   - Node integration desabilitada
   - Preload scripts seguros

### 🎨 **Interface Nativa:**

- **Menu StudyFlow**: Sobre, Serviços, Esconder, Sair
- **Menu Editar**: Desfazer, Refazer, Cortar, Copiar, Colar
- **Menu Visualizar**: Recarregar, Zoom, Tela Cheia
- **Menu Janela**: Minimizar, Fechar, Trazer ao Frente

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run electron-dev          # App + servidor de desenvolvimento
npm run electron              # Apenas o app (requer build)

# Build
npm run electron-build        # Build completo
npm run electron-pack         # Build para desenvolvimento
npm run electron-dist         # Build para distribuição

# Web (original)
npm run dev                   # Servidor de desenvolvimento
npm run build                 # Build da aplicação web
npm run preview               # Preview do build
```

## 📁 Estrutura de Arquivos

```
studyflow-joao-pedro/
├── electron/
│   ├── main.js              # Processo principal do Electron
│   └── preload.js           # Script de preload seguro
├── public/
│   └── icons/
│       ├── icon.svg         # Ícone SVG
│       ├── icon.png         # Ícone PNG (gerar)
│       ├── icon.icns        # Ícone macOS (gerar)
│       └── dmg-background.png # Background do DMG (gerar)
├── scripts/
│   └── generate-icons.js    # Script para gerar ícones
├── package.json             # Configuração do app
└── DESKTOP-APP.md           # Este arquivo
```

## 🎨 Personalização de Ícones

### Gerar Ícones Necessários:

1. **Converter SVG para PNG/ICNS:**
   - Use ferramentas online (convertio.co, cloudconvert.com)
   - Use software como Sketch, Figma, ou Photoshop
   - Use comandos como ImageMagick

2. **Tamanhos Necessários:**
   - `icon.png`: 512x512px
   - `icon.icns`: Múltiplos tamanhos (16, 32, 64, 128, 256, 512)
   - `dmg-background.png`: 540x380px

3. **Executar Script:**
   ```bash
   node scripts/generate-icons.js
   ```

## 🚀 Distribuição

### Para Distribuir o App:

1. **Build de Produção:**
   ```bash
   npm run electron-dist
   ```

2. **Arquivos Gerados:**
   - `StudyFlow-1.0.0.dmg` - Instalador principal
   - `StudyFlow-1.0.0-mac.zip` - Versão compactada
   - `StudyFlow-1.0.0-mac-arm64.dmg` - Para Mac M1/M2
   - `StudyFlow-1.0.0-mac-x64.dmg` - Para Mac Intel

3. **Compartilhar:**
   - Envie o arquivo .dmg
   - Ou hospede em um servidor
   - Ou distribua via App Store (requer conta de desenvolvedor)

## 🔒 Segurança

O app desktop inclui várias medidas de segurança:

- ✅ **Context Isolation**: Isolamento entre processos
- ✅ **Node Integration**: Desabilitada por padrão
- ✅ **Preload Scripts**: Comunicação segura
- ✅ **External Links**: Abertos no navegador padrão
- ✅ **Window Creation**: Controlada e segura

## 🐛 Solução de Problemas

### Problemas Comuns:

1. **App não abre:**
   ```bash
   # Verificar permissões
   chmod +x /Applications/StudyFlow.app
   ```

2. **Erro de certificado:**
   - Vá em Preferências do Sistema > Segurança
   - Clique em "Abrir Mesmo Assim"

3. **Build falha:**
   ```bash
   # Limpar cache
   rm -rf node_modules
   npm install
   npm run electron-dist
   ```

4. **Ícones não aparecem:**
   - Verifique se os arquivos de ícone existem
   - Execute o script de geração de ícones
   - Rebuild o app

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique os logs:**
   - Abra o app
   - Pressione Cmd+Option+I
   - Verifique a aba Console

2. **Reinstale o app:**
   - Delete da pasta Applications
   - Baixe novamente
   - Instale novamente

3. **Contate o desenvolvedor:**
   - Abra uma issue no GitHub
   - Descreva o problema detalhadamente

## 🎉 Próximos Passos

O app desktop está pronto para uso! Você pode:

1. **Testar localmente** com `npm run electron-dev`
2. **Fazer build** com `npm run electron-dist`
3. **Instalar no seu Mac** usando o arquivo .dmg
4. **Distribuir** para outros usuários

**Aproveite o StudyFlow como um app nativo do macOS!** 🚀
