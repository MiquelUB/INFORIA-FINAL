// Session Management Hook
// Exposa l'estat d'autenticació i gestió de sessions

import { useState, useEffect } from 'react';
import { GoogleUser, AuthState } from '@/services/googleAuth';

export interface Session {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

export interface UseSessionReturn {
  session: Session;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook per gestionar l'estat de la sessió d'usuari
 */
export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<Session>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastActivity: null
  });

  /**
   * Inicia sessió amb Google
   */
  const signIn = async (): Promise<void> => {
    try {
      setSession(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Implementar inici de sessió amb Google
      console.log('Iniciant sessió...');
      
      // Placeholder implementation
      const mockUser: GoogleUser = {
        id: 'user_123',
        email: 'usuari@exemple.com',
        name: 'Dr. Usuari',
        picture: 'https://example.com/avatar.jpg',
        accessToken: 'mock_token_123'
      };

      setSession({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: new Date()
      });
    } catch (error) {
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconegut'
      }));
    }
  };

  /**
   * Tanca la sessió actual
   */
  const signOut = async (): Promise<void> => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));
      
      // TODO: Implementar tancament de sessió
      console.log('Tancant sessió...');
      
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null
      });
    } catch (error) {
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al tancar sessió'
      }));
    }
  };

  /**
   * Actualitza l'estat de la sessió
   */
  const refreshSession = async (): Promise<void> => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));
      
      // TODO: Implementar actualització de sessió
      console.log('Actualitzant sessió...');
      
      // Placeholder implementation
      setSession(prev => ({
        ...prev,
        isLoading: false,
        lastActivity: new Date()
      }));
    } catch (error) {
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualitzar sessió'
      }));
    }
  };

  /**
   * Neteja els errors de la sessió
   */
  const clearError = (): void => {
    setSession(prev => ({ ...prev, error: null }));
  };

  // Inicialitzar sessió al muntar el component
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // TODO: Implementar inicialització de sessió
        console.log('Inicialitzant sessió...');
        
        // Placeholder: simular càrrega inicial
        setTimeout(() => {
          setSession(prev => ({ ...prev, isLoading: false }));
        }, 1000);
      } catch (error) {
        setSession(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error d\'inicialització'
        }));
      }
    };

    initializeSession();
  }, []);

  return {
    session,
    signIn,
    signOut,
    refreshSession,
    clearError
  };
}; 