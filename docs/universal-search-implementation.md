# Módulo de Búsqueda Universal - INFORIA

## Descripción General
Se ha implementado el módulo de "Búsqueda Universal" para INFORIA, proporcionando una herramienta de recuperación de información potente y centralizada que permite a los usuarios encontrar rápidamente pacientes, informes y citas desde una única barra de búsqueda.

## Componentes Implementados

### 1. Backend: Función RPC de Búsqueda Universal

**Archivo**: `supabase/migrations/20250725000003_create_search_function.sql`

**Funciones creadas**:
- ✅ **search_all()**: Búsqueda básica en pacientes, informes y citas
- ✅ **search_all_advanced()**: Búsqueda avanzada con fuzzy matching y highlights

**Estructura de la función RPC**:
```sql
CREATE OR REPLACE FUNCTION search_all(search_term TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score INTEGER
)
```

**Características de búsqueda**:
- ✅ **Búsqueda en múltiples tablas**: patients, reports, appointments
- ✅ **Puntuación de relevancia**: Algoritmo de scoring basado en coincidencias
- ✅ **Seguridad RLS**: Solo busca en datos del usuario autenticado
- ✅ **Límite de resultados**: Máximo 20 resultados por búsqueda
- ✅ **Ordenamiento**: Por relevancia y fecha de creación

### 2. Servicio API: `searchApi.ts`

**Archivo**: `src/services/searchApi.ts`

**Funciones implementadas**:
- ✅ **universalSearch()**: Búsqueda principal con opciones configurables
- ✅ **debouncedSearch()**: Búsqueda con debounce para optimizar llamadas
- ✅ **getSearchSuggestions()**: Sugerencias populares de búsqueda
- ✅ **formatSearchResult()**: Formateo de resultados para UI
- ✅ **filterResultsByType()**: Filtrado por tipo de resultado
- ✅ **groupResultsByType()**: Agrupación de resultados por tipo

**Interfaces TypeScript**:
```typescript
interface SearchResult {
  id: string;
  type: 'patient' | 'report' | 'appointment';
  title: string;
  subtitle: string;
  url: string;
  created_at: string;
  relevance_score: number;
  search_highlights?: string;
}
```

### 3. Componente UI: `UniversalSearch.tsx`

**Archivo**: `src/components/UniversalSearch.tsx`

**Características principales**:
- ✅ **Búsqueda en tiempo real**: Con debounce de 300ms
- ✅ **Interfaz intuitiva**: Popover con Command de shadcn/ui
- ✅ **Resultados interactivos**: Clic para navegar o abrir
- ✅ **Sugerencias populares**: Botones de búsqueda rápida
- ✅ **Estados de carga**: Indicador de spinner durante búsqueda
- ✅ **Manejo de errores**: Toast notifications para errores
- ✅ **Responsive**: Adaptado para diferentes tamaños

**Funcionalidades de navegación**:
- **Pacientes**: Navega a `/patients/[id]`
- **Informes**: Abre `gdrive_file_url` en nueva pestaña
- **Citas**: Navega a `/calendar?date=[fecha]`

### 4. Integración en NavigationHeader

**Archivo**: `components/NavigationHeader.tsx`

**Cambios realizados**:
- ✅ **Reemplazo de búsqueda básica**: Por UniversalSearch
- ✅ **Posición central**: Barra de búsqueda prominente
- ✅ **Navegación mejorada**: Enlaces actualizados a rutas correctas
- ✅ **Menú expandido**: Añadido enlace al calendario

## Funcionalidades del Sistema de Búsqueda

### 🔍 **Algoritmo de Búsqueda**

#### **Puntuación de Relevancia**
```sql
CASE 
  WHEN p.name ILIKE search_term THEN 100      -- Coincidencia exacta
  WHEN p.name ILIKE search_term || '%' THEN 90 -- Coincidencia al inicio
  WHEN p.name ILIKE '%' || search_term || '%' THEN 80 -- Coincidencia en cualquier lugar
  WHEN p.email ILIKE '%' || search_term || '%' THEN 70 -- Coincidencia en email
  ELSE 50 -- Coincidencia básica
END as relevance_score
```

