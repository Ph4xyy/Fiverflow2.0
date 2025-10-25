export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: string;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'boost_monthly',
    priceId: 'price_boost_monthly',
    name: 'Boost',
    description: 'Accès aux fonctionnalités Boost avec facturation mensuelle',
    mode: 'subscription',
    price: '$24.00',
    currency: 'USD',
    interval: 'month'
  },
  {
    id: 'boost_yearly',
    priceId: 'price_boost_yearly',
    name: 'Boost',
    description: 'Accès aux fonctionnalités Boost avec facturation annuelle',
    mode: 'subscription',
    price: '$240.00',
    currency: 'USD',
    interval: 'year'
  },
  {
    id: 'scale_monthly',
    priceId: 'price_scale_monthly',
    name: 'Scale',
    description: 'Accès aux fonctionnalités Scale avec facturation mensuelle',
    mode: 'subscription',
    price: '$59.00',
    currency: 'USD',
    interval: 'month'
  },
  {
    id: 'scale_yearly',
    priceId: 'price_scale_yearly',
    name: 'Scale',
    description: 'Accès aux fonctionnalités Scale avec facturation annuelle',
    mode: 'subscription',
    price: '$590.00',
    currency: 'USD',
    interval: 'year'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getMonthlyProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.interval === 'month');
};

export const getYearlyProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.interval === 'year');
};

export const getProductsByPlan = (planType: 'pro' | 'excellence'): StripeProduct[] => {
  return stripeProducts.filter(product => 
    product.name.toLowerCase().includes(planType.toLowerCase())
  );
};

// Helper function to get savings percentage for yearly plans
export const getYearlySavings = (planType: 'pro' | 'excellence'): number => {
  const monthlyProducts = getMonthlyProducts();
  const yearlyProducts = getYearlyProducts();
  
  const monthlyProduct = monthlyProducts.find(p => 
    p.name.toLowerCase().includes(planType.toLowerCase())
  );
  const yearlyProduct = yearlyProducts.find(p => 
    p.name.toLowerCase().includes(planType.toLowerCase())
  );
  
  if (!monthlyProduct || !yearlyProduct) return 0;
  
  // Extract numeric values from price strings
  const monthlyPrice = parseFloat(monthlyProduct.price.replace(/[^0-9.]/g, ''));
  const yearlyPrice = parseFloat(yearlyProduct.price.replace(/[^0-9.]/g, ''));
  
  const monthlyCost = monthlyPrice * 12;
  const savings = monthlyCost - yearlyPrice;
  
  return Math.round((savings / monthlyCost) * 100);
};