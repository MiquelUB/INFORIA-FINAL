-- Create support tables for Help Center functionality
-- These tables are public and don't need RLS since content is available to all users

-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER DEFAULT 0, -- For ordering within category
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tutorials table
CREATE TABLE IF NOT EXISTS public.tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT, -- Optional thumbnail image
    category TEXT NOT NULL,
    duration_minutes INTEGER, -- Video duration in minutes
    order_index INTEGER DEFAULT 0, -- For ordering within category
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_order_index ON public.faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON public.faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON public.tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_order_index ON public.tutorials(order_index);
CREATE INDEX IF NOT EXISTS idx_tutorials_active ON public.tutorials(is_active);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_support_updated_at();

CREATE TRIGGER update_tutorials_updated_at
    BEFORE UPDATE ON public.tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_support_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.faqs IS 'Frequently Asked Questions for the Help Center';
COMMENT ON COLUMN public.faqs.question IS 'The question asked by users';
COMMENT ON COLUMN public.faqs.answer IS 'The answer to the question (supports Markdown)';
COMMENT ON COLUMN public.faqs.category IS 'Category for grouping FAQs (e.g., "Facturación", "Informes", "Pacientes")';
COMMENT ON COLUMN public.faqs.order_index IS 'Order within the category for display';

COMMENT ON TABLE public.tutorials IS 'Video tutorials for the Help Center';
COMMENT ON COLUMN public.tutorials.title IS 'Title of the tutorial';
COMMENT ON COLUMN public.tutorials.description IS 'Description of the tutorial content';
COMMENT ON COLUMN public.tutorials.video_url IS 'URL to the video (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN public.tutorials.thumbnail_url IS 'Optional thumbnail image URL';
COMMENT ON COLUMN public.tutorials.category IS 'Category for grouping tutorials';
COMMENT ON COLUMN public.tutorials.duration_minutes IS 'Duration of the video in minutes';

-- Insert sample FAQs data
INSERT INTO public.faqs (question, answer, category, order_index) VALUES
-- Pacientes
('¿Cómo puedo crear una nueva ficha de paciente?', 
'Para crear una nueva ficha de paciente:\n\n1. Ve a la sección "Pacientes" en el menú principal\n2. Haz clic en "Crear Ficha de Paciente"\n3. Completa todos los campos requeridos\n4. Haz clic en "Guardar"\n\nLa ficha se creará automáticamente y podrás acceder a ella desde la lista de pacientes.', 
'Pacientes', 1),

('¿Puedo editar la información de un paciente después de crearla?', 
'Sí, puedes editar la información de un paciente en cualquier momento:\n\n1. Ve a la lista de pacientes\n2. Haz clic en el nombre del paciente\n3. En la ficha detallada, haz clic en "Editar"\n4. Modifica los campos necesarios\n5. Guarda los cambios\n\nTodos los cambios se guardan automáticamente.', 
'Pacientes', 2),

('¿Cómo puedo buscar un paciente específico?', 
'Puedes buscar pacientes de varias formas:\n\n- **Búsqueda universal**: Usa la barra de búsqueda en el header\n- **Lista de pacientes**: Ve a la sección "Pacientes"\n- **Filtros**: Usa los filtros por nombre, email o estado\n\nLa búsqueda es instantánea y te mostrará resultados en tiempo real.', 
'Pacientes', 3),

-- Informes
('¿Cómo genero un informe con IA?', 
'Para generar un informe con IA:\n\n1. Ve a "Sesión de Trabajo"\n2. Graba la sesión o introduce notas manualmente\n3. Haz clic en "Generar Informe con IA"\n4. Revisa el informe generado\n5. Haz clic en "Guardar Informe"\n\nEl informe se guardará en Google Drive y quedará vinculado al paciente.', 
'Informes', 1),

('¿Dónde se guardan los informes generados?', 
'Los informes se guardan siguiendo el principio de "Zero-Knowledge":\n\n- **Contenido**: Se guarda en tu Google Drive personal\n- **Metadatos**: Se almacenan en INFORIA (título, fecha, paciente)\n- **Acceso**: Solo tú puedes acceder a los informes\n\nPara abrir un informe, haz clic en el enlace en la ficha del paciente.', 
'Informes', 2),

('¿Puedo editar un informe después de generarlo?', 
'Los informes generados por IA se guardan como documentos de Google Drive:\n\n- **Edición**: Puedes editar directamente en Google Docs\n- **Versiones**: Google Drive mantiene un historial de versiones\n- **Compartir**: Puedes compartir con otros profesionales si es necesario\n\nLos cambios se sincronizan automáticamente.', 
'Informes', 3),

-- Calendario
('¿Cómo programo una nueva cita?', 
'Para programar una nueva cita:\n\n1. Ve a la sección "Calendario"\n2. Haz clic en un espacio vacío en el calendario\n3. Selecciona el paciente\n4. Completa los detalles de la cita\n5. Haz clic en "Crear Cita"\n\nLa cita aparecerá inmediatamente en tu calendario.', 
'Calendario', 1),

('¿Puedo cambiar la fecha de una cita?', 
'Sí, puedes modificar las citas:\n\n1. Ve al calendario\n2. Haz clic en la cita que quieres modificar\n3. Selecciona "Editar"\n4. Cambia la fecha, hora o detalles\n5. Guarda los cambios\n\nTambién puedes cancelar citas desde el mismo menú.', 
'Calendario', 2),

