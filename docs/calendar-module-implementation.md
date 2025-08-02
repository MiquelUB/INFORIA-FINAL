# Módulo de Calendario Integrado - INFORIA

## Descripción General
Se ha implementado el módulo de "Calendario Integrado" para INFORIA, proporcionando una herramienta visual completa para la gestión de citas y sesiones terapéuticas. El calendario permite a los usuarios organizar su jornada laboral y centralizar la planificación de sus citas.

## Componentes Implementados

### 1. Base de Datos: Tabla `appointments`

**Archivo**: `supabase/migrations/20250725000002_create_appointments_table.sql`

**Estructura de la tabla**:
```sql
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL, -- Referencia a patients
    title TEXT NOT NULL,
    description TEXT, -- Descripción opcional
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    appointment_type TEXT DEFAULT 'session' CHECK (appointment_type IN ('session', 'consultation', 'follow_up', 'initial_assessment')),
    location TEXT, -- Ubicación opcional
    notes TEXT, -- Notas privadas del terapeuta
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Características de seguridad**:
- ✅ **Row Level Security (RLS)**: Usuarios solo ven sus propias citas
- ✅ **Índices optimizados**: Para consultas eficientes por fecha y usuario
- ✅ **Validaciones**: Estados y tipos de cita predefinidos
- ✅ **Triggers**: Actualización automática de `updated_at`

### 2. Servicio API: `appointmentApi.ts`

**Archivo**: `src/services/appointmentApi.ts`

**Funciones implementadas**:
- ✅ **getAppointments()**: Obtiene todas las citas del usuario
- ✅ **getAppointmentsByDateRange()**: Citas en rango específico
- ✅ **createAppointment()**: Crear nueva cita
- ✅ **updateAppointment()**: Actualizar cita existente
- ✅ **deleteAppointment()**: Eliminar cita
- ✅ **getAppointmentById()**: Obtener cita específica
- ✅ **updateAppointmentStatus()**: Cambiar estado de cita

**Interfaces TypeScript**:
```typescript
interface Appointment {
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
```

### 3. Modal de Nueva Cita: `NewAppointmentModal.tsx`

**Archivo**: `src/components/NewAppointmentModal.tsx`

**Funcionalidades**:
- ✅ **Formulario completo**: Todos los campos necesarios para crear una cita
- ✅ **Selección de paciente**: Dropdown con lista de pacientes
- ✅ **Tipos de cita**: Sesión, consulta, seguimiento, evaluación inicial
- ✅ **Fechas y horas**: Inputs datetime-local para precisión
- ✅ **Ubicación**: Campo para especificar lugar de la cita
- ✅ **Descripción y notas**: Campos opcionales para detalles
- ✅ **Validaciones**: Verificación de campos requeridos
- ✅ **Integración**: Conectado con el servicio API

**Campos del formulario**:
- Paciente (requerido)
- Título de la cita (requerido)
- Tipo de cita
- Fecha y hora de inicio (requerido)
- Fecha y hora de fin (requerido)
- Ubicación
- Descripción
- Notas privadas

### 4. Vista Principal: `CalendarView.tsx`

**Archivo**: `pages/CalendarView.tsx`

**Características principales**:
- ✅ **react-big-calendar**: Librería robusta para calendarios
- ✅ **Localización española**: Configurado con date-fns/es
- ✅ **Vistas múltiples**: Mes, semana, día, agenda
- ✅ **Interactividad**: Clic en slots vacíos para crear citas
- ✅ **Eventos personalizados**: Colores por estado de cita
- ✅ **Barra de herramientas**: Navegación y controles personalizados
- ✅ **Estadísticas**: Dashboard con métricas de citas
- ✅ **Responsive**: Adaptado para diferentes tamaños de pantalla

**Componentes personalizados**:
```typescript
// Evento personalizado con colores por estado
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "no_show": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };
  // ... renderizado del evento
};

