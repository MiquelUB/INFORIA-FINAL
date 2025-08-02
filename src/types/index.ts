// Global Types
// Tipus globals per a l'aplicació: usuari, sessió, informe

import { GoogleUser } from '@/services/googleAuth';
import { GeneratedReport } from '@/services/reportGenerator';

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'admin' | 'assistant';
  specialization?: string;
  license?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'es' | 'en' | 'ca';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  reportFormat: 'detailed' | 'summary' | 'professional';
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en minuts
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no-show';
  type: 'initial' | 'follow-up' | 'emergency' | 'group';
  notes?: string;
  objectives?: string[];
  observations?: string;
  recommendations?: string[];
  nextSession?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionSummary {
  id: string;
  patientName: string;
  date: Date;
  duration: number;
  status: Session['status'];
  type: Session['type'];
  hasReport: boolean;
}

// ============================================================================
// PATIENT TYPES
// ============================================================================

export interface Patient {
  id: string;
  userId: string; // ID del terapeuta
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  medicalHistory?: string;
  currentMedications?: string[];
  allergies?: string[];
  diagnosis?: string[];
  treatmentPlan?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'discharged';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report extends GeneratedReport {
  sessionId: string;
  patientId: string;
  therapistId: string;
  sessionDate: Date;
  content: string;
  summary: string;
  recommendations: string[];
  diagnosis?: string[];
  treatmentPlan?: string;
  nextSteps?: string[];
  attachments?: ReportAttachment[];
  status: 'draft' | 'final' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAttachment {
  id: string;
  reportId: string;
  filename: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video';
  size: number;
  uploadedAt: Date;
}

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  date: Date;
  duration: number; // en minuts
  type: 'initial' | 'follow-up' | 'emergency' | 'group';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  location?: 'office' | 'online' | 'home';
  meetingUrl?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'report' | 'patient' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export interface FilterOption {
  field: string;
  value: string | number | boolean | Date;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
} 