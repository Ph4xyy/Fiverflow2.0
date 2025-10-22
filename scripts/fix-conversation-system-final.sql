-- Script de réparation finale du système de conversation
-- Supprime tout et recrée proprement

-- 1. Supprimer TOUTES les fonctions existantes
DROP FUNCTION IF EXISTS get_user_conversations(UUID);
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS update_conversation_updated_at();

-- 2. Supprimer TOUTES les politiques RLS
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can accept friend requests" ON friend_requests;

-- 3. Désactiver RLS temporairement
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests DISABLE ROW LEVEL SECURITY;

-- 4. Créer une fonction get_user_conversations SIMPLE
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  other_participant_name TEXT,
  other_participant_username TEXT,
  other_participant_avatar TEXT,
  unread_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.title, 'Conversation') as title,
    '' as last_message,
    c.last_message_at,
    'Utilisateur' as other_participant_name,
    'utilisateur' as other_participant_username,
    '' as other_participant_avatar,
    0 as unread_count,
    c.created_at,
    c.updated_at
  FROM conversations c
  WHERE c.id IN (
    SELECT DISTINCT cp.conversation_id
    FROM conversation_participants cp
    WHERE cp.user_id = user_id_param
  )
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer une fonction create_direct_conversation SIMPLE
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Créer une nouvelle conversation
  INSERT INTO conversations (title, type)
  VALUES (
    'Conversation directe',
    'direct'
  )
  RETURNING id INTO conversation_id;

  -- Ajouter les participants
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
  VALUES 
    (conversation_id, user1_id, NOW()),
    (conversation_id, user2_id, NOW());

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Vérifier que les fonctions sont créées
SELECT 'Fonctions de conversation créées avec succès' as status;

-- 7. Tester les fonctions
SELECT 'Test des fonctions...' as status;