// Barra de herramientas personalizada
const ToolbarComponent = (toolbar: any) => {
  // Controles de navegación y vistas
};
```

### 5. Rutas: Actualización de `App.tsx`

**Archivo**: `App.tsx`

**Nueva ruta añadida**:
```tsx
{/* Calendar Routes */}
<Route path="/calendar" element={<CalendarView />} />
```

## Funcionalidades del Calendario

### 📅 **Vistas Disponibles**
- **Mes**: Vista mensual completa
- **Semana**: Vista semanal detallada
- **Día**: Vista diaria con slots de tiempo
- **Agenda**: Lista cronológica de eventos

### 🎯 **Interactividad**
- **Clic en slot vacío**: Abre modal para crear nueva cita
- **Clic en evento**: Selecciona cita existente (preparado para edición)
- **Navegación**: Botones para anterior/siguiente/hoy
- **Cambio de vista**: Botones para cambiar entre vistas

### 📊 **Estadísticas en Tiempo Real**
- **Total de citas**: Número total de citas del usuario
- **Citas de hoy**: Citas programadas para hoy
- **Próximas citas**: Citas futuras
- **Citas completadas**: Citas con estado 'completed'
- **Citas canceladas**: Citas con estado 'cancelled'

### 🎨 **Personalización Visual**
- **Colores por estado**: Verde (completada), Rojo (cancelada), Amarillo (no show), Azul (programada)
- **Información detallada**: Título, hora de inicio y fin en cada evento
- **Responsive design**: Adaptado para móviles y desktop

## Integración con el Sistema

### 🔗 **Conexión con Pacientes**
- ✅ **Selección de paciente**: Dropdown con lista de pacientes del usuario
- ✅ **Datos de paciente**: Información completa en el modal
- ✅ **Relación bidireccional**: Citas vinculadas a pacientes específicos

### 🔐 **Seguridad y Permisos**
- ✅ **RLS activado**: Usuarios solo ven sus propias citas
- ✅ **Validación de usuario**: Verificación de autenticación en cada operación
- ✅ **Propiedad de datos**: Cada cita pertenece al usuario que la creó

### 📱 **Experiencia de Usuario**
- ✅ **Feedback visual**: Toast notifications para acciones
- ✅ **Estados de carga**: Indicadores durante operaciones
- ✅ **Validaciones**: Mensajes de error claros
- ✅ **Navegación intuitiva**: Flujo natural entre componentes

## Datos de Prueba

### 📋 **Citas de Ejemplo**
Se han insertado 8 citas de ejemplo para desarrollo:
- Sesiones de seguimiento con María García
- Evaluación inicial con Carlos Ruiz
- Sesiones EMDR con Ana Fernández
- Terapia de pareja con Javier Moreno

### 👥 **Pacientes de Prueba**
Los mismos pacientes del sistema de gestión:
- María García López (Ansiedad, Terapia Cognitiva)
- Carlos Ruiz Mendez (Depresión, Mindfulness)
- Ana Fernández Silva (Trauma, EMDR)
- Javier Moreno Castro (Pareja, Sistémica)

## Configuración Técnica

### 📦 **Dependencias Requeridas**
```bash
npm install react-big-calendar date-fns
```

### 🎨 **Estilos CSS**
```css
/* Importar estilos de react-big-calendar */
import "react-big-calendar/lib/css/react-big-calendar.css";
```

### 🌍 **Localización**
```typescript
// Configuración para español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
```

## Flujo de Uso

### 1. **Acceso al Calendario**
```
Usuario → Navega a /calendar → Ve vista de calendario
```

### 2. **Crear Nueva Cita**
```
Usuario → Clic en slot vacío → Modal se abre → Llena formulario → Clic "Crear Cita"
```

### 3. **Ver Citas Existentes**
```
Usuario → Navega por calendario → Ve citas con colores por estado → Clic en cita para detalles
```

### 4. **Gestión de Citas**
```
Usuario → Selecciona cita → Opciones de editar/cancelar → Actualiza estado
```

## Próximos Pasos

### 1. **Funcionalidades Avanzadas**
- [ ] **Edición de citas**: Modal para editar citas existentes
- [ ] **Eliminación de citas**: Confirmación y eliminación
- [ ] **Cambio de estado**: Botones para marcar como completada/cancelada
- [ ] **Recurrencia**: Citas recurrentes (semanal, mensual)

### 2. **Integración con Sesiones**
- [ ] **Crear sesión desde cita**: Botón para iniciar sesión desde cita
- [ ] **Vincular informes**: Conectar citas con informes generados
- [ ] **Notas de sesión**: Añadir notas durante la cita

### 3. **Notificaciones**
- [ ] **Recordatorios**: Notificaciones antes de citas
- [ ] **Confirmaciones**: Sistema de confirmación de asistencia
- [ ] **Alertas**: Notificaciones de citas próximas

### 4. **Analytics**
- [ ] **Métricas de uso**: Estadísticas de citas por período
- [ ] **Reportes**: Exportación de agenda
- [ ] **Dashboard**: Vista general de actividad

## Testing

### 🧪 **Pruebas de Funcionalidad**
1. **Crear cita**: Verificar que se guarda correctamente
2. **Ver citas**: Confirmar que aparecen en el calendario
3. **Navegación**: Probar cambio entre vistas
4. **Interactividad**: Clic en slots y eventos

### 📊 **Pruebas de Datos**
```sql
-- Verificar citas del usuario
SELECT * FROM appointments WHERE user_id = 'user_id';

-- Verificar estadísticas
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM appointments WHERE user_id = 'user_id';
```

### 🔗 **Pruebas de Integración**
- ✅ **Con pacientes**: Verificar que se pueden seleccionar pacientes
- ✅ **Con autenticación**: Confirmar que solo ve sus propias citas
- ✅ **Con navegación**: Probar flujo completo de creación

## Métricas de Éxito

- ✅ **Calendario funcional**: Vista completa y operativa
- ✅ **Creación de citas**: Modal funcional con validaciones
- ✅ **Integración con pacientes**: Conexión bidireccional
- ✅ **Seguridad**: RLS y validaciones implementadas
- ✅ **UX profesional**: Interfaz intuitiva y responsive
- ✅ **Localización**: Configurado para español
- ✅ **Estadísticas**: Dashboard con métricas útiles

**El módulo de Calendario Integrado está completo y funcional, proporcionando una herramienta profesional para la gestión de citas terapéuticas con máxima seguridad y usabilidad.** 