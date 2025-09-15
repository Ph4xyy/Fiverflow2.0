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
    id: 'prod_SjvBsfm6N3XXlv',
    priceId: 'price_1RoRLDENcVsHr4WI6TViAPNb',
    name: 'Pro Package',
    description: 'Get access to all the Pro features !',
    mode: 'subscription',
    price: '$22.00',
    currency: 'USD',
    interval: 'month'
  },
  {
    id: 'prod_SjvDz5X0EbxdqP',
    priceId: 'price_1RoRMdENcVsHr4WIVRYCy8JL',
    name: 'Excellence Package',
    description: 'Get access to all the Excellence features !',
    mode: 'subscription',
    price: '$39.00',
    currency: 'USD',
    interval: 'month'
  },
  {
    id: 'prod_Sk1RNcZJIlp0Ig',
    priceId: 'price_1RoXOgENcVsHr4WIitiOEaaz',
    name: '1y pro package',
    description: 'get access to all the features from the Pro package but for 1 year !',
    mode: 'subscription',
    price: 'C$216.00',
    currency: 'CAD',
    interval: 'year'
  },
  {
    id: 'prod_Sk1QhNRnzlZqjC',
    priceId: 'price_1RoXNwENcVsHr4WI3SP8AYYu',
    name: '1y Excellence Package',
    description: 'get access to all the features from the Excellence package but for 1 year !',
    mode: 'subscription',
    price: '$396.00',
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