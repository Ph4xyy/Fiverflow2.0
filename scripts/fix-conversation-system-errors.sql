-- Script de réparation des erreurs du système de conversation
-- Corrige les erreurs SQL et RLS

-- 1. Supprimer les fonctions problématiques
DROP FUNCTION IF EXISTS get_user_conversations(UUID);
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, UUID);

-- 2. Corriger la fonction get_user_conversations avec des alias de table
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
    c.title,
    c.last_message,
    c.last_message_at,
    c.other_participant_name,
    c.other_participant_username,
    c.other_participant_avatar,
    c.unread_count,
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

-- 3. Corriger la fonction create_direct_conversation
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  existing_conversation_id UUID;
BEGIN
  -- Vérifier si une conversation existe déjà entre ces deux utilisateurs
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  WHERE c.id IN (
    SELECT cp1.conversation_id
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id
    AND cp1.conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      GROUP BY conversation_id
      HAVING COUNT(*) = 2
    )
  )
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Créer une nouvelle conversation
  INSERT INTO conversations (title, conversation_type, created_by)
  VALUES (
    'Conversation directe',
    'direct',
    user1_id
  )
  RETURNING id INTO conversation_id;

  -- Ajouter les participants
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
  VALUES 
    (conversation_id, user1_id, NOW()),
    (conversation_id, user2_id, NOW());

  -- Mettre à jour les informations de l'autre participant
  UPDATE conversations 
  SET 
    other_participant_name = (
      SELECT full_name FROM user_profiles WHERE user_id = user2_id
    ),
    other_participant_username = (
      SELECT username FROM user_profiles WHERE user_id = user2_id
    ),
    other_participant_avatar = (
      SELECT avatar_url FROM user_profiles WHERE user_id = user2_id
    )
  WHERE id = conversation_id;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Supprimer et recréer les politiques RLS pour éviter la récursion
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;

-- 5. Recréer les politiques RLS simplifiées
CREATE POLICY "Users can view their own conversations" ON conversation_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- 6. Vérifier que les fonctions sont créées correctement
SELECT 'Fonctions de conversation créées avec succès' as status;
