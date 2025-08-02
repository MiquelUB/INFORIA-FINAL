# Módulo de Soporte - INFORIA

## Descripción General
Se ha implementado el "Módulo de Soporte" para completar el MVP de INFORIA, proporcionando un centro de ayuda integrado que permite a los usuarios resolver sus dudas de forma autónoma a través de Preguntas Frecuentes (FAQs) y tutoriales en vídeo.

## Componentes Implementados

### 1. Base de Datos: Tablas de Soporte

**Archivo**: `supabase/migrations/20250725000004_create_support_tables.sql`

**Tablas creadas**:
- ✅ **`faqs`**: Preguntas frecuentes organizadas por categoría
- ✅ **`tutorials`**: Tutoriales en vídeo con metadatos

**Estructura de la tabla `faqs`**:
```sql
CREATE TABLE public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Estructura de la tabla `tutorials`**:
```sql
CREATE TABLE public.tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT NOT NULL,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Características de las tablas**:
- ✅ **Sin RLS**: Contenido público para todos los usuarios
- ✅ **Índices optimizados**: Para consultas eficientes por categoría
- ✅ **Triggers**: Actualización automática de `updated_at`
- ✅ **Datos de prueba**: 14 FAQs y 15 tutoriales de ejemplo

### 2. Servicio API: `supportApi.ts`

**Archivo**: `src/services/supportApi.ts`

**Funciones implementadas**:
- ✅ **`getFAQs()`**: Obtiene FAQs agrupadas por categoría
- ✅ **`getTutorials()`**: Obtiene tutoriales agrupados por categoría
- ✅ **`searchFAQs()`**: Búsqueda en FAQs
- ✅ **`searchTutorials()`**: Búsqueda en tutoriales
- ✅ **`getFAQCategories()`**: Categorías de FAQs
- ✅ **`getTutorialCategories()`**: Categorías de tutoriales
- ✅ **`formatDuration()`**: Formateo de duración
- ✅ **`convertToEmbedUrl()`**: Conversión de URLs de YouTube

**Interfaces TypeScript**:
```typescript
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Tutorial {
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
```

### 3. Componente Modal: `VideoPlayerModal.tsx`

**Archivo**: `src/components/VideoPlayerModal.tsx`

**Características principales**:
- ✅ **Reproductor de vídeo**: Iframe embebido para YouTube
- ✅ **Información del tutorial**: Título, descripción, duración
- ✅ **Categorización visual**: Iconos y badges por categoría
- ✅ **Acciones**: Ver en YouTube, cerrar modal
- ✅ **Responsive**: Adaptado para diferentes tamaños

### 4. Vista Principal: `HelpCenter.tsx`

**Archivo**: `pages/HelpCenter.tsx`

**Características principales**:
- ✅ **Dos pestañas**: FAQs y Tutoriales
- ✅ **Búsqueda en tiempo real**: Con debounce de 300ms
- ✅ **Acordeón para FAQs**: Organizado por categorías
- ✅ **Grid de tutoriales**: Tarjetas con información
- ✅ **Modal de vídeo**: Reproducción integrada
- ✅ **Estados de carga**: Indicadores durante operaciones
- ✅ **Responsive**: Adaptado para móviles y desktop

### 5. Rutas: Actualización de `App.tsx`

**Archivo**: `App.tsx`

**Nueva ruta añadida**:
```tsx
{/* Support Routes */}
<Route path="/help" element={<HelpCenter />} />
```

### 6. Navegación: Actualización de `NavigationHeader.tsx`

**Archivo**: `components/NavigationHeader.tsx`

**Enlace añadido**:
```tsx
<DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
  <Link to="/help" className="w-full flex items-center">
    <HelpCircle className="mr-2 h-4 w-4" />
    Centro de Ayuda
  </Link>
</DropdownMenuItem>
```

## Funcionalidades del Sistema de Soporte

### 📚 **Preguntas Frecuentes (FAQs)**

#### **Categorías Implementadas**
- **Pacientes**: Gestión de fichas y búsqueda
- **Informes**: Generación y almacenamiento
- **Calendario**: Programación de citas
- **Búsqueda**: Funcionalidad universal
- **Facturación**: Información sobre exportación
- **Seguridad**: Protección de datos

#### **Características de las FAQs**
- ✅ **Markdown**: Respuestas con formato rico
- ✅ **Acordeón**: Expansión individual de preguntas
- ✅ **Categorización**: Agrupación visual por tema
- ✅ **Búsqueda**: Filtrado en tiempo real
- ✅ **Responsive**: Adaptado para móviles

