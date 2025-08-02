# Nomenclatura Estandarizada de Archivos - INFORIA

## 🎯 Objetivo

Implementar una nomenclatura automática y estandarizada para los informes generados por INFORIA, asegurando consistencia, organización y facilidad de búsqueda en Google Drive.

## 📋 Formato de Nomenclatura

### Estructura del Nombre de Archivo
```
YYYY-MM-DD - [Nombre del Paciente] - [Tipo de Sesión]
```

### Ejemplos de Nomenclatura
- `2025-01-27 - María García - Primera Visita`
- `2025-01-27 - Carlos Ruiz - Seguimiento`
- `2025-01-27 - Ana Fernández - Alta`
- `2025-01-27 - Javier Moreno - Crisis`

## 🔧 Implementación Técnica

### 1. Edge Function `save-report` Refactorizada

#### Nuevos Parámetros
- `session_type`: Tipo de sesión (requerido)
- Eliminado: `report_title` (ahora se genera automáticamente)

#### Proceso de Generación del Nombre
```typescript
// 1. Obtener información del paciente
const { data: patient } = await supabaseAdmin
  .from('patients')
  .select('id, full_name')
  .eq('id', patient_id)
  .eq('user_id', user.id)
  .single();

// 2. Generar fecha en formato YYYY-MM-DD
const currentDate = new Date().toISOString().split('T')[0];

// 3. Crear nombre estandarizado
const reportTitle = `${currentDate} - ${patient.full_name} - ${session_type}`;
```

#### Validaciones Implementadas
- ✅ Verificación de que el paciente existe
- ✅ Verificación de acceso del usuario al paciente
- ✅ Validación del formato UUID del patient_id
- ✅ Validación de que session_type no esté vacío

### 2. Frontend Actualizado

#### Nuevo Componente: Selector de Tipo de Sesión
```typescript
const sessionTypes = [
  { value: "Primera Visita", label: "Primera Visita" },
  { value: "Seguimiento", label: "Seguimiento" },
  { value: "Alta", label: "Alta" },
  { value: "Evaluación", label: "Evaluación" },
  { value: "Crisis", label: "Crisis" },
  { value: "Mantenimiento", label: "Mantenimiento" }
];
```

#### Validaciones en el Frontend
- ✅ Campo requerido antes de generar informe
- ✅ Campo requerido antes de guardar informe
- ✅ Mensajes de error específicos

### 3. Servicio API Actualizado

#### Función `saveReport` Refactorizada
```typescript
export async function saveReport(
  patientId: string,
  reportContent: string,
  sessionType: string // Nuevo parámetro requerido
) {
  // Validaciones...
  
  const { data, error } = await supabase.functions.invoke('save-report', {
    body: {
      patient_id: patientId,
      report_content: reportContent.trim(),
      session_type: sessionType.trim() // Nuevo parámetro
    },
  });
}
```

## 📊 Tipos de Sesión Disponibles

### Categorías Principales
1. **Primera Visita**: Evaluación inicial del paciente
2. **Seguimiento**: Sesiones de seguimiento regular
3. **Alta**: Sesión final de alta del paciente
4. **Evaluación**: Evaluaciones específicas o tests
5. **Crisis**: Intervenciones en situaciones de crisis
6. **Mantenimiento**: Sesiones de mantenimiento a largo plazo

### Beneficios de la Categorización
- ✅ Organización automática en Google Drive
- ✅ Filtrado por tipo de sesión
- ✅ Análisis de patrones de tratamiento
- ✅ Reportes por tipo de intervención

## 🔍 Búsqueda y Organización

### En Google Drive
Los archivos se organizan automáticamente por:
- **Fecha**: Orden cronológico natural
- **Paciente**: Agrupación por paciente
- **Tipo**: Filtrado por tipo de sesión

### En INFORIA
- ✅ Lista de informes con nombre completo
- ✅ Filtrado por paciente
- ✅ Filtrado por tipo de sesión
- ✅ Búsqueda por nombre de archivo

## 🚀 Flujo de Trabajo Actualizado

### 1. Selección de Tipo de Sesión
```
Usuario → Selecciona tipo de sesión → Valida campo requerido
```

### 2. Generación de Informe
```
Usuario → Escribe notas → Genera informe → Valida tipo de sesión
```

