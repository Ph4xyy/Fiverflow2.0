-- =====================================================
-- NETTOYAGE COMPLET DU SYSTÈME DE CONVERSATION
-- =====================================================
-- Ce script supprime complètement le système de conversation

-- 1. Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS update_conversation_updated_at();
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_conversations(UUID);

-- 3. Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations they're invited to" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update their received friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;

-- 4. Supprimer les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- 5. Message de confirmation
SELECT 'Système de conversation supprimé complètement!' as status;
