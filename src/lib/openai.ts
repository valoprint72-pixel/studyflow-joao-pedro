const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface AIAnalysis {
  insights: Array<{
    type: 'positive' | 'suggestion' | 'warning' | 'motivation';
    title: string;
    message: string;
    icon: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  suggestions: string[];
  motivation: string;
  score: number;
  areas: {
    strength: string[];
    improvement: string[];
  };
}

export interface AIFeedback {
  message: string;
  type: 'motivation' | 'suggestion' | 'warning' | 'celebration';
  action?: string;
}

export class OpenAIService {
  private static async makeRequest(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'Você é um coach pessoal especializado em autoconhecimento, produtividade e desenvolvimento pessoal. Seja motivacional, empático e prático em suas respostas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.';
    }
  }

  static async analyzeHabits(habits: any[], goals: any[], studyData: any): Promise<AIAnalysis> {
    const prompt = `
      Analise os dados do usuário e forneça insights personalizados e acionáveis:
      
      HÁBITOS:
      ${JSON.stringify(habits, null, 2)}
      
      METAS:
      ${JSON.stringify(goals, null, 2)}
      
      DADOS DE ESTUDO:
      ${JSON.stringify(studyData, null, 2)}
      
      Forneça uma análise estruturada em JSON com insights específicos:
      {
        "insights": [
          {
            "type": "positive|suggestion|warning|motivation",
            "title": "Título do insight",
            "message": "Mensagem detalhada e motivacional",
            "icon": "emoji ou ícone",
            "action": "ação sugerida (opcional)",
            "priority": "high|medium|low"
          }
        ],
        "suggestions": ["3 sugestões práticas para melhorar"],
        "motivation": "mensagem motivacional personalizada",
        "score": número de 1-10,
        "areas": {
          "strength": ["pontos fortes identificados"],
          "improvement": ["áreas para melhorar"]
        }
      }
      
      IMPORTANTE: 
      - Se não há hábitos, sugira criar o primeiro hábito
      - Se não há metas, sugira definir metas
      - Se não há sessões de estudo, sugira usar o Pomodoro
      - Se não há dados financeiros, sugira controle financeiro
      - Seja específico e acionável
      - Use emojis apropriados para os ícones
      - Priorize insights de alta prioridade para dados ausentes
    `;

    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback com insights básicos
      return {
        insights: [
          {
            type: 'suggestion',
            title: 'Comece com Hábitos',
            message: 'Você ainda não tem hábitos cadastrados. Que tal começar com algo simples como "Beber água" ou "Ler 10 minutos"?',
            icon: '🌱',
            action: 'Criar primeiro hábito',
            priority: 'high'
          },
          {
            type: 'suggestion',
            title: 'Defina Metas',
            message: 'Metas dão direção ao seu progresso. Que tal definir uma meta para esta semana?',
            icon: '🎯',
            action: 'Criar primeira meta',
            priority: 'high'
          },
          {
            type: 'suggestion',
            title: 'Inicie uma Sessão de Estudo',
            message: 'Use o Timer Pomodoro para focar nos estudos. 25 minutos de foco podem fazer a diferença!',
            icon: '📚',
            action: 'Iniciar Pomodoro',
            priority: 'medium'
          },
          {
            type: 'suggestion',
            title: 'Controle Financeiro',
            message: 'Comece a registrar suas despesas e receitas para ter melhor controle financeiro.',
            icon: '💰',
            action: 'Registrar transação',
            priority: 'medium'
          }
        ],
        suggestions: ['Continue monitorando seus hábitos'],
        motivation: 'Você está no caminho certo!',
        score: 7,
        areas: {
          strength: ['Consistência'],
          improvement: ['Foco']
        }
      };
    }
  }

  static async getDailyMotivation(userName: string, currentStreak: number): Promise<string> {
    const prompt = `
      Gere uma mensagem motivacional personalizada para ${userName} que está em uma sequência de ${currentStreak} dias.
      Seja inspirador, específico e inclua emojis. Máximo 2 frases.
    `;

    return await this.makeRequest(prompt);
  }

  static async getPersonalizedAdvice(context: string, userData: any): Promise<AIFeedback> {
    const prompt = `
      Contexto: ${context}
      
      Dados do usuário: ${JSON.stringify(userData, null, 2)}
      
      Forneça um conselho personalizado em JSON:
      {
        "message": "conselho motivacional e prático",
        "type": "motivation|suggestion|warning|celebration",
        "action": "ação específica recomendada"
      }
    `;

    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        message: 'Continue focado nos seus objetivos!',
        type: 'motivation'
      };
    }
  }

  static async generateQuote(category: 'motivation' | 'study' | 'success' | 'focus'): Promise<string> {
    const prompts = {
      motivation: 'Gere uma frase motivacional curta e impactante sobre superação e determinação. Máximo 15 palavras.',
      study: 'Gere uma frase inspiradora sobre estudos e aprendizado. Máximo 15 palavras.',
      success: 'Gere uma frase sobre sucesso e realização pessoal. Máximo 15 palavras.',
      focus: 'Gere uma frase sobre foco e produtividade. Máximo 15 palavras.'
    };

    return await this.makeRequest(prompts[category]);
  }

  static async generateArticle(category: 'study' | 'politics' | 'entrepreneurship'): Promise<string> {
    const prompts = {
      study: 'Gere um resumo curto e inspirador sobre técnicas de estudo ou aprendizado. Máximo 3 parágrafos.',
      politics: 'Gere um resumo curto sobre um conceito político atual ou histórico. Máximo 3 parágrafos.',
      entrepreneurship: 'Gere um resumo curto sobre empreendedorismo ou negócios. Máximo 3 parágrafos.'
    };

    return await this.makeRequest(prompts[category]);
  }

  static async analyzeSurveyResponse(survey: any, answers: any): Promise<string> {
    const prompt = `
      Analise as respostas do questionário e forneça insights personalizados:
      
      Questionário: ${JSON.stringify(survey, null, 2)}
      Respostas: ${JSON.stringify(answers, null, 2)}
      
      Forneça uma análise em português com:
      - Padrões identificados
      - Pontos fortes
      - Áreas para desenvolvimento
      - Sugestões práticas
      
      Seja motivacional e construtivo. Máximo 2 parágrafos.
    `;

    return await this.makeRequest(prompt);
  }
}
