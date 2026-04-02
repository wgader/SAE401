import { useState, useEffect } from 'react';

/**
 * Hook pour retarder la mise à jour d'une valeur.
 * Utile pour limiter le nombre d'appels API lors d'une saisie.
 * 
 * @param value La valeur à debouncer
 * @param delay Le délai en millisecondes
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // On définit un timer pour mettre à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // On nettoie le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
