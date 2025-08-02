// src/services/reportApi.ts

import { supabase } from '@/integrations/supabase/client';

/**
 * Llama a la Edge Function 'informe-inteligente' para generar un nuevo informe.
 * Esta función centraliza la lógica de la API, el manejo de la autenticación y los errores.
 *
 * @param transcription La transcripción de la sesión (opcional).
 * @param sessionNotes Las notas de texto del terapeuta.
 * @returns El objeto de respuesta de la función, que contiene el informe generado.
 * @throws Lanza un error si el usuario no está autenticado o si la llamada a la API falla.
 */
export async function generateIntelligentReport(
  transcription?: string,
  sessionNotes: string = ""
) {
  // 1. Asegurarse de que el usuario tiene una sesión activa.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // 2. Construir el FormData para enviar a la función.
  const formData = new FormData();
  if (transcription) {
    formData.append("transcription", transcription);
  }
  formData.append("sessionNotes", sessionNotes);

  // 3. Invocar la Edge Function de Supabase.
  const { data, error } = await supabase.functions.invoke('informe-inteligente', {
    body: formData,
  });

  // 4. Manejar posibles errores de la llamada.
  if (error) {
    throw new Error(`Error al generar el informe: ${error.message}`);
  }

  // 5. Devolver los datos si la llamada fue exitosa.
  return data;
}

/**
 * Guarda un informe en Google Drive del usuario (Zero-Knowledge principle).
 * Esta función llama a la Edge Function 'save-report' que crea un Google Doc
 * con nomenclatura estandarizada y solo almacena metadatos en nuestra base de datos.
 * Incluye verificación de límites de suscripción.
 *
 * @param patientId El ID del paciente (UUID).
 * @param reportContent El contenido del informe en formato Markdown.
 * @param sessionType El tipo de sesión (ej. "Primera Visita", "Seguimiento", "Alta").
 * @returns El objeto de respuesta con el ID del informe guardado y la URL de Google Drive.
 * @throws Lanza un error si el usuario no está autenticado, no tiene Google conectado, o si la llamada a la API falla.
 */
export async function saveReport(
  patientId: string,
  reportContent: string,
  sessionType: string
) {
  // 1. Asegurarse de que el usuario tiene una sesión activa.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // 2. Validar los parámetros de entrada.
  if (!patientId || typeof patientId !== 'string') {
    throw new Error("patientId es requerido y debe ser una cadena válida.");
  }

  if (!reportContent || typeof reportContent !== 'string' || reportContent.trim() === '') {
    throw new Error("reportContent es requerido y debe ser una cadena no vacía.");
  }

  if (!sessionType || typeof sessionType !== 'string' || sessionType.trim() === '') {
    throw new Error("sessionType es requerido y debe ser una cadena no vacía.");
  }

  // 3. Validar formato UUID para patientId.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(patientId)) {
    throw new Error("patientId debe ser un UUID válido.");
  }

  // 4. Verificar que el usuario tiene Google OAuth conectado.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No se pudo obtener información del usuario.");
  }

  // 5. Invocar la Edge Function de Supabase con el nuevo parámetro session_type.
  const { data, error } = await supabase.functions.invoke('save-report', {
    body: {
      patient_id: patientId,
      report_content: reportContent.trim(),
      session_type: sessionType.trim()
    },
  });

  // 6. Manejar posibles errores de la llamada.
  if (error) {
    // Manejar errores específicos de límites de suscripción
    if (error.message.includes("Report limit reached")) {
      throw new Error("Has alcanzado el límite de informes de tu plan. Por favor, renueva tu suscripción para continuar.");
    }
    if (error.message.includes("Subscription not active")) {
      throw new Error("Tu suscripción no está activa. Por favor, renueva tu plan para continuar.");
    }
    if (error.message.includes("Subscription not found")) {
      throw new Error("No se encontró tu suscripción. Por favor, contacta con soporte.");
    }
    
    // Manejar errores específicos de Google OAuth
    if (error.message.includes("Google Drive integration not connected")) {
      throw new Error("Debe conectar su cuenta de Google para guardar informes. Por favor, inicie sesión con Google.");
    }
    if (error.message.includes("Google access token not available")) {
      throw new Error("Su sesión de Google ha expirado. Por favor, inicie sesión nuevamente con Google.");
    }
    if (error.message.includes("El paciente especificado no existe")) {
      throw new Error("El paciente especificado no existe o no tiene acceso a él.");
    }
    throw new Error(`Error al guardar el informe: ${error.message}`);
  }

  // 7. Verificar que la respuesta contiene los datos esperados.
  if (!data || !data.success) {
    throw new Error("Respuesta inesperada del servidor al guardar el informe.");
  }

  // 8. Devolver los datos si la llamada fue exitosa.
  return data;
}
