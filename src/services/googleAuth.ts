// Google Authentication Service
// Gestiona l'autenticació amb Google OAuth

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
}

export interface AuthState {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Inicialitza l'autenticació amb Google
 */
export const initializeGoogleAuth = async (): Promise<void> => {
  // TODO: Implementar inicialització de Google OAuth
  console.log('Inicialitzant autenticació amb Google...');
};

/**
 * Inicia el procés d'inici de sessió amb Google
 */
export const signInWithGoogle = async (): Promise<GoogleUser> => {
  // TODO: Implementar inici de sessió amb Google
  throw new Error('Funció no implementada');
};

/**
 * Tanca la sessió actual
 */
export const signOut = async (): Promise<void> => {
  // TODO: Implementar tancament de sessió
  console.log('Tancant sessió...');
};

/**
 * Obté l'usuari actual
 */
export const getCurrentUser = (): GoogleUser | null => {
  // TODO: Implementar obtenció d'usuari actual
  return null;
};

/**
 * Verifica si l'usuari està autenticat
 */
export const isUserAuthenticated = (): boolean => {
  // TODO: Implementar verificació d'autenticació
  return false;
}; 