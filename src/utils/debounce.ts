/**
 * Utilitaire de debouncing pour éviter les appels multiples
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Hook pour créer une fonction debounced
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  const debouncedFunc = debounce(func, delay);
  return debouncedFunc;
};

export default debounce;