### 🎥 **Tutoriales en Vídeo**

#### **Categorías de Tutoriales**
- **Primeros Pasos**: Onboarding y navegación básica
- **Informes**: Generación y gestión de informes
- **Pacientes**: Gestión avanzada de pacientes
- **Calendario**: Configuración y uso del calendario
- **Funciones Avanzadas**: Características avanzadas

#### **Características de los Tutoriales**
- ✅ **Reproducción integrada**: Modal con iframe de YouTube
- ✅ **Metadatos**: Duración, categoría, descripción
- ✅ **Grid responsive**: Adaptación automática
- ✅ **Búsqueda**: Filtrado por título y descripción
- ✅ **Acciones**: Ver en YouTube, cerrar modal

### 🔍 **Sistema de Búsqueda**

#### **Búsqueda en Tiempo Real**
- ✅ **Debounce**: 300ms para optimizar llamadas
- ✅ **Búsqueda cruzada**: FAQs y tutoriales simultáneamente
- ✅ **Resultados organizados**: Separados por tipo
- ✅ **Estados de carga**: Indicadores visuales
- ✅ **Sin resultados**: Mensaje amigable

#### **Funcionalidades de Búsqueda**
```typescript
// Búsqueda en FAQs
const faqResults = await searchFAQs(searchTerm);

// Búsqueda en tutoriales
const tutorialResults = await searchTutorials(searchTerm);

// Búsqueda combinada
const [faqResults, tutorialResults] = await Promise.all([
  searchFAQs(searchTerm),
  searchTutorials(searchTerm)
]);
```

## Integración con el Sistema

### 🔗 **Navegación Inteligente**

#### **Acceso desde Menú Principal**
- ✅ **Dropdown**: Enlace en menú de navegación
- ✅ **Ruta directa**: `/help` para acceso rápido
- ✅ **Iconografía**: Icono de ayuda consistente

#### **Integración con Búsqueda Universal**
- ✅ **Resultados de ayuda**: Aparecen en búsqueda universal
- ✅ **Navegación directa**: Clic para ir al centro de ayuda
- ✅ **Contexto**: Información relevante al usuario

### 🎨 **Interfaz Visual**

#### **Diseño del HelpCenter**
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="faqs">
      <HelpCircle className="h-4 w-4" />
      <span>Preguntas Frecuentes</span>
    </TabsTrigger>
    <TabsTrigger value="tutorials">
      <Video className="h-4 w-4" />
      <span>Vídeo Tutoriales</span>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

#### **Acordeón de FAQs**
```tsx
<Accordion type="multiple" className="w-full">
  {categories.map((category) => (
    <AccordionItem key={category.category} value={category.category}>
      <AccordionTrigger>
        <div className="flex items-center space-x-2">
          {getCategoryIcon(category.category)}
          <span className="font-medium">{category.category}</span>
          <Badge variant="secondary">{category.faqs.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {/* FAQs de la categoría */}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

#### **Grid de Tutoriales**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {tutorials.map((tutorial) => (
    <Card 
      key={tutorial.id} 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleTutorialClick(tutorial)}
    >
      {/* Contenido de la tarjeta */}
    </Card>
  ))}
</div>
```

## Datos de Prueba

### 📋 **FAQs de Ejemplo**
Se han insertado 14 FAQs organizadas en 6 categorías:
- **Pacientes** (3 FAQs): Crear, editar, buscar pacientes
- **Informes** (3 FAQs): Generar, guardar, editar informes
- **Calendario** (3 FAQs): Programar, modificar, ver citas
- **Búsqueda** (2 FAQs): Funcionamiento y filtros
- **Facturación** (2 FAQs): Exportación de datos
- **Seguridad** (2 FAQs): Protección y compartir datos

### 🎥 **Tutoriales de Ejemplo**
Se han insertado 15 tutoriales organizados en 5 categorías:
- **Primeros Pasos** (3 tutoriales): Bienvenida, crear paciente, navegar calendario
- **Informes** (3 tutoriales): Generar, guardar, editar informes
- **Pacientes** (3 tutoriales): Gestión avanzada, historial, búsqueda
- **Calendario** (3 tutoriales): Configurar agenda, gestionar citas, vistas
- **Funciones Avanzadas** (3 tutoriales): Búsqueda universal, Google Drive, exportar