### 3. Guardado con Nomenclatura
```
Sistema → Consulta paciente → Genera nombre → Crea Google Doc → Guarda metadatos
```

## 🔒 Seguridad y Validaciones

### Validaciones del Backend
- ✅ Verificación de existencia del paciente
- ✅ Verificación de permisos del usuario
- ✅ Validación de formato UUID
- ✅ Sanitización de strings

### Validaciones del Frontend
- ✅ Campo requerido antes de acciones
- ✅ Mensajes de error específicos
- ✅ Prevención de envío sin datos

## 📈 Beneficios de la Implementación

### Para el Usuario
- ✅ Nombres de archivo consistentes y organizados
- ✅ Fácil identificación de informes
- ✅ Búsqueda rápida en Google Drive
- ✅ Categorización automática

### Para el Sistema
- ✅ Estructura de datos consistente
- ✅ Validaciones robustas
- ✅ Trazabilidad completa
- ✅ Auditoría de sesiones

### Para la Organización
- ✅ Cumplimiento de estándares clínicos
- ✅ Organización automática de archivos
- ✅ Facilidad de backup y restauración
- ✅ Análisis de patrones de tratamiento

## 🧪 Testing y Verificación

### Casos de Prueba
1. **Caso Normal**: Paciente válido + tipo de sesión válido
2. **Caso Error**: Paciente no encontrado
3. **Caso Error**: Tipo de sesión vacío
4. **Caso Error**: UUID inválido
5. **Caso Error**: Usuario sin permisos

### Verificación de Resultados
- ✅ Nombre de archivo generado correctamente
- ✅ Google Doc creado con nombre correcto
- ✅ Metadatos guardados en base de datos
- ✅ URL de Google Drive funcional

## 🔄 Migración y Compatibilidad

### Informes Existentes
- ✅ Los informes existentes mantienen su nombre original
- ✅ No se afectan los datos históricos
- ✅ Compatibilidad hacia atrás

### Nuevos Informes
- ✅ Todos los nuevos informes usan nomenclatura estandarizada
- ✅ Aplicación inmediata del nuevo formato
- ✅ Validaciones activas desde el primer uso

## 📚 Documentación para Usuarios

### Guía de Tipos de Sesión

#### Primera Visita
- **Cuándo usar**: Primera sesión con el paciente
- **Contenido típico**: Evaluación inicial, historia clínica, objetivos
- **Ejemplo de nombre**: `2025-01-27 - María García - Primera Visita`

#### Seguimiento
- **Cuándo usar**: Sesiones regulares de tratamiento
- **Contenido típico**: Progreso, técnicas aplicadas, ajustes
- **Ejemplo de nombre**: `2025-01-27 - Carlos Ruiz - Seguimiento`

#### Alta
- **Cuándo usar**: Sesión final de tratamiento
- **Contenido típico**: Resumen de progreso, recomendaciones finales
- **Ejemplo de nombre**: `2025-01-27 - Ana Fernández - Alta`

#### Evaluación
- **Cuándo usar**: Tests específicos o evaluaciones
- **Contenido típico**: Resultados de tests, análisis específicos
- **Ejemplo de nombre**: `2025-01-27 - Javier Moreno - Evaluación`

#### Crisis
- **Cuándo usar**: Intervenciones urgentes
- **Contenido típico**: Evaluación de riesgo, intervención inmediata
- **Ejemplo de nombre**: `2025-01-27 - Pedro López - Crisis`

#### Mantenimiento
- **Cuándo usar**: Sesiones de seguimiento a largo plazo
- **Contenido típico**: Revisión de estado, ajustes menores
- **Ejemplo de nombre**: `2025-01-27 - Laura Martín - Mantenimiento`

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Filtros avanzados por tipo de sesión
- [ ] Estadísticas por tipo de intervención
- [ ] Plantillas específicas por tipo de sesión
- [ ] Notificaciones automáticas por tipo
- [ ] Reportes agregados por categoría

### Optimizaciones Técnicas
- [ ] Cache de nombres de pacientes
- [ ] Validación en tiempo real
- [ ] Autocompletado de tipos de sesión
- [ ] Historial de tipos usados por paciente

---

**La nomenclatura estandarizada de archivos está completamente implementada y operativa en INFORIA.** 📁✨ 