// Session Parser Library
// Funcions per processar i validar sessions

import { GoogleUser } from '@/services/googleAuth';

export interface SessionData {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // en minuts
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ParsedSession {
  id: string;
  user: GoogleUser;
  duration: number;
  status: SessionData['status'];
  formattedDuration: string;
  isActive: boolean;
  startTimeFormatted: string;
  endTimeFormatted?: string;
}

/**
 * Parseja les dades de sessió i les converteix a un format estandarditzat
 */
export const parseSessionData = (
  sessionData: SessionData,
  user: GoogleUser
): ParsedSession => {
  const duration = sessionData.duration || 
    (sessionData.endTime 
      ? Math.round((sessionData.endTime.getTime() - sessionData.startTime.getTime()) / (1000 * 60))
      : 0);

  const formattedDuration = formatDuration(duration);
  const startTimeFormatted = formatDateTime(sessionData.startTime);
  const endTimeFormatted = sessionData.endTime ? formatDateTime(sessionData.endTime) : undefined;

  return {
    id: sessionData.id,
    user,
    duration,
    status: sessionData.status,
    formattedDuration,
    isActive: sessionData.status === 'active',
    startTimeFormatted,
    endTimeFormatted
  };
};

/**
 * Valida les dades de sessió
 */
export const validateSessionData = (sessionData: Partial<SessionData>): boolean => {
  if (!sessionData.id || !sessionData.userId || !sessionData.startTime) {
    return false;
  }

  if (sessionData.endTime && sessionData.startTime > sessionData.endTime) {
    return false;
  }

  if (sessionData.duration && sessionData.duration < 0) {
    return false;
  }

  return true;
};

/**
 * Formata la durada en format llegible
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formata una data en format llegible
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ca-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Calcula la durada d'una sessió
 */
export const calculateSessionDuration = (startTime: Date, endTime?: Date): number => {
  if (!endTime) {
    return 0;
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  return Math.round(durationMs / (1000 * 60)); // Convertir a minuts
};

/**
 * Comprova si una sessió està activa
 */
export const isSessionActive = (sessionData: SessionData): boolean => {
  return sessionData.status === 'active' && !sessionData.endTime;
};

/**
 * Obté el temps restant d'una sessió activa
 */
export const getRemainingTime = (sessionData: SessionData): number | null => {
  if (!isSessionActive(sessionData)) {
    return null;
  }

  const now = new Date();
  const elapsed = now.getTime() - sessionData.startTime.getTime();
  const remaining = (sessionData.duration || 60) * 60 * 1000 - elapsed; // 60 min per defecte

  return Math.max(0, Math.round(remaining / (1000 * 60)));
}; 