// src/services/supportApi.ts

import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  duration_minutes?: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

export interface TutorialCategory {
  category: string;
  tutorials: Tutorial[];
}

/**
 * Obtiene todas las FAQs activas
 * @returns Array de FAQs agrupadas por categoría
 * @throws Error si hay un error en la consulta
 */
export async function getFAQs(): Promise<FAQCategory[]> {
  try {
    // Consultar FAQs activas ordenadas por categoría y orden
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      throw new Error(`Error al obtener las FAQs: ${error.message}`);
    }

    // Agrupar FAQs por categoría
    const groupedFAQs = (faqs || []).reduce((groups, faq) => {
      const category = faq.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(faq);
      return groups;
    }, {} as Record<string, FAQ[]>);

    // Convertir a array de categorías
    const categories: FAQCategory[] = Object.entries(groupedFAQs).map(([category, faqs]) => ({
      category,
      faqs
    }));

    return categories;
  } catch (error) {
    console.error('Error in getFAQs:', error);
    throw new Error('No se pudieron cargar las FAQs. Inténtelo de nuevo.');
  }
}

/**
 * Obtiene todas las FAQs de una categoría específica
 * @param category Categoría a filtrar
 * @returns Array de FAQs de la categoría
 */
export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs by category:', error);
      throw new Error(`Error al obtener las FAQs: ${error.message}`);
    }

    return faqs || [];
  } catch (error) {
    console.error('Error in getFAQsByCategory:', error);
    throw new Error('No se pudieron cargar las FAQs de esta categoría.');
  }
}

/**
 * Busca FAQs por término de búsqueda
 * @param searchTerm Término de búsqueda
 * @returns Array de FAQs que coinciden con la búsqueda
 */
export async function searchFAQs(searchTerm: string): Promise<FAQ[]> {
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error searching FAQs:', error);
      throw new Error(`Error al buscar FAQs: ${error.message}`);
    }

    return faqs || [];
  } catch (error) {
    console.error('Error in searchFAQs:', error);
    throw new Error('No se pudo realizar la búsqueda en las FAQs.');
  }
}

/**
 * Obtiene todos los tutoriales activos
 * @returns Array de tutoriales agrupados por categoría
 * @throws Error si hay un error en la consulta
 */
export async function getTutorials(): Promise<TutorialCategory[]> {
  try {
    // Consultar tutoriales activos ordenados por categoría y orden
    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tutorials:', error);
      throw new Error(`Error al obtener los tutoriales: ${error.message}`);
    }

    // Agrupar tutoriales por categoría
    const groupedTutorials = (tutorials || []).reduce((groups, tutorial) => {
      const category = tutorial.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(tutorial);
      return groups;
    }, {} as Record<string, Tutorial[]>);

    // Convertir a array de categorías
    const categories: TutorialCategory[] = Object.entries(groupedTutorials).map(([category, tutorials]) => ({
      category,
      tutorials
    }));

    return categories;
  } catch (error) {
    console.error('Error in getTutorials:', error);
    throw new Error('No se pudieron cargar los tutoriales. Inténtelo de nuevo.');
  }
}

/**
 * Obtiene tutoriales de una categoría específica
 * @param category Categoría a filtrar
 * @returns Array de tutoriales de la categoría
 */
export async function getTutorialsByCategory(category: string): Promise<Tutorial[]> {
  try {
    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tutorials by category:', error);
      throw new Error(`Error al obtener los tutoriales: ${error.message}`);
    }

    return tutorials || [];
  } catch (error) {
    console.error('Error in getTutorialsByCategory:', error);
    throw new Error('No se pudieron cargar los tutoriales de esta categoría.');
  }
}

/**
 * Busca tutoriales por término de búsqueda
 * @param searchTerm Término de búsqueda
 * @returns Array de tutoriales que coinciden con la búsqueda
 */
export async function searchTutorials(searchTerm: string): Promise<Tutorial[]> {
  try {
    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error searching tutorials:', error);
      throw new Error(`Error al buscar tutoriales: ${error.message}`);
    }

    return tutorials || [];
  } catch (error) {
    console.error('Error in searchTutorials:', error);
    throw new Error('No se pudo realizar la búsqueda en los tutoriales.');
  }
}

/**
 * Obtiene un tutorial específico por ID
 * @param tutorialId ID del tutorial
 * @returns Tutorial encontrado
 */
export async function getTutorialById(tutorialId: string): Promise<Tutorial> {
  try {
    const { data: tutorial, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('id', tutorialId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching tutorial by ID:', error);
      throw new Error(`Error al obtener el tutorial: ${error.message}`);
    }

    if (!tutorial) {
      throw new Error('Tutorial no encontrado.');
    }

    return tutorial;
  } catch (error) {
    console.error('Error in getTutorialById:', error);
    throw new Error('No se pudo cargar el tutorial.');
  }
}

/**
 * Obtiene las categorías disponibles de FAQs
 * @returns Array de categorías únicas
 */
export async function getFAQCategories(): Promise<string[]> {
  try {
    const { data: categories, error } = await supabase
      .from('faqs')
      .select('category')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ categories:', error);
      throw new Error(`Error al obtener las categorías: ${error.message}`);
    }

    // Extraer categorías únicas
    const uniqueCategories = [...new Set(categories?.map(faq => faq.category) || [])];
    return uniqueCategories;
  } catch (error) {
    console.error('Error in getFAQCategories:', error);
    throw new Error('No se pudieron cargar las categorías de FAQs.');
  }
}

/**
 * Obtiene las categorías disponibles de tutoriales
 * @returns Array de categorías únicas
 */
export async function getTutorialCategories(): Promise<string[]> {
  try {
    const { data: categories, error } = await supabase
      .from('tutorials')
      .select('category')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching tutorial categories:', error);
      throw new Error(`Error al obtener las categorías: ${error.message}`);
    }

    // Extraer categorías únicas
    const uniqueCategories = [...new Set(categories?.map(tutorial => tutorial.category) || [])];
    return uniqueCategories;
  } catch (error) {
    console.error('Error in getTutorialCategories:', error);
    throw new Error('No se pudieron cargar las categorías de tutoriales.');
  }
}

/**
 * Formatea la duración de un tutorial para mostrar
 * @param minutes Duración en minutos
 * @returns String formateado (ej: "5 min", "1h 30 min")
 */
export function formatDuration(minutes?: number): string {
  if (!minutes) return 'Duración no especificada';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes} min`;
}

/**
 * Extrae el ID del video de YouTube de una URL
 * @param url URL del video de YouTube
 * @returns ID del video o null si no es válida
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Convierte una URL de YouTube a URL de embed
 * @param url URL original de YouTube
 * @returns URL de embed de YouTube
 */
export function convertToEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // Retorna la URL original si no es de YouTube
} 