import { useEffect, useRef } from 'react';

/**
 * Hook pour déboguer les re-rendus et identifier les boucles infinies
 */
export const useDebugRenders = (componentName: string) => {
  const renderCount = useRef(0);
  const lastProps = useRef<any>({});
  const lastDeps = useRef<any[]>([]);

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    
    console.log(`🔄 ${componentName} render #${renderCount.current}`);
    
    // Si plus de 5 rendus en moins de 500ms, c'est suspect
    if (renderCount.current > 5) {
      console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times - possible infinite loop`);
    }
  });

  return {
    renderCount: renderCount.current,
    logRender: (props?: any, deps?: any[]) => {
      console.log(`🔄 ${componentName} render #${renderCount.current}`, { props, deps });
    }
  };
};

export default useDebugRenders;
