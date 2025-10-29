import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripe = getStripe();

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