## Configuración Técnica

### 🗄️ **Base de Datos**
```sql
-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON public.tutorials(category);

-- Triggers para updated_at
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_support_updated_at();
```

### ⚡ **Optimizaciones de Rendimiento**
- ✅ **Búsqueda con debounce**: 300ms para reducir llamadas
- ✅ **Carga paralela**: FAQs y tutoriales simultáneamente
- ✅ **Índices optimizados**: Para consultas por categoría
- ✅ **Lazy loading**: Contenido cargado bajo demanda

### 🎨 **Configuración del Componente**
```typescript
<HelpCenter />
// Incluye:
// - Búsqueda en tiempo real
// - Pestañas de FAQs y tutoriales
// - Modal de reproductor de vídeo
// - Estados de carga y error
```

## Flujo de Uso

### 1. **Acceso al Centro de Ayuda**
```
Usuario → Menú principal → "Centro de Ayuda" → /help
```

### 2. **Navegación por Pestañas**
```
Usuario → Pestaña "FAQs" → Acordeón por categorías
Usuario → Pestaña "Tutoriales" → Grid de vídeos
```

### 3. **Búsqueda de Contenido**
```
Usuario → Barra de búsqueda → Resultados en tiempo real
```

### 4. **Reproducción de Tutoriales**
```
Usuario → Clic en tutorial → Modal con reproductor → Ver en YouTube
```

## Próximos Pasos

### 1. **Contenido Dinámico**
- [ ] **Editor de FAQs**: Interfaz para administradores
- [ ] **Subida de vídeos**: Integración con YouTube API
- [ ] **Categorías personalizadas**: Gestión flexible
- [ ] **Contenido multilingüe**: Soporte para idiomas

### 2. **Analytics y Métricas**
- [ ] **Tutoriales más vistos**: Estadísticas de uso
- [ ] **FAQs más consultadas**: Análisis de búsquedas
- [ ] **Tiempo de visualización**: Métricas de engagement
- [ ] **Feedback de usuarios**: Sistema de valoraciones

### 3. **Funcionalidades Avanzadas**
- [ ] **Tutoriales interactivos**: Guías paso a paso
- [ ] **FAQs con imágenes**: Contenido multimedia
- [ ] **Búsqueda por voz**: Reconocimiento de voz
- [ ] **Chat de soporte**: Integración con chat en vivo

### 4. **Integración con IA**
- [ ] **Recomendaciones**: Contenido basado en uso
- [ ] **Búsqueda semántica**: Entender contexto
- [ ] **Generación automática**: FAQs basadas en uso
- [ ] **Asistente virtual**: IA para soporte

## Testing

### 🧪 **Pruebas de Funcionalidad**
1. **Carga de contenido**: Verificar que se cargan FAQs y tutoriales
2. **Búsqueda**: Probar búsqueda en tiempo real
3. **Reproducción**: Verificar modal de vídeo
4. **Navegación**: Probar pestañas y acordeón

### 📊 **Pruebas de Rendimiento**
```sql
-- Verificar FAQs
SELECT * FROM faqs WHERE is_active = true ORDER BY category, order_index;

-- Verificar tutoriales
SELECT * FROM tutorials WHERE is_active = true ORDER BY category, order_index;
```

### 🔗 **Pruebas de Integración**
- ✅ **Con navegación**: Verificar enlaces desde menú
- ✅ **Con búsqueda universal**: Verificar resultados de ayuda
- ✅ **Con responsive**: Probar en diferentes dispositivos
- ✅ **Con accesibilidad**: Verificar navegación por teclado

## Métricas de Éxito

- ✅ **Centro de ayuda completo**: FAQs y tutoriales funcionales
- ✅ **Búsqueda integrada**: Encuentra contenido rápidamente
- ✅ **Reproducción de vídeos**: Modal funcional con YouTube
- ✅ **UX intuitiva**: Navegación clara y accesible
- ✅ **Contenido relevante**: FAQs y tutoriales específicos
- ✅ **Responsive design**: Adaptado para todos los dispositivos
- ✅ **Rendimiento optimizado**: Carga rápida y búsqueda eficiente

**El módulo de Soporte está completo y funcional, proporcionando un centro de ayuda integrado que mejora la experiencia de onboarding, reduce la fricción y aumenta la autonomía y confianza del usuario, completando así el blueprint del MVP v1.0 de INFORIA.** 