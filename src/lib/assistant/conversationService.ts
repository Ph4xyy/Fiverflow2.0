/**
 * Service pour gérer la persistance des conversations avec Jett
 */

import { supabase } from '../supabase';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

/**
 * Charge la conversation de l'utilisateur
 */
export async function loadConversation(userId: string): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from('assistant_conversations')
      .select('messages')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error loading conversation:', error);
      return [];
    }

    if (!data) return [];

    // Convertir les messages JSONB en array
    const messages = Array.isArray(data.messages) ? data.messages : [];
    
    // Convertir les timestamps string en Date objects
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    })) as ConversationMessage[];
  } catch (error) {
    console.error('Error loading conversation:', error);
    return [];
  }
}

/**
 * Sauvegarde la conversation de l'utilisateur
 */
export async function saveConversation(
  userId: string,
  messages: ConversationMessage[]
): Promise<void> {
  try {
    // Convertir les Date objects en strings pour JSON
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date 
        ? msg.timestamp.toISOString() 
        : typeof msg.timestamp === 'string' 
          ? msg.timestamp 
          : new Date().toISOString()
    }));

    // Utiliser upsert pour créer ou mettre à jour
    const { error } = await supabase
      .from('assistant_conversations')
      .upsert({
        user_id: userId,
        messages: messagesToSave,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving conversation:', error);
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Supprime la conversation de l'utilisateur (nouvelle conversation)
 */
export async function clearConversation(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('assistant_conversations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing conversation:', error);
    }
  } catch (error) {
    console.error('Error clearing conversation:', error);
  }
}

