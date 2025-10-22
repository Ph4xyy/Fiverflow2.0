-- Script de nettoyage complet du système de conversation
-- Ce script supprime toutes les tables, fonctions et données liées au système de conversation

-- Supprimer les fonctions liées au système de conversation
DROP FUNCTION IF EXISTS create_conversation(uuid, uuid, text);
DROP FUNCTION IF EXISTS send_message(uuid, uuid, text);
DROP FUNCTION IF EXISTS get_conversations(uuid);
DROP FUNCTION IF EXISTS get_messages(uuid, uuid);
DROP FUNCTION IF EXISTS mark_messages_as_read(uuid, uuid);
DROP FUNCTION IF EXISTS delete_conversation(uuid, uuid);
DROP FUNCTION IF EXISTS get_conversation_participants(uuid);

-- Supprimer les tables liées au système de conversation
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Supprimer les politiques RLS liées au système de conversation
-- (Les politiques sont automatiquement supprimées avec les tables)

-- Supprimer les index liés au système de conversation
-- (Les index sont automatiquement supprimés avec les tables)

-- Nettoyer les types personnalisés si ils existent
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS conversation_type CASCADE;

-- Vérifier que tout a été supprimé
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename LIKE '%conversation%' 
   OR tablename LIKE '%message%'
   OR tablename LIKE '%chat%';

-- Afficher un message de confirmation
SELECT 'Système de conversation complètement supprimé' as status;
