# Implementación: Guardado de Informes en Base de Datos

## Descripción General
Se ha implementado una funcionalidad completa para persistir informes generados por IA en la base de datos de Supabase. Esta implementación transforma la aplicación de una herramienta puntual a un sistema de registro clínico.

## Componentes Implementados

### 1. Base de Datos: Tabla `reports`

**Archivo**: `supabase/migrations/20250725000000_create_reports_table.sql`

**Estructura**:
```sql
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL, -- Referenciará a la tabla patients cuando se cree
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Características**:
- ✅ **Clave primaria UUID** autogenerada
- ✅ **Timestamps** automáticos (created_at, updated_at)
- ✅ **Relación con usuarios** (user_id → auth.users)
- ✅ **Preparado para pacientes** (patient_id)
- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Políticas de seguridad** por usuario
- ✅ **Índices optimizados** para consultas frecuentes

### 2. Backend: Edge Function `save-report`

**Archivo**: `supabase/functions/save-report/index.ts`

**Funcionalidades**:
- ✅ **Autenticación**: Verifica sesión del usuario
- ✅ **Validación**: Valida patient_id y content
- ✅ **Seguridad**: Valida formato UUID
- ✅ **Persistencia**: Inserta en tabla reports
- ✅ **Respuesta estructurada**: Devuelve ID y timestamp
- ✅ **Manejo de errores**: Errores descriptivos

**Endpoint**: `POST /functions/v1/save-report`

**Payload**:
```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "# Informe de Sesión\n\nContenido del informe en Markdown..."
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Report saved successfully",
  "report": {
    "id": "generated-uuid",
    "created_at": "2025-07-25T10:30:00Z"
  }
}
```

### 3. Frontend: Servicio API Actualizado

**Archivo**: `src/services/reportApi.ts`

**Nueva función**: `saveReport(patientId: string, content: string)`

**Características**:
- ✅ **Validación de entrada**: Verifica parámetros
- ✅ **Validación UUID**: Comprueba formato de patient_id
- ✅ **Autenticación**: Verifica sesión activa
- ✅ **Llamada a Edge Function**: Invoca save-report
- ✅ **Manejo de errores**: Errores descriptivos

### 4. Frontend: Componente Modal Actualizado

**Archivo**: `src/components/ReportDisplayModal.tsx`

**Nuevas props**:
```tsx
interface ReportDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  onSave?: (content: string) => Promise<void>; // Nueva
  isSaving?: boolean; // Nueva
}
```

**Nuevo botón**: "Guardar Informe"
- ✅ **Estado de carga**: "Guardando..." durante la petición
- ✅ **Feedback visual**: Icono de Save y color verde
- ✅ **Manejo de errores**: Toast de error si falla
- ✅ **Confirmación**: Toast de éxito al guardar

### 5. Frontend: Integración en SessionWorkspace

**Archivo**: `pages/SessionWorkspace.tsx`

**Nuevos estados**:
```tsx
const [isSaving, setIsSaving] = useState<boolean>(false);
const TEST_PATIENT_ID = "550e8400-e29b-41d4-a716-446655440000";
```

**Nueva función**: `handleSaveReport(content: string)`
- ✅ **Estado de carga**: Controla isSaving
- ✅ **Llamada al servicio**: Invoca saveReport
- ✅ **Manejo de errores**: Re-lanza errores para el modal
- ✅ **Feedback**: Toast de confirmación

## Flujo Completo de Guardado

### 1. Usuario Genera Informe
```
Usuario → "Generar Informe con IA" → Edge Function informe-inteligente
```

### 2. Modal Se Abre
```
Respuesta IA → ReportDisplayModal → Visualización del informe
```

### 3. Usuario Guarda Informe
```
Usuario → "Guardar Informe" → handleSaveReport → saveReport → Edge Function save-report
```

### 4. Persistencia en Base de Datos
```
Edge Function → Validación → Inserción en tabla reports → Respuesta exitosa
```

### 5. Confirmación al Usuario
```
Respuesta → Toast de éxito → Modal actualizado
```

## Seguridad Implementada

### Row Level Security (RLS)
```sql
-- Usuarios solo pueden ver sus propios informes
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

-- Usuarios solo pueden insertar sus propios informes
CREATE POLICY "Users can insert their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Validaciones
- ✅ **Autenticación**: Verificación de JWT
- ✅ **Autorización**: Usuario solo accede a sus datos
- ✅ **Validación de entrada**: UUID y contenido requeridos
- ✅ **Sanitización**: Content se trima automáticamente

## Consideraciones Técnicas

### UUID de Prueba
```tsx
const TEST_PATIENT_ID = "550e8400-e29b-41d4-a716-446655440000";
```
**Nota**: Este UUID hardcodeado será reemplazado cuando se implemente el sistema de gestión de pacientes.

### Manejo de Estados
- ✅ **isGenerating**: Durante generación del informe
- ✅ **isSaving**: Durante guardado en base de datos
- ✅ **Feedback visual**: Botones deshabilitados durante operaciones

### Optimizaciones de Base de Datos
- ✅ **Índices**: Para user_id, patient_id, created_at
- ✅ **Triggers**: Actualización automática de updated_at
- ✅ **Cascade**: Eliminación automática al eliminar usuario

## Próximos Pasos

### 1. Sistema de Pacientes
- [ ] Crear tabla `patients`
- [ ] Implementar selección de paciente en UI
- [ ] Conectar con UUID dinámico

### 2. Gestión de Informes
- [ ] Lista de informes guardados
- [ ] Edición de informes existentes
- [ ] Eliminación de informes

### 3. Búsqueda y Filtros
- [ ] Búsqueda por paciente
- [ ] Filtros por fecha
- [ ] Exportación masiva

### 4. Auditoría
- [ ] Logs de creación/edición
- [ ] Historial de cambios
- [ ] Backup automático

## Testing

### Pruebas de Base de Datos
```sql
-- Verificar que la tabla existe
SELECT * FROM information_schema.tables WHERE table_name = 'reports';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'reports';
```

### Pruebas de Edge Function
```bash
# Probar función localmente
npx supabase functions serve

# Llamada de prueba
curl -X POST http://localhost:54321/functions/v1/save-report \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"550e8400-e29b-41d4-a716-446655440000","content":"# Test Report"}'
```

### Pruebas de Frontend
1. Generar informe
2. Abrir modal
3. Hacer clic en "Guardar Informe"
4. Verificar toast de confirmación
5. Verificar registro en base de datos

## Troubleshooting

### Error: "Authentication failed"
- Verificar que el usuario esté logueado
- Verificar JWT válido
- Revisar variables de entorno de Supabase

### Error: "patient_id must be a valid UUID"
- Verificar formato del UUID
- Usar UUID válido de prueba

### Error: "Failed to save report to database"
- Verificar conexión a Supabase
- Revisar logs de la Edge Function
- Verificar permisos de la tabla

### El botón "Guardar" no aparece
- Verificar que onSave esté definido
- Verificar que isSaving esté correctamente pasado

## Métricas de Éxito

- ✅ **Funcionalidad básica**: Guardado de informes funciona
- ✅ **Seguridad**: RLS y validaciones implementadas
- ✅ **UX**: Feedback visual durante operaciones
- ✅ **Escalabilidad**: Estructura preparada para crecimiento
- ✅ **Mantenibilidad**: Código bien documentado y estructurado 