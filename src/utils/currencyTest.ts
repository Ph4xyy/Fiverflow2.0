// Test file for currency system functionality
import { formatMoney, formatMoneyDefault } from './format';

// Test currency formatting
export const testCurrencySystem = () => {
  console.log('Testing Currency System...');
  
  // Test basic formatting
  console.log('USD:', formatMoney(1234.56, 'USD'));
  console.log('EUR:', formatMoney(1234.56, 'EUR'));
  console.log('GBP:', formatMoney(1234.56, 'GBP'));
  console.log('CAD:', formatMoney(1234.56, 'CAD'));
  
  // Test with user currency
  console.log('Default USD:', formatMoneyDefault(1234.56, 'USD'));
  console.log('Default EUR:', formatMoneyDefault(1234.56, 'EUR'));
  
  // Test null/undefined
  console.log('Null amount:', formatMoney(null));
  console.log('Undefined amount:', formatMoney(undefined));
  
  console.log('Currency system test completed!');
};

// Export for use in components
export default testCurrencySystem;
