import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  title: string;
  type: string;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
  other_participant_name: string;
  other_participant_username: string;
  other_participant_avatar: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  sender_name: string;
  sender_username: string;
  sender_avatar: string;
}

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_friend?: boolean;
  friend_request_status?: 'pending' | 'accepted' | 'declined' | 'blocked';
}

export class ConversationService {
  /**
   * Récupère les conversations d'un utilisateur
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id: userId
      });

      if (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle conversation directe
   */
  static async createDirectConversation(user1Id: string, user2Id: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        user1_id: user1Id,
        user2_id: user2Id
      });

      if (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des messages:', error);
        throw error;
      }

      // Transformer les données pour inclure les informations du sender
      return (data || []).map((message: any) => ({
        ...message,
        sender_name: message.sender?.full_name || 'Utilisateur inconnu',
        sender_username: message.sender?.username || 'unknown',
        sender_avatar: message.sender?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      return [];
    }
  }

  /**
   * Envoie un message dans une conversation
   */
  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    content: string, 
    messageType: string = 'text'
  ): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
          message_type: messageType
        })
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(
            full_name,
            username,
            avatar_url
          )
        )
        .single();

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        throw error;
      }

      // Transformer les données pour inclure les informations du sender
      return {
        ...data,
        sender_name: data.sender?.full_name || 'Utilisateur inconnu',
        sender_username: data.sender?.username || 'unknown',
        sender_avatar: data.sender?.avatar_url || ''
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  /**
   * Marque les messages comme lus
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour des messages lus:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des messages lus:', error);
    }
  }

  /**
   * Recherche des utilisateurs par username ou email
   */
  static async searchUsers(query: string, searchType: 'username' | 'email'): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, username, avatar_url')
        .ilike(searchType, `%${query}%`)
        .limit(10);

      if (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        throw error;
      }

      return (data || []).map((user: any) => ({
        id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        email: '', // Pas d'email pour la recherche par username
        avatar_url: user.avatar_url,
        is_friend: false, // TODO: Vérifier le statut d'amitié
        friend_request_status: 'none'
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  }

  /**
   * Envoie une demande d'amis
   */
  static async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) {
        console.error('Erreur lors de l\'envoi de la demande d\'amis:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande d\'amis:', error);
      throw error;
    }
  }

  /**
   * Accepte une demande d'amis
   */
  static async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Erreur lors de l\'acceptation de la demande:', updateError);
        throw updateError;
      }

      // Récupérer les IDs des utilisateurs
      const { data: requestData, error: fetchError } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .eq('id', requestId)
        .single();

      if (fetchError || !requestData) {
        console.error('Erreur lors de la récupération de la demande:', fetchError);
        throw fetchError;
      }

      // Créer la relation d'amitié
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: requestData.sender_id,
          user2_id: requestData.receiver_id
        });

      if (friendshipError) {
        console.error('Erreur lors de la création de l\'amitié:', friendshipError);
        throw friendshipError;
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande d\'amis:', error);
      throw error;
    }
  }

  /**
   * Récupère les demandes d'amis reçues
   */
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des demandes d\'amis:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des demandes d\'amis:', error);
      return [];
    }
  }
}
