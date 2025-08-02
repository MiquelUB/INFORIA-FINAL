// src/services/appointmentApi.ts

import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  appointment_type: 'session' | 'consultation' | 'follow_up' | 'initial_assessment';
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  appointment_type?: 'session' | 'consultation' | 'follow_up' | 'initial_assessment';
  location?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  appointment_type?: 'session' | 'consultation' | 'follow_up' | 'initial_assessment';
  location?: string;
  notes?: string;
}

/**
 * Obtiene todas las citas del usuario autenticado
 * @returns Array de citas del usuario
 * @throws Error si el usuario no está autenticado o si hay un error en la consulta
 */
export async function getAppointments(): Promise<Appointment[]> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Consultar citas del usuario
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', session.user.id)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw new Error(`Error al obtener las citas: ${error.message}`);
  }

  return appointments || [];
}

/**
 * Obtiene las citas de un rango de fechas específico
 * @param startDate Fecha de inicio del rango
 * @param endDate Fecha de fin del rango
 * @returns Array de citas en el rango especificado
 */
export async function getAppointmentsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Formatear fechas para la consulta
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  // Consultar citas en el rango de fechas
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('start_time', startISO)
    .lte('end_time', endISO)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments by date range:', error);
    throw new Error(`Error al obtener las citas: ${error.message}`);
  }

  return appointments || [];
}

/**
 * Crea una nueva cita
 * @param appointmentData Datos de la cita a crear
 * @returns La cita creada
 */
export async function createAppointment(
  appointmentData: CreateAppointmentData
): Promise<Appointment> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Validar datos requeridos
  if (!appointmentData.patient_id) {
    throw new Error("El ID del paciente es requerido.");
  }
  if (!appointmentData.title || appointmentData.title.trim() === '') {
    throw new Error("El título de la cita es requerido.");
  }
  if (!appointmentData.start_time) {
    throw new Error("La fecha y hora de inicio es requerida.");
  }
  if (!appointmentData.end_time) {
    throw new Error("La fecha y hora de fin es requerida.");
  }

  // Validar que la fecha de fin sea posterior a la de inicio
  const startTime = new Date(appointmentData.start_time);
  const endTime = new Date(appointmentData.end_time);
  if (endTime <= startTime) {
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");
  }

  // Crear la cita
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      user_id: session.user.id,
      patient_id: appointmentData.patient_id,
      title: appointmentData.title.trim(),
      description: appointmentData.description?.trim(),
      start_time: appointmentData.start_time,
      end_time: appointmentData.end_time,
      appointment_type: appointmentData.appointment_type || 'session',
      location: appointmentData.location?.trim(),
      notes: appointmentData.notes?.trim(),
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw new Error(`Error al crear la cita: ${error.message}`);
  }

  return appointment;
}

/**
 * Actualiza una cita existente
 * @param appointmentId ID de la cita a actualizar
 * @param updateData Datos a actualizar
 * @returns La cita actualizada
 */
export async function updateAppointment(
  appointmentId: string,
  updateData: UpdateAppointmentData
): Promise<Appointment> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Validar que la cita pertenece al usuario
  const { data: existingAppointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('user_id', session.user.id)
    .single();

  if (fetchError || !existingAppointment) {
    throw new Error("Cita no encontrada o no tienes permisos para modificarla.");
  }

  // Validar fechas si se están actualizando
  if (updateData.start_time && updateData.end_time) {
    const startTime = new Date(updateData.start_time);
    const endTime = new Date(updateData.end_time);
    if (endTime <= startTime) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }

  // Actualizar la cita
  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    throw new Error(`Error al actualizar la cita: ${error.message}`);
  }

  return appointment;
}

/**
 * Elimina una cita
 * @param appointmentId ID de la cita a eliminar
 * @returns true si se eliminó correctamente
 */
export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Eliminar la cita
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting appointment:', error);
    throw new Error(`Error al eliminar la cita: ${error.message}`);
  }

  return true;
}

/**
 * Obtiene una cita específica por ID
 * @param appointmentId ID de la cita
 * @returns La cita encontrada
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Obtener la cita
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching appointment:', error);
    throw new Error(`Error al obtener la cita: ${error.message}`);
  }

  if (!appointment) {
    throw new Error("Cita no encontrada.");
  }

  return appointment;
}

/**
 * Cambia el estado de una cita
 * @param appointmentId ID de la cita
 * @param status Nuevo estado
 * @returns La cita actualizada
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
): Promise<Appointment> {
  return updateAppointment(appointmentId, { status });
} 