('¿Cómo veo las citas de un paciente específico?', 
'Para ver las citas de un paciente:\n\n1. Ve a la ficha del paciente\n2. En la sección "Historial", verás todas las citas\n3. Haz clic en "Ver en Calendario" para ir al calendario\n4. Usa los filtros para ver solo las citas de ese paciente\n\nTambién puedes usar la búsqueda universal.', 
'Calendario', 3),

-- Búsqueda
('¿Cómo funciona la búsqueda universal?', 
'La búsqueda universal te permite encontrar cualquier elemento:\n\n- **Pacientes**: Busca por nombre o email\n- **Informes**: Busca por título del informe\n- **Citas**: Busca por título o descripción\n\nLos resultados se muestran organizados por tipo y relevancia.', 
'Búsqueda', 1),

('¿Puedo filtrar los resultados de búsqueda?', 
'Actualmente la búsqueda muestra todos los tipos de resultados juntos:\n\n- Los resultados se ordenan por relevancia\n- Cada resultado muestra su tipo (Paciente, Informe, Cita)\n- Haz clic en cualquier resultado para acceder directamente\n\nPróximamente añadiremos filtros por tipo.', 
'Búsqueda', 2),

-- Facturación
('¿Cómo funciona la facturación en INFORIA?', 
'INFORIA es una plataforma de gestión clínica:\n\n- **No incluye facturación**: Nos enfocamos en la gestión de pacientes y sesiones\n- **Integración**: Puedes exportar datos para tu sistema de facturación\n- **Reportes**: Genera informes para justificar sesiones\n\nContacta con soporte para más información.', 
'Facturación', 1),

('¿Puedo exportar mis datos para facturación?', 
'Sí, puedes exportar tus datos:\n\n- **Informes**: Descarga informes individuales\n- **Datos de pacientes**: Exporta información básica\n- **Historial de sesiones**: Obtén listados de citas\n\nLos datos se exportan en formato estándar para integración.', 
'Facturación', 2),

-- Seguridad
('¿Cómo protege INFORIA mis datos?', 
'INFORIA implementa múltiples capas de seguridad:\n\n- **Zero-Knowledge**: Los informes se guardan en tu Google Drive\n- **Encriptación**: Todos los datos están encriptados\n- **RLS**: Row Level Security en la base de datos\n- **Autenticación**: Google OAuth para acceso seguro\n\nSolo tú puedes acceder a tus datos.', 
'Seguridad', 1),

('¿Puedo compartir mis datos con otros profesionales?', 
'Sí, puedes compartir de forma segura:\n\n- **Informes**: Compártelos desde Google Drive\n- **Pacientes**: Genera reportes para otros profesionales\n- **Sesiones**: Exporta datos de sesiones específicas\n\nMantienes control total sobre qué compartir.', 
'Seguridad', 2);

-- Insert sample tutorials data
INSERT INTO public.tutorials (title, description, video_url, category, duration_minutes, order_index) VALUES
-- Primeros Pasos
('Bienvenida a INFORIA', 
'Conoce las características principales de INFORIA y cómo navegar por la plataforma. Aprende a usar el dashboard principal y las herramientas básicas.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Primeros Pasos', 5, 1),

('Crear tu primera ficha de paciente', 
'Tutorial paso a paso para crear tu primera ficha de paciente. Aprende a completar todos los campos y organizar la información clínica.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Primeros Pasos', 8, 2),

('Navegar por el calendario', 
'Aprende a usar el calendario de citas: programar citas, ver diferentes vistas y gestionar tu agenda de trabajo.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Primeros Pasos', 6, 3),

-- Informes
('Generar informes con IA', 
'Tutorial completo sobre cómo generar informes usando la inteligencia artificial. Desde la grabación hasta el guardado final.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Informes', 12, 1),

('Guardar y gestionar informes', 
'Aprende a guardar informes en Google Drive, organizarlos y acceder a ellos desde cualquier lugar.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Informes', 7, 2),

('Editar informes en Google Drive', 
'Descubre cómo editar y personalizar los informes generados directamente en Google Docs.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Informes', 9, 3),

-- Pacientes
('Gestión avanzada de pacientes', 
'Técnicas avanzadas para gestionar tu lista de pacientes: búsqueda, filtros, organización y seguimiento.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Pacientes', 10, 1),

('Historial clínico completo', 
'Aprende a mantener un historial clínico completo: citas, informes, notas y seguimiento del progreso.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Pacientes', 11, 2),

('Búsqueda y organización', 
'Domina las herramientas de búsqueda universal y organización de pacientes para encontrar información rápidamente.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Pacientes', 8, 3),

-- Calendario
('Configurar tu agenda', 
'Configura tu calendario personalizado: horarios de trabajo, tipos de citas y preferencias de programación.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Calendario', 9, 1),

('Gestionar citas y recordatorios', 
'Aprende a gestionar citas, cambiar horarios, cancelar y configurar recordatorios automáticos.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Calendario', 7, 2),

('Vistas del calendario', 
'Descubre las diferentes vistas del calendario: día, semana, mes y agenda para optimizar tu gestión del tiempo.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Calendario', 6, 3),

-- Funciones Avanzadas
('Búsqueda universal', 
'Domina la búsqueda universal para encontrar rápidamente pacientes, informes y citas desde una sola barra.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Funciones Avanzadas', 8, 1),

('Integración con Google Drive', 
'Aprende a configurar y usar la integración con Google Drive para el almacenamiento seguro de informes.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Funciones Avanzadas', 10, 2),

('Exportar y respaldar datos', 
'Tutorial sobre cómo exportar tus datos, crear respaldos y mantener la seguridad de tu información.',
'https://www.youtube.com/embed/dQw4w9WgXcQ',
'Funciones Avanzadas', 12, 3); 