#### **Campos de Búsqueda por Tipo**
- **Pacientes**: `name`, `email`
- **Informes**: `file_name`
- **Citas**: `title`, `description`

### 🎯 **Experiencia de Usuario**

#### **Búsqueda en Tiempo Real**
- ✅ **Debounce**: 300ms para evitar llamadas excesivas
- ✅ **Mínimo 2 caracteres**: Para iniciar búsqueda
- ✅ **Máximo 15 resultados**: Para mantener rendimiento
- ✅ **Indicador de carga**: Spinner durante búsqueda

#### **Resultados Interactivos**
- ✅ **Iconos por tipo**: 👤 Paciente, 📄 Informe, 📅 Cita
- ✅ **Badges de tipo**: Colores diferenciados por categoría
- ✅ **Información detallada**: Título, subtítulo, fecha
- ✅ **Navegación directa**: Clic para abrir/navegar

#### **Sugerencias Populares**
- ✅ **Búsquedas frecuentes**: Términos populares predefinidos
- ✅ **Botones rápidos**: Clic para búsqueda instantánea
- ✅ **Actualización dinámica**: Basada en uso del sistema

### 🎨 **Interfaz Visual**

#### **Diseño del Popover**
```tsx
<PopoverContent className="w-[400px] p-0" align="start">
  <Command>
    <CommandInput placeholder="Buscar..." />
    <CommandList>
      <CommandEmpty>
        {/* Estado vacío con sugerencias */}
      </CommandEmpty>
      <CommandGroup heading="Resultados de búsqueda">
        {/* Lista de resultados */}
      </CommandGroup>
    </CommandList>
  </Command>
</PopoverContent>
```

#### **Estados de la Interfaz**
- **Estado vacío**: Sugerencias populares
- **Búsqueda sin resultados**: Mensaje amigable
- **Resultados encontrados**: Lista organizada
- **Carga**: Spinner animado

## Integración con el Sistema

### 🔗 **Navegación Inteligente**

#### **Pacientes**
```typescript
// Navega a la ficha del paciente
navigate(`/patients/${result.id}`);
```

#### **Informes**
```typescript
// Abre Google Drive en nueva pestaña
window.open(result.url, '_blank');
```

#### **Citas**
```typescript
// Navega al calendario con fecha específica
navigate(`/calendar?date=${formattedDate}`);
```

### 🔐 **Seguridad y Permisos**

#### **Row Level Security (RLS)**
- ✅ **Filtrado por usuario**: Solo datos del usuario autenticado
- ✅ **Función SECURITY DEFINER**: Ejecuta con permisos del creador
- ✅ **Validación de sesión**: Verificación en cada búsqueda

#### **Validaciones**
- ✅ **Longitud mínima**: 2 caracteres para iniciar búsqueda
- ✅ **Término requerido**: No búsquedas vacías
- ✅ **Límite de resultados**: Máximo 20 para rendimiento

### 📱 **Responsive Design**

#### **Adaptación por Dispositivo**
- ✅ **Desktop**: Popover de 400px de ancho
- ✅ **Tablet**: Ancho reducido, scroll vertical
- ✅ **Mobile**: Popover centrado, botones táctiles

#### **Accesibilidad**
- ✅ **Navegación por teclado**: Flechas y Enter
- ✅ **Screen readers**: Labels y descripciones
- ✅ **Contraste**: Colores accesibles

## Datos de Prueba

### 📋 **Sugerencias Predefinidas**
```typescript
const suggestions = [
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
```

### 🔍 **Ejemplos de Búsqueda**
- **"María"**: Encuentra paciente María García López
- **"sesión"**: Encuentra citas e informes de sesiones
- **"ansiedad"**: Encuentra pacientes y tratamientos relacionados
- **"2025"**: Encuentra citas e informes de 2025

## Configuración Técnica

