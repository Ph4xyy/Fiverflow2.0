import OpenAI from 'openai';

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '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',
  dangerouslyAllowBrowser: true // Nécessaire pour le côté client
});

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuration du système pour l'assistant FiverFlow
const SYSTEM_PROMPT = `Tu es l'assistant IA de FiverFlow, une plateforme de gestion pour freelancers et entrepreneurs.

CONTEXTE:
- FiverFlow aide les freelancers à gérer leurs clients, commandes, factures et statistiques
- La plateforme propose 3 plans: Lunch (gratuit), Boost (premium), Scale (entreprise)
- Les utilisateurs peuvent gérer leurs projets, clients, commandes et générer des factures
- Il y a un système de parrainage et de commissions

TON RÔLE:
- Aider les utilisateurs avec leurs questions sur FiverFlow
- Expliquer les fonctionnalités de la plateforme
- Guider les utilisateurs dans l'utilisation des outils
- Proposer des conseils pour optimiser leur workflow freelance
- Répondre aux questions techniques de manière claire et professionnelle

STYLE DE RÉPONSE:
- Sois professionnel mais accessible
- Utilise des exemples concrets
- Structure tes réponses avec des listes et des étapes claires
- Propose des actions concrètes quand c'est possible
- Reste dans le contexte de FiverFlow et du freelancing

IMPORTANT:
- Ne donne jamais d'informations personnelles ou sensibles
- Si tu ne connais pas une fonctionnalité spécifique, dis-le clairement
- Encourage l'utilisation des fonctionnalités de FiverFlow
- Propose toujours des solutions pratiques`;

export class FiverFlowAssistant {
  private conversationHistory: AssistantMessage[] = [];

  constructor() {
    // Initialiser avec le prompt système
    this.conversationHistory.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }

  async sendMessage(userMessage: string): Promise<AssistantResponse> {
    try {
      // Ajouter le message utilisateur à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Limiter l'historique pour éviter de dépasser les limites de tokens
      if (this.conversationHistory.length > 20) {
        // Garder le prompt système et les 18 derniers messages
        this.conversationHistory = [
          this.conversationHistory[0], // System prompt
          ...this.conversationHistory.slice(-18)
        ];
      }

      // Appeler l'API OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modèle optimisé pour les assistants
        messages: this.conversationHistory,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

      // Ajouter la réponse de l'assistant à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return {
        message: assistantMessage,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens
        } : undefined
      };

    } catch (error) {
      console.error('Erreur OpenAI:', error);
      throw new Error('Impossible de contacter l\'assistant. Veuillez réessayer plus tard.');
    }
  }

  // Réinitialiser la conversation
  resetConversation(): void {
    this.conversationHistory = [{
      role: 'system',
      content: SYSTEM_PROMPT
    }];
  }

  // Obtenir l'historique de la conversation
  getConversationHistory(): AssistantMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  // Obtenir des suggestions de questions
  getSuggestions(): string[] {
    return [
      "Comment gérer mes clients efficacement ?",
      "Quelle est la différence entre les plans Lunch, Boost et Scale ?",
      "Comment créer une facture professionnelle ?",
      "Comment optimiser mon workflow freelance ?",
      "Comment utiliser le système de parrainage ?",
      "Comment suivre mes revenus et statistiques ?",
      "Comment organiser mes commandes ?",
      "Quels sont les avantages de FiverFlow ?"
    ];
  }
}

// Instance globale de l'assistant
export const assistant = new FiverFlowAssistant();

export default openai;
