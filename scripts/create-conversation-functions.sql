-- =====================================================
-- FONCTIONS BACKEND POUR LE SYSTÈME DE CONVERSATION
-- =====================================================

-- 1. Fonction pour récupérer les conversations d'un utilisateur
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
        COALESCE(m.created_at, c.updated_at) as last_message_at,
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
            created_at
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
    ORDER BY COALESCE(m.created_at, c.updated_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction pour créer une conversation directe
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
    INSERT INTO conversations (title, type)
    VALUES ('Conversation directe', 'direct')
    RETURNING id INTO conversation_id;

    -- Ajouter les participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id), (conversation_id, user2_id);

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour récupérer les messages d'une conversation
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

-- 4. Fonction pour envoyer un message
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

-- 5. Fonction pour rechercher des utilisateurs
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

SELECT 'Fonctions de conversation créées avec succès' as status;
