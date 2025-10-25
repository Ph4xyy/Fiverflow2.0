import { loadStripe, Stripe } from '@stripe/stripe-js';

// Récupérer la clé publique Stripe depuis les variables d'environnement
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51S9va4KF06h9za4cRVn81wyCSJflsM089tDiQ9VlPuUz58cfzAEuFYiUOnShXyJHQDSSirAdRqwt5ZgMOV058LZN00PHEhi9Rk';

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Initialiser Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export default getStripe;
