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
      // Appeler l'API de checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const { sessionId } = await response.json();

      // Rediriger vers Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
      
      if (!stripe) {
        throw new Error('Impossible de charger Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        toast.error(error.message || 'Une erreur est survenue lors du paiement');
      } else if (onSuccess) {
        onSuccess();
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
