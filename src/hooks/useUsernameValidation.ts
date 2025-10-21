import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profileService';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface UseUsernameValidationOptions {
  debounceMs?: number;
  currentUserId?: string;
}

export function useUsernameValidation(
  username: string,
  options: UseUsernameValidationOptions = {}
) {
  const { debounceMs = 500, currentUserId } = options;
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [isChecking, setIsChecking] = useState(false);

  const validateUsername = useCallback(async (value: string) => {
    if (!value || value.trim() === '') {
      setStatus('idle');
      return;
    }

    // Validation côté client
    if (!ProfileService.validateUsername(value)) {
      setStatus('invalid');
      return;
    }

    setIsChecking(true);
    setStatus('checking');

    try {
      const isAvailable = await ProfileService.checkUsernameAvailability(value, currentUserId);
      setStatus(isAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('Erreur lors de la vérification du username:', error);
      setStatus('taken'); // Par défaut, considérer comme pris en cas d'erreur
    } finally {
      setIsChecking(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateUsername(username);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [username, validateUsername, debounceMs]);

  return {
    status,
    isChecking,
    isValid: status === 'available',
    isInvalid: status === 'invalid',
    isTaken: status === 'taken',
    isAvailable: status === 'available'
  };
}