// src/services/searchApi.ts

import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'patient' | 'report' | 'appointment';
  title: string;
  subtitle: string;
  url: string;
  created_at: string;
  relevance_score: number;
  search_highlights?: string;
}

export interface SearchOptions {
  minLength?: number;
  maxResults?: number;
  useAdvanced?: boolean;
}

/**
 * Realiza una búsqueda universal en pacientes, informes y citas
 * @param searchTerm Término de búsqueda
 * @param options Opciones de búsqueda
 * @returns Array de resultados de búsqueda
 * @throws Error si el usuario no está autenticado o si hay un error en la búsqueda
 */
export async function universalSearch(
  searchTerm: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // Validar término de búsqueda
  const { minLength = 2 } = options;
  if (!searchTerm || searchTerm.trim().length < minLength) {
    return [];
  }

  const trimmedSearchTerm = searchTerm.trim();

  try {
    // Llamar a la función RPC de búsqueda
    const { data: results, error } = await supabase.rpc(
      options.useAdvanced ? 'search_all_advanced' : 'search_all',
      {
        search_term: trimmedSearchTerm
      }
    );

    if (error) {
      console.error('Error in universal search:', error);
      throw new Error(`Error en la búsqueda: ${error.message}`);
    }

    // Limitar resultados si se especifica
    const { maxResults = 20 } = options;
    const limitedResults = results?.slice(0, maxResults) || [];

    return limitedResults;
  } catch (error) {
    console.error('Error calling search function:', error);
    throw new Error('No se pudo realizar la búsqueda. Inténtelo de nuevo.');
  }
}

/**
 * Realiza una búsqueda con debounce para optimizar las llamadas a la API
 * @param searchTerm Término de búsqueda
 * @param delay Tiempo de espera en milisegundos
 * @param options Opciones de búsqueda
 * @returns Promise con los resultados de búsqueda
 */
export function debouncedSearch(
  searchTerm: string,
  delay: number = 300,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(async () => {
      try {
        const results = await universalSearch(searchTerm, options);
        resolve(results);
      } catch (error) {
        reject(error);
      }
    }, delay);

    // Cleanup function
    return () => clearTimeout(timeoutId);
  });
}

/**
 * Obtiene sugerencias de búsqueda basadas en el historial reciente
 * @returns Array de sugerencias populares
 */
export function getSearchSuggestions(): string[] {
  return [
    "María García",
    "Sesión de seguimiento",
    "Evaluación inicial",
    "Informe de sesión",
    "Terapia cognitiva",
    "Mindfulness",
    "EMDR",
    "Ansiedad",
    "Depresión"
  ];
}

/**
 * Formatea un resultado de búsqueda para mostrar en la UI
 * @param result Resultado de búsqueda
 * @returns Objeto formateado para la UI
 */
export function formatSearchResult(result: SearchResult) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return '👤';
      case 'report':
        return '📄';
      case 'appointment':
        return '📅';
      default:
        return '🔍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'patient':
        return 'Paciente';
      case 'report':
        return 'Informe';
      case 'appointment':
        return 'Cita';
      default:
        return 'Resultado';
    }
  };

  return {
    ...result,
    icon: getIcon(result.type),
    typeLabel: getTypeLabel(result.type),
    formattedDate: new Date(result.created_at).toLocaleDateString('es-ES')
  };
}

/**
 * Filtra resultados por tipo
 * @param results Array de resultados
 * @param type Tipo a filtrar
 * @returns Array filtrado
 */
export function filterResultsByType(
  results: SearchResult[],
  type: 'patient' | 'report' | 'appointment'
): SearchResult[] {
  return results.filter(result => result.type === type);
}

/**
 * Agrupa resultados por tipo
 * @param results Array de resultados
 * @returns Objeto con resultados agrupados
 */
export function groupResultsByType(results: SearchResult[]) {
  return results.reduce((groups, result) => {
    if (!groups[result.type]) {
      groups[result.type] = [];
    }
    groups[result.type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);
} 