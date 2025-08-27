#!/bin/bash

# 🚀 Script de Deploy Automático - StudyFlow

echo "🚀 StudyFlow - Deploy Automático"
echo "================================="

# Verificar se há alterações para commit
if [[ -n $(git status -s) ]]; then
    echo "📝 Alterações detectadas, fazendo commit..."
    
    # Pedir mensagem de commit
    read -p "💬 Digite a mensagem do commit: " commit_message
    
    # Se não foi fornecida mensagem, usar padrão
    if [[ -z "$commit_message" ]]; then
        commit_message="📦 Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Fazer commit
    git add .
    git commit -m "$commit_message"
    
    echo "✅ Commit realizado: $commit_message"
else
    echo "ℹ️  Nenhuma alteração detectada para commit"
fi

# Fazer push para o GitHub
echo "🔄 Enviando para GitHub..."
git push origin main

if [[ $? -eq 0 ]]; then
    echo "✅ Push realizado com sucesso!"
    echo "🚀 Deploy automático iniciado na AWS Amplify"
    echo ""
    echo "📱 Você pode acompanhar o progresso em:"
    echo "   https://console.aws.amazon.com/amplify/"
    echo ""
    echo "⏰ O deploy geralmente leva 2-5 minutos"
else
    echo "❌ Erro no push. Verifique sua conexão e configuração Git"
    exit 1
fi
