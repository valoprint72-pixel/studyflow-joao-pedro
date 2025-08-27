const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface AIAnalysis {
  insights: string[];
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
      Analise os dados do usuário e forneça insights personalizados:
      
      HÁBITOS (últimos 7 dias):
      ${JSON.stringify(habits, null, 2)}
      
      METAS:
      ${JSON.stringify(goals, null, 2)}
      
      DADOS DE ESTUDO:
      ${JSON.stringify(studyData, null, 2)}
      
      Forneça uma análise estruturada em JSON com:
      {
        "insights": ["3 insights principais sobre padrões"],
        "suggestions": ["3 sugestões práticas para melhorar"],
        "motivation": "mensagem motivacional personalizada",
        "score": número de 1-10,
        "areas": {
          "strength": ["pontos fortes identificados"],
          "improvement": ["áreas para melhorar"]
        }
      }
    `;

    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        insights: ['Analisando seus dados...'],
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
}
