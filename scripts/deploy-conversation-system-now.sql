-- =====================================================
-- DÉPLOIEMENT IMMÉDIAT DU SYSTÈME DE CONVERSATION
-- =====================================================
-- Script pour déployer le système de conversation complet

-- 1. Nettoyer complètement
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON messages;
DROP FUNCTION IF EXISTS get_user_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_conversation_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_conversation_messages(UUID) CASCADE;
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS search_users(TEXT) CASCADE;

-- Supprimer toutes les politiques RLS
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

-- Supprimer toutes les tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- 2. Créer les tables
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Conversation',
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- 3. Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own participants" ON conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own friend requests" ON friend_requests
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received friend requests" ON friend_requests
    FOR UPDATE USING (receiver_id = auth.uid());

CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create friendships" ON friendships
    FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- 5. Créer les fonctions
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
        COALESCE(m.content, '') as last_message,
        COALESCE(m.message_created_at, c.updated_at) as last_message_at,
        COALESCE(up.full_name, 'Utilisateur') as other_participant_name,
        COALESCE(up.username, 'utilisateur') as other_participant_username,
        COALESCE(up.avatar_url, '') as other_participant_avatar,
        0 as unread_count,
        c.created_at,
        c.updated_at
    FROM conversations c
    LEFT JOIN (
        SELECT DISTINCT ON (conversation_id) 
            conversation_id, 
            content, 
            created_at as message_created_at
        FROM messages 
        ORDER BY conversation_id, created_at DESC
    ) m ON c.id = m.conversation_id
    LEFT JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != user_id_param
    LEFT JOIN user_profiles up ON cp_other.user_id = up.user_id
    WHERE c.id IN (
        SELECT conversation_id
        FROM conversation_participants
        WHERE user_id = user_id_param
    )
    ORDER BY COALESCE(m.message_created_at, c.updated_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    existing_conversation_id UUID;
BEGIN
    -- Vérifier si une conversation existe déjà
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
    INSERT INTO conversations (title, type)
    VALUES ('Conversation directe', 'direct')
    RETURNING id INTO conversation_id;

    -- Ajouter les participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id), (conversation_id, user2_id);

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_conversation_messages(conversation_id_param UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    sender_id UUID,
    sender_name TEXT,
    sender_username TEXT,
    sender_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.sender_id,
        COALESCE(up.full_name, 'Utilisateur') as sender_name,
        COALESCE(up.username, 'utilisateur') as sender_username,
        COALESCE(up.avatar_url, '') as sender_avatar,
        m.created_at
    FROM messages m
    LEFT JOIN user_profiles up ON m.sender_id = up.user_id
    WHERE m.conversation_id = conversation_id_param
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION send_message(
    conversation_id_param UUID,
    sender_id_param UUID,
    content_param TEXT
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    -- Insérer le message
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (conversation_id_param, sender_id_param, content_param)
    RETURNING id INTO message_id;

    -- Mettre à jour la conversation
    UPDATE conversations 
    SET updated_at = NOW()
    WHERE id = conversation_id_param;

    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_users(query_param TEXT)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    username TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.full_name,
        up.username,
        up.avatar_url
    FROM user_profiles up
    WHERE up.username ILIKE '%' || query_param || '%'
       OR up.full_name ILIKE '%' || query_param || '%'
    ORDER BY up.full_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Système de conversation déployé avec succès !' as status;
