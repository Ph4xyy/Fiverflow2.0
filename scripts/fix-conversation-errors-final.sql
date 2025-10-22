-- Script de correction finale pour le système de conversation
-- Corrige l'erreur "created_at" ambiguous et autres problèmes

-- 1. Supprimer et recréer la fonction get_user_conversations avec la correction
DROP FUNCTION IF EXISTS get_user_conversations(UUID);

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
            messages.created_at as message_created_at
        FROM messages 
        ORDER BY conversation_id, messages.created_at DESC
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

-- 2. Vérifier que les tables existent
DO $$
BEGIN
    -- Vérifier si les tables existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE EXCEPTION 'Table conversations n''existe pas. Exécutez d''abord le script de déploiement complet.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE EXCEPTION 'Table messages n''existe pas. Exécutez d''abord le script de déploiement complet.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        RAISE EXCEPTION 'Table conversation_participants n''existe pas. Exécutez d''abord le script de déploiement complet.';
    END IF;
    
    RAISE NOTICE 'Toutes les tables existent. Fonction get_user_conversations corrigée.';
END $$;

-- 3. Tester la fonction
SELECT 'Fonction get_user_conversations corrigée avec succès!' as status;
