-- =====================================================
-- NETTOYAGE COMPLET DU SYSTÈME DE CONVERSATION
-- =====================================================
-- Ce script supprime TOUT et repart de zéro

-- 1. Supprimer TOUTES les fonctions
DROP FUNCTION IF EXISTS get_user_conversations(UUID);
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS update_conversation_updated_at();
DROP FUNCTION IF EXISTS get_conversation_messages(UUID);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT);

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

-- 3. Supprimer TOUTES les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- 4. Désactiver RLS sur toutes les tables restantes
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS friend_requests DISABLE ROW LEVEL SECURITY;

SELECT 'Nettoyage complet terminé - Prêt pour la reconstruction' as status;
