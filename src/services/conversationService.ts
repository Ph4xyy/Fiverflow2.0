import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  title: string;
  last_message: string;
  last_message_at: string;
  other_participant_name: string;
  other_participant_username: string;
  other_participant_avatar: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_username: string;
  sender_avatar: string;
  created_at: string;
}

export interface User {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

export class ConversationService {
  // Récupérer les conversations d'un utilisateur
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id_param: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      throw error;
    }
  }

  // Créer une conversation directe
  static async createDirectConversation(user1Id: string, user2Id: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        user1_id: user1Id,
        user2_id: user2Id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  // Récupérer les messages d'une conversation
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        conversation_id_param: conversationId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      throw error;
    }
  }

  // Envoyer un message
  static async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const { data: messageId, error: sendError } = await supabase.rpc('send_message', {
        conversation_id_param: conversationId,
        sender_id_param: senderId,
        content_param: content
      });

      if (sendError) throw sendError;

      // Récupérer le message envoyé avec les informations du sender
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: message.sender?.full_name || 'Utilisateur',
        sender_username: message.sender?.username || 'utilisateur',
        sender_avatar: message.sender?.avatar_url || '',
        created_at: message.created_at
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Rechercher des utilisateurs
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        query_param: query
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  // Envoyer une demande d'ami
  static async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande d\'ami:', error);
      throw error;
    }
  }

  // Accepter une demande d'ami
  static async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande d\'ami:', error);
      throw error;
    }
  }

  // Récupérer les demandes d'ami reçues
  static async getReceivedFriendRequests(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des demandes d\'ami:', error);
      throw error;
    }
  }
}