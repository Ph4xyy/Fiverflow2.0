import React, { useState } from 'react';
import { Button } from './ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionButtonProps {
  priceId: string;
  planName: string;
  amount: string;
  onSuccess?: () => void;
  className?: string;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  priceId,
  planName,
  amount,
  onSuccess,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      return;
    }

    setIsLoading(true);

    try {
      // Obtenir le token d'authentification
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Erreur d\'authentification');
      }

      // Appeler l'Edge Function Supabase
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/upgrade?canceled=true`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();

      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('URL de redirection manquante');
      }

    } catch (error) {
      console.error('Erreur de souscription:', error);
      toast.error(error instanceof Error ? error.message : 'Échec du processus de souscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          S'abonner à {planName} - {amount}
        </>
      )}
    </Button>
  );
};

export default SubscriptionButton;
