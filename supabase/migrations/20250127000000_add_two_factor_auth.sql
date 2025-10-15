/*
  # Ajouter le support 2FA (Two-Factor Authentication)

  1. Modifications
    - Ajouter la colonne `two_factor_enabled` à la table users
    - Créer la table `user_two_factor_secrets` pour stocker les secrets 2FA
    - Ajouter des index pour les performances

  2. Sécurité
    - Les secrets 2FA sont stockés de manière sécurisée
    - Support pour plusieurs méthodes d'authentification
    - Audit trail pour les activations/désactivations
*/

-- Ajouter la colonne two_factor_enabled à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- Créer la table pour stocker les secrets 2FA
CREATE TABLE IF NOT EXISTS user_two_factor_secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret_key text NOT NULL,
  backup_codes text[] DEFAULT '{}',
  method text NOT NULL DEFAULT 'totp', -- 'totp', 'sms', 'email'
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone
);

-- Créer un index unique pour user_id et method
CREATE UNIQUE INDEX IF NOT EXISTS user_two_factor_secrets_user_method_unique 
ON user_two_factor_secrets(user_id, method) 
WHERE is_active = true;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS user_two_factor_secrets_user_id_idx 
ON user_two_factor_secrets(user_id);

-- Créer la table pour l'audit des tentatives 2FA
CREATE TABLE IF NOT EXISTS two_factor_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_type text NOT NULL, -- 'success', 'failed', 'backup_code_used'
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS two_factor_attempts_user_id_idx 
ON two_factor_attempts(user_id);
CREATE INDEX IF NOT EXISTS two_factor_attempts_created_at_idx 
ON two_factor_attempts(created_at);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_two_factor_secrets_updated_at 
  BEFORE UPDATE ON user_two_factor_secrets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour user_two_factor_secrets
ALTER TABLE user_two_factor_secrets ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs peuvent voir leurs propres secrets
CREATE POLICY "Users can view their own 2FA secrets" ON user_two_factor_secrets
  FOR SELECT USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent insérer leurs propres secrets
CREATE POLICY "Users can insert their own 2FA secrets" ON user_two_factor_secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent mettre à jour leurs propres secrets
CREATE POLICY "Users can update their own 2FA secrets" ON user_two_factor_secrets
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent supprimer leurs propres secrets
CREATE POLICY "Users can delete their own 2FA secrets" ON user_two_factor_secrets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS pour two_factor_attempts
ALTER TABLE two_factor_attempts ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs peuvent voir leurs propres tentatives
CREATE POLICY "Users can view their own 2FA attempts" ON two_factor_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent insérer leurs propres tentatives
CREATE POLICY "Users can insert their own 2FA attempts" ON two_factor_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour générer des codes de sauvegarde
CREATE OR REPLACE FUNCTION generate_backup_codes(count integer DEFAULT 8)
RETURNS text[] AS $$
DECLARE
  codes text[];
  i integer;
BEGIN
  codes := '{}';
  FOR i IN 1..count LOOP
    codes := array_append(codes, 
      upper(substring(md5(random()::text) from 1 for 8))
    );
  END LOOP;
  RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier un code de sauvegarde
CREATE OR REPLACE FUNCTION verify_backup_code(user_uuid uuid, code text)
RETURNS boolean AS $$
DECLARE
  secret_record user_two_factor_secrets%ROWTYPE;
  updated_codes text[];
BEGIN
  -- Récupérer le secret 2FA de l'utilisateur
  SELECT * INTO secret_record 
  FROM user_two_factor_secrets 
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND method = 'totp'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Vérifier si le code est dans les codes de sauvegarde
  IF code = ANY(secret_record.backup_codes) THEN
    -- Supprimer le code utilisé
    updated_codes := array_remove(secret_record.backup_codes, code);
    
    -- Mettre à jour la base de données
    UPDATE user_two_factor_secrets 
    SET backup_codes = updated_codes,
        last_used_at = now()
    WHERE id = secret_record.id;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;
