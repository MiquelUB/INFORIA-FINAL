// src/services/subscriptionApi.ts

import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  reports_limit: number;
  reports_used: number;
  reports_remaining: number;
  current_period_start: string;
  current_period_end: string;
  is_active: boolean;
  can_create_reports: boolean;
}

export interface SubscriptionStatus {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

export interface RenewalResult {
  success: boolean;
  message?: string;
  new_period_end?: string;
  error?: string;
}

/**
 * Obtiene el estado actual de la suscripción del usuario
 * @returns Objeto con el estado de la suscripción
 * @throws Error si hay un problema con la autenticación o la consulta
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    // Verificar que el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
    }

    // Llamar a la función RPC para obtener el estado de la suscripción
    const { data, error } = await supabase.rpc('get_subscription_status');

    if (error) {
      console.error('Error getting subscription status:', error);
      throw new Error(`Error al obtener el estado de la suscripción: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'No se pudo obtener el estado de la suscripción');
    }

    return {
      success: true,
      subscription: data.subscription
    };

  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener el estado de la suscripción'
    };
  }
}

/**
 * Renueva el plan de suscripción del usuario
 * @returns Resultado de la renovación
 * @throws Error si hay un problema con la autenticación o la renovación
 */
export async function renewSubscriptionPlan(): Promise<RenewalResult> {
  try {
    // Verificar que el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
    }

    // Llamar a la función RPC para renovar la suscripción
    const { data, error } = await supabase.rpc('renew_subscription_plan');

    if (error) {
      console.error('Error renewing subscription:', error);
      throw new Error(`Error al renovar la suscripción: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'No se pudo renovar la suscripción');
    }

    return {
      success: true,
      message: data.message,
      new_period_end: data.new_period_end
    };

  } catch (error) {
    console.error('Error in renewSubscriptionPlan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al renovar la suscripción'
    };
  }
}

/**
 * Verifica si el usuario puede crear más informes
 * @returns true si puede crear informes, false en caso contrario
 */
export async function canCreateReports(): Promise<boolean> {
  try {
    const status = await getSubscriptionStatus();
    return status.success && status.subscription?.can_create_reports === true;
  } catch (error) {
    console.error('Error checking if user can create reports:', error);
    return false;
  }
}

/**
 * Obtiene el número de informes restantes del usuario
 * @returns Número de informes restantes, -1 si hay error
 */
export async function getRemainingReports(): Promise<number> {
  try {
    const status = await getSubscriptionStatus();
    if (status.success && status.subscription) {
      return status.subscription.reports_remaining;
    }
    return -1;
  } catch (error) {
    console.error('Error getting remaining reports:', error);
    return -1;
  }
}

/**
 * Obtiene información del plan actual del usuario
 * @returns Información del plan o null si hay error
 */
export async function getCurrentPlan(): Promise<{ plan_id: string; reports_limit: number; reports_used: number } | null> {
  try {
    const status = await getSubscriptionStatus();
    if (status.success && status.subscription) {
      return {
        plan_id: status.subscription.plan_id,
        reports_limit: status.subscription.reports_limit,
        reports_used: status.subscription.reports_used
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current plan:', error);
    return null;
  }
}

/**
 * Formatea el nombre del plan para mostrar en la UI
 * @param planId ID del plan
 * @returns Nombre formateado del plan
 */
export function formatPlanName(planId: string): string {
  switch (planId) {
    case 'free':
      return 'Plan Gratuito';
    case 'profesional':
      return 'Plan Profesional';
    case 'clinica':
      return 'Plan Clínica';
    case 'enterprise':
      return 'Plan Enterprise';
    default:
      return 'Plan Desconocido';
  }
}

/**
 * Obtiene el límite de informes para un plan específico
 * @param planId ID del plan
 * @returns Límite de informes del plan
 */
export function getPlanLimit(planId: string): number {
  switch (planId) {
    case 'free':
      return 10;
    case 'profesional':
      return 100;
    case 'clinica':
      return 500;
    case 'enterprise':
      return 2000;
    default:
      return 10;
  }
}

/**
 * Obtiene el precio mensual de un plan específico
 * @param planId ID del plan
 * @returns Precio mensual en euros
 */
export function getPlanPrice(planId: string): number {
  switch (planId) {
    case 'free':
      return 0;
    case 'profesional':
      return 29;
    case 'clinica':
      return 79;
    case 'enterprise':
      return 199;
    default:
      return 0;
  }
}

/**
 * Formatea el estado de la suscripción para mostrar en la UI
 * @param status Estado de la suscripción
 * @returns Estado formateado
 */
export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'canceled':
      return 'Cancelado';
    case 'limit_reached':
      return 'Límite Alcanzado';
    case 'expired':
      return 'Expirado';
    default:
      return 'Desconocido';
  }
}

/**
 * Obtiene el color del estado para mostrar en la UI
 * @param status Estado de la suscripción
 * @returns Clase CSS para el color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'canceled':
      return 'text-red-600 bg-red-100';
    case 'limit_reached':
      return 'text-orange-600 bg-orange-100';
    case 'expired':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Verifica si el usuario necesita renovar su suscripción
 * @param subscription Objeto de suscripción
 * @returns true si necesita renovar
 */
export function needsRenewal(subscription: Subscription): boolean {
  return subscription.status === 'limit_reached' || 
         subscription.status === 'expired' || 
         subscription.reports_used >= subscription.reports_limit;
}

/**
 * Obtiene el porcentaje de uso de informes
 * @param used Informes usados
 * @param limit Límite de informes
 * @returns Porcentaje de uso (0-100)
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
} 