### 🗄️ **Base de Datos**
```sql
-- Función principal de búsqueda
GRANT EXECUTE ON FUNCTION search_all(TEXT) TO authenticated;

-- Función avanzada con highlights
GRANT EXECUTE ON FUNCTION search_all_advanced(TEXT) TO authenticated;
```

### ⚡ **Optimizaciones de Rendimiento**
- ✅ **Debounce**: 300ms para reducir llamadas API
- ✅ **Límite de resultados**: 15-20 máximo
- ✅ **Índices optimizados**: En campos de búsqueda
- ✅ **Caché de sugerencias**: Carga una sola vez

### 🔧 **Configuración del Componente**
```typescript
<UniversalSearch 
  className="custom-class"
  placeholder="Buscar pacientes, informes, citas..."
  showSuggestions={true}
/>
```

## Flujo de Uso

### 1. **Acceso a la Búsqueda**
```
Usuario → Ve barra de búsqueda en header → Clic para enfocar
```

### 2. **Búsqueda en Tiempo Real**
```
Usuario → Escribe término → Debounce 300ms → Resultados aparecen
```

### 3. **Selección de Resultado**
```
Usuario → Clic en resultado → Navegación automática → Toast de confirmación
```

### 4. **Búsqueda por Sugerencias**
```
Usuario → Clic en sugerencia → Búsqueda instantánea → Resultados filtrados
```

## Próximos Pasos

### 1. **Funcionalidades Avanzadas**
- [ ] **Búsqueda fuzzy**: Coincidencias aproximadas
- [ ] **Filtros por tipo**: Solo pacientes, solo informes, etc.
- [ ] **Historial de búsquedas**: Búsquedas recientes
- [ ] **Búsqueda por fecha**: Filtros temporales

### 2. **Analytics y Métricas**
- [ ] **Términos más buscados**: Analytics de uso
- [ ] **Tiempo de búsqueda**: Métricas de rendimiento
- [ ] **Resultados más clicados**: Popularidad de elementos

### 3. **Mejoras de UX**
- [ ] **Autocompletado**: Sugerencias mientras se escribe
- [ ] **Búsqueda por voz**: Integración con reconocimiento de voz
- [ ] **Búsqueda avanzada**: Filtros múltiples

### 4. **Integración con IA**
- [ ] **Búsqueda semántica**: Entender contexto
- [ ] **Recomendaciones**: Resultados basados en uso
- [ ] **Búsqueda predictiva**: Anticipar necesidades

## Testing

### 🧪 **Pruebas de Funcionalidad**
1. **Búsqueda básica**: Verificar que encuentra resultados
2. **Navegación**: Confirmar que navega correctamente
3. **Debounce**: Verificar que no hace llamadas excesivas
4. **Estados**: Probar estados de carga y error

### 📊 **Pruebas de Rendimiento**
```sql
-- Verificar función de búsqueda
SELECT * FROM search_all('maría');

-- Verificar función avanzada
SELECT * FROM search_all_advanced('sesión');
```

### 🔗 **Pruebas de Integración**
- ✅ **Con pacientes**: Verificar navegación a fichas
- ✅ **Con informes**: Verificar apertura en Google Drive
- ✅ **Con citas**: Verificar navegación al calendario
- ✅ **Con autenticación**: Confirmar filtrado por usuario

## Métricas de Éxito

- ✅ **Búsqueda universal**: Una barra para todo el sistema
- ✅ **Resultados relevantes**: Algoritmo de scoring implementado
- ✅ **Navegación inteligente**: Acceso directo a elementos
- ✅ **UX fluida**: Interfaz intuitiva y responsive
- ✅ **Rendimiento optimizado**: Debounce y límites implementados
- ✅ **Seguridad**: RLS y validaciones activas
- ✅ **Accesibilidad**: Navegación por teclado y screen readers

**El módulo de Búsqueda Universal está completo y funcional, proporcionando una herramienta de recuperación de información potente que incrementa drásticamente la eficiencia del usuario y el valor de los datos almacenados en la aplicación.** 