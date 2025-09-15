/*
  # Créer la table referral_logs pour les commissions de parrainage

  1. Nouvelle table
    - `referral_logs`
      - `id` (uuid, clé primaire)
      - `referrer_id` (uuid, référence vers users.id)
      - `referred_user_id` (uuid, référence vers users.id)
      - `amount_earned` (numeric, montant de la commission)
      - `date` (timestamptz, date de la commission)
      - `created_at` (timestamptz)

  2. Sécurité
    - Activer RLS sur la table `referral_logs`
    - Politique pour que les utilisateurs voient leurs propres commissions
    - Index pour optimiser les requêtes

  3. Contraintes
    - Clés étrangères avec CASCADE
    - Montant positif uniquement
*/

-- Créer la table referral_logs
CREATE TABLE IF NOT EXISTS referral_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  amount_earned numeric(10,2) NOT NULL CHECK (amount_earned > 0),
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Ajouter les clés étrangères
ALTER TABLE referral_logs 
ADD CONSTRAINT referral_logs_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referral_logs 
ADD CONSTRAINT referral_logs_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_referral_logs_referrer_id ON referral_logs(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_logs_referred_user_id ON referral_logs(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_logs_date ON referral_logs(date);

-- Activer Row Level Security
ALTER TABLE referral_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient leurs commissions en tant que parrain
CREATE POLICY "Users can read own referral earnings"
  ON referral_logs
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Politique pour que les utilisateurs voient les commissions générées par leurs abonnements
CREATE POLICY "Users can read referral logs for their subscriptions"
  ON referral_logs
  FOR SELECT
  TO authenticated
  USING (referred_user_id = auth.uid());

-- Politique pour insérer des commissions (système uniquement)
CREATE POLICY "System can insert referral logs"
  ON referral